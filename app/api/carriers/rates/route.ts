import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { carrierService } from '@/lib/carriers';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { rateLimit } from '@/lib/rate-limit';

// Rate limiting
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// Validation schemas
const addressSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(2),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

const packageSchema = z.object({
  weight: z.number().positive(),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  value: z.number().positive().optional(),
  description: z.string().optional()
});

const rateRequestSchema = z.object({
  from: addressSchema,
  to: addressSchema,
  packages: z.array(packageSchema).min(1),
  serviceTypes: z.array(z.string()).optional(),
  carriers: z.array(z.string()).optional(),
  options: z.object({
    signatureRequired: z.boolean().optional(),
    saturdayDelivery: z.boolean().optional(),
    insurance: z.number().optional(),
    codAmount: z.number().optional(),
    dryIce: z.boolean().optional(),
    hazmat: z.boolean().optional()
  }).optional()
});

const compareRatesSchema = z.object({
  shipments: z.array(rateRequestSchema).min(1).max(10)
});

// POST /api/carriers/rates - Get shipping rates
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    await limiter.check(request, 15, 'CACHE_TOKEN');

    // Authentication
    const user = await authService.getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if it's a comparison request
    const isComparisonRequest = Array.isArray(body.shipments);
    
    if (isComparisonRequest) {
      const validatedData = compareRatesSchema.parse(body);
      const comparisonResults = [];

      for (let i = 0; i < validatedData.shipments.length; i++) {
        const shipmentRequest = validatedData.shipments[i];
        try {
          const rates = await getRatesForShipment(shipmentRequest, user.id, request);
          comparisonResults.push({
            shipmentIndex: i,
            rates,
            success: true
          });
        } catch (error) {
          comparisonResults.push({
            shipmentIndex: i,
            error: error instanceof Error ? error.message : 'Rate calculation failed',
            success: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        comparison: comparisonResults,
        totalShipments: validatedData.shipments.length,
        successful: comparisonResults.filter(r => r.success).length
      });
    } else {
      const validatedData = rateRequestSchema.parse(body);
      const rates = await getRatesForShipment(validatedData, user.id, request);

      return NextResponse.json({
        success: true,
        rates,
        availableCarriers: carrierService.getAvailableCarriers(),
        requestId: generateRequestId()
      });
    }
  } catch (error) {
    console.error('Rate request error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get shipping rates' },
      { status: 500 }
    );
  }
}

// GET /api/carriers/rates - Get cached rates or rate history
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const user = await authService.getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (requestId) {
      // Get specific rate request
      const rateRequest = await prisma.rateRequest.findFirst({
        where: {
          id: requestId,
          userId: user.id
        },
        include: {
          rates: true
        }
      });

      if (!rateRequest) {
        return NextResponse.json(
          { error: 'Rate request not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        rateRequest
      });
    } else {
      // Get rate history
      const rateHistory = await prisma.rateRequest.findMany({
        where: {
          userId: user.id
        },
        include: {
          rates: {
            orderBy: {
              cost: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      const totalCount = await prisma.rateRequest.count({
        where: {
          userId: user.id
        }
      });

      return NextResponse.json({
        success: true,
        rateHistory,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      });
    }
  } catch (error) {
    console.error('Get rates error:', error);
    return NextResponse.json(
      { error: 'Failed to get rate information' },
      { status: 500 }
    );
  }
}

// Helper function to get rates for a single shipment
async function getRatesForShipment(
  shipmentRequest: z.infer<typeof rateRequestSchema>,
  userId: string,
  request: NextRequest
) {
  // Get rates from specified carriers or all available carriers
  const targetCarriers = shipmentRequest.carriers || carrierService.getAvailableCarriers();
  const allRates = [];
  const errors = [];

  for (const carrierName of targetCarriers) {
    const carrier = carrierService.getCarrier(carrierName);
    if (!carrier) {
      errors.push(`Carrier ${carrierName} not available`);
      continue;
    }

    try {
      // If specific service types are requested, get rates for each
      if (shipmentRequest.serviceTypes && shipmentRequest.serviceTypes.length > 0) {
        for (const serviceType of shipmentRequest.serviceTypes) {
          try {
            const request = {
              from: shipmentRequest.from,
              to: shipmentRequest.to,
              packages: shipmentRequest.packages,
              serviceType,
              options: shipmentRequest.options
            };
            const rates = await carrier.getRates(request);
            allRates.push(...rates.map(rate => ({
              ...rate,
              requestedService: serviceType
            })));
          } catch (serviceError) {
            errors.push(`${carrierName} ${serviceType}: ${serviceError}`);
          }
        }
      } else {
        // Get rates for all available services
        const services = carrier.getServices();
        for (const service of services.slice(0, 5)) { // Limit to 5 services per carrier
          try {
            const request = {
              from: shipmentRequest.from,
              to: shipmentRequest.to,
              packages: shipmentRequest.packages,
              serviceType: service.code,
              options: shipmentRequest.options
            };
            const rates = await carrier.getRates(request);
            allRates.push(...rates.map(rate => ({
              ...rate,
              serviceDescription: service.description,
              requestedService: service.code
            })));
          } catch (serviceError) {
            errors.push(`${carrierName} ${service.code}: ${serviceError}`);
          }
        }
      }

      // Log successful carrier activity
      await carrierService.logCarrierActivity(
        carrierName,
        'rate_request',
        undefined,
        {
          from: shipmentRequest.from.city,
          to: shipmentRequest.to.city,
          packages: shipmentRequest.packages.length,
          services: shipmentRequest.serviceTypes?.length || 'all'
        }
      );
    } catch (error) {
      console.error(`Failed to get rates from ${carrierName}:`, error);
      errors.push(`${carrierName}: ${error}`);
    }
  }

  // Sort rates by cost
  const sortedRates = allRates.sort((a, b) => a.cost - b.cost);

  // Add calculated fields
  const enhancedRates = sortedRates.map((rate, index) => ({
    ...rate,
    rank: index + 1,
    savings: index > 0 ? sortedRates[0].cost - rate.cost : 0,
    percentageSavings: index > 0 ? 
      ((rate.cost - sortedRates[0].cost) / sortedRates[0].cost * 100) : 0
  }));

  // Store rate request in database
  const requestId = generateRequestId();
  await prisma.rateRequest.create({
    data: {
      id: requestId,
      userId,
      fromAddress: shipmentRequest.from,
      toAddress: shipmentRequest.to,
      packages: shipmentRequest.packages,
      requestedCarriers: targetCarriers,
      requestedServices: shipmentRequest.serviceTypes || [],
      options: shipmentRequest.options || {},
      rates: {
        create: enhancedRates.map(rate => ({
          carrier: rate.carrier,
          service: rate.service,
          cost: rate.cost,
          currency: rate.currency,
          transitTime: rate.transitTime,
          deliveryDate: rate.deliveryDate,
          guaranteedDelivery: rate.guaranteedDelivery || false,
          rank: rate.rank,
          metadata: {
            requestedService: rate.requestedService,
            serviceDescription: rate.serviceDescription,
            savings: rate.savings,
            percentageSavings: rate.percentageSavings
          }
        }))
      },
      errors: errors.length > 0 ? errors : undefined,
      createdAt: new Date()
    }
  });

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'rate_request',
      resource: 'carriers',
      details: {
        requestId,
        carriers: targetCarriers,
        ratesFound: enhancedRates.length,
        errors: errors.length,
        from: shipmentRequest.from.city,
        to: shipmentRequest.to.city,
        packages: shipmentRequest.packages.length
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }
  });

  return {
    requestId,
    rates: enhancedRates,
    summary: {
      totalRates: enhancedRates.length,
      carriersQueried: targetCarriers.length,
      errors: errors.length,
      cheapestRate: enhancedRates[0],
      averageCost: enhancedRates.length > 0 ? 
        enhancedRates.reduce((sum, rate) => sum + rate.cost, 0) / enhancedRates.length : 0,
      priceRange: enhancedRates.length > 0 ? {
        min: enhancedRates[0].cost,
        max: enhancedRates[enhancedRates.length - 1].cost
      } : null
    },
    errors: errors.length > 0 ? errors : undefined
  };
}

// Helper function to generate unique request ID
function generateRequestId(): string {
  return `rate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}