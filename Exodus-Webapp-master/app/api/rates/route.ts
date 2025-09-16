import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for rate calculation
const rateCalculationSchema = z.object({
  origin: z.object({
    address: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  destination: z.object({
    address: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  package: z.object({
    weight: z.number().positive(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }),
    value: z.number().positive().optional(),
    packageType: z.enum(['envelope', 'box', 'tube', 'pak']).default('box'),
  }),
  services: z.array(z.string()).optional(), // Specific services to quote
  carriers: z.array(z.string()).optional(), // Specific carriers to quote
  options: z.object({
    insurance: z.boolean().default(false),
    signatureRequired: z.boolean().default(false),
    saturdayDelivery: z.boolean().default(false),
    residentialDelivery: z.boolean().default(false),
  }).optional(),
});

// Mock carrier data for rate calculation
const carrierRates = {
  fedex: {
    name: 'FedEx',
    services: {
      overnight: {
        name: 'FedEx Overnight',
        baseRate: 25.99,
        weightMultiplier: 3.5,
        transitTime: '1 business day',
        features: ['tracking', 'signature_required', 'insurance'],
      },
      '2day': {
        name: 'FedEx 2Day',
        baseRate: 18.99,
        weightMultiplier: 2.8,
        transitTime: '2 business days',
        features: ['tracking', 'insurance'],
      },
      ground: {
        name: 'FedEx Ground',
        baseRate: 12.99,
        weightMultiplier: 2.2,
        transitTime: '1-5 business days',
        features: ['tracking'],
      },
    },
    fuelSurcharge: 0.15,
    residentialSurcharge: 4.95,
    signatureSurcharge: 5.55,
    saturdayDeliverySurcharge: 16.00,
  },
  ups: {
    name: 'UPS',
    services: {
      next_day: {
        name: 'UPS Next Day Air',
        baseRate: 24.99,
        weightMultiplier: 3.3,
        transitTime: '1 business day',
        features: ['tracking', 'signature_required', 'insurance'],
      },
      '2nd_day': {
        name: 'UPS 2nd Day Air',
        baseRate: 17.99,
        weightMultiplier: 2.6,
        transitTime: '2 business days',
        features: ['tracking', 'insurance'],
      },
      ground: {
        name: 'UPS Ground',
        baseRate: 11.99,
        weightMultiplier: 2.0,
        transitTime: '1-5 business days',
        features: ['tracking'],
      },
    },
    fuelSurcharge: 0.14,
    residentialSurcharge: 4.20,
    signatureSurcharge: 5.30,
    saturdayDeliverySurcharge: 17.50,
  },
  dhl: {
    name: 'DHL',
    services: {
      express_worldwide: {
        name: 'DHL Express Worldwide',
        baseRate: 35.99,
        weightMultiplier: 4.5,
        transitTime: '1-3 business days',
        features: ['tracking', 'signature_required', 'insurance', 'customs_clearance'],
      },
      express_12: {
        name: 'DHL Express 12:00',
        baseRate: 45.99,
        weightMultiplier: 5.2,
        transitTime: '1-2 business days',
        features: ['tracking', 'signature_required', 'insurance', 'time_definite'],
      },
    },
    fuelSurcharge: 0.18,
    residentialSurcharge: 3.70,
    signatureSurcharge: 0, // Included in DHL services
    saturdayDeliverySurcharge: 25.00,
  },
  usps: {
    name: 'USPS',
    services: {
      priority_express: {
        name: 'Priority Mail Express',
        baseRate: 22.95,
        weightMultiplier: 2.1,
        transitTime: '1-2 business days',
        features: ['tracking', 'insurance'],
      },
      priority: {
        name: 'Priority Mail',
        baseRate: 8.95,
        weightMultiplier: 1.5,
        transitTime: '1-3 business days',
        features: ['tracking'],
      },
      ground: {
        name: 'USPS Ground Advantage',
        baseRate: 5.95,
        weightMultiplier: 1.2,
        transitTime: '2-5 business days',
        features: ['tracking'],
      },
    },
    fuelSurcharge: 0.08,
    residentialSurcharge: 0, // No residential surcharge for USPS
    signatureSurcharge: 3.35,
    saturdayDeliverySurcharge: 12.50,
  },
};

// Calculate dimensional weight
function calculateDimensionalWeight(dimensions: any, carrier: string): number {
  const { length, width, height } = dimensions;
  const dimensionalFactor = carrier === 'usps' ? 166 : 139; // Different factors for different carriers
  return (length * width * height) / dimensionalFactor;
}

// Calculate distance-based pricing adjustment
function getDistanceMultiplier(origin: any, destination: any): number {
  // Mock distance calculation - in production, use actual distance calculation
  const sameState = origin.state === destination.state;
  const sameCountry = origin.country === destination.country;
  
  if (sameState) return 1.0;
  if (sameCountry) return 1.2;
  return 1.5; // International
}

// Calculate delivery date
function calculateDeliveryDate(transitTime: string, options: any = {}): string {
  const days = parseInt(transitTime.split(' ')[0]) || 1;
  const deliveryDate = new Date();
  
  // Add business days
  let addedDays = 0;
  while (addedDays < days) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    
    // Skip weekends unless Saturday delivery is requested
    if (dayOfWeek !== 0 && (dayOfWeek !== 6 || options.saturdayDelivery)) {
      addedDays++;
    }
  }
  
  return deliveryDate.toISOString().split('T')[0];
}

// POST /api/rates - Calculate shipping rates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = rateCalculationSchema.parse(body);
    
    const { origin, destination, package: pkg, services, carriers, options = {} } = validatedData;
    
    // Determine which carriers to quote
    const carriersToQuote = carriers || Object.keys(carrierRates);
    
    const rates: any[] = [];
    
    for (const carrierCode of carriersToQuote) {
      const carrier = carrierRates[carrierCode as keyof typeof carrierRates];
      if (!carrier) continue;
      
      // Determine which services to quote for this carrier
      const servicesToQuote = services || Object.keys(carrier.services);
      
      for (const serviceCode of servicesToQuote) {
        const service = carrier.services[serviceCode as keyof typeof carrier.services];
        if (!service) continue;
        
        // Calculate billable weight (higher of actual weight or dimensional weight)
        const dimensionalWeight = calculateDimensionalWeight(pkg.dimensions, carrierCode);
        const billableWeight = Math.max(pkg.weight, dimensionalWeight);
        
        // Base calculation
        let totalCost = service.baseRate + (billableWeight * service.weightMultiplier);
        
        // Apply distance multiplier
        const distanceMultiplier = getDistanceMultiplier(origin, destination);
        totalCost *= distanceMultiplier;
        
        // Apply fuel surcharge
        totalCost *= (1 + carrier.fuelSurcharge);
        
        // Add optional surcharges
        if (options.residentialDelivery) {
          totalCost += carrier.residentialSurcharge;
        }
        
        if (options.signatureRequired) {
          totalCost += carrier.signatureSurcharge;
        }
        
        if (options.saturdayDelivery) {
          totalCost += carrier.saturdayDeliverySurcharge;
        }
        
        // Insurance calculation
        let insuranceCost = 0;
        if (options.insurance && pkg.value) {
          insuranceCost = Math.max(2.50, pkg.value * 0.01); // Minimum $2.50 or 1% of value
          totalCost += insuranceCost;
        }
        
        // Calculate delivery date
        const estimatedDelivery = calculateDeliveryDate(service.transitTime, options);
        
        rates.push({
          carrier: {
            code: carrierCode,
            name: carrier.name,
          },
          service: {
            code: serviceCode,
            name: service.name,
            transitTime: service.transitTime,
            features: service.features,
          },
          cost: {
            total: parseFloat(totalCost.toFixed(2)),
            base: parseFloat(service.baseRate.toFixed(2)),
            weight: parseFloat((billableWeight * service.weightMultiplier).toFixed(2)),
            fuel: parseFloat((totalCost / (1 + carrier.fuelSurcharge) * carrier.fuelSurcharge).toFixed(2)),
            surcharges: {
              residential: options.residentialDelivery ? carrier.residentialSurcharge : 0,
              signature: options.signatureRequired ? carrier.signatureSurcharge : 0,
              saturday: options.saturdayDelivery ? carrier.saturdayDeliverySurcharge : 0,
              insurance: insuranceCost,
            },
          },
          delivery: {
            estimatedDate: estimatedDelivery,
            transitTime: service.transitTime,
            guaranteedDelivery: ['overnight', 'next_day', 'express_12'].includes(serviceCode),
          },
          package: {
            actualWeight: pkg.weight,
            dimensionalWeight: parseFloat(dimensionalWeight.toFixed(2)),
            billableWeight: parseFloat(billableWeight.toFixed(2)),
          },
          options: {
            insurance: options.insurance,
            signatureRequired: options.signatureRequired,
            saturdayDelivery: options.saturdayDelivery,
            residentialDelivery: options.residentialDelivery,
          },
        });
      }
    }
    
    // Sort rates by total cost
    rates.sort((a, b) => a.cost.total - b.cost.total);
    
    return NextResponse.json({
      success: true,
      data: {
        rates,
        origin,
        destination,
        package: pkg,
        requestedOptions: options,
        calculatedAt: new Date().toISOString(),
      },
      meta: {
        totalRates: rates.length,
        cheapestRate: rates[0]?.cost.total || 0,
        fastestRate: rates.find(r => r.delivery.guaranteedDelivery)?.cost.total || 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to calculate rates' },
      { status: 500 }
    );
  }
}

// GET /api/rates/carriers - Get available carriers and services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRates = searchParams.get('includeRates') === 'true';
    
    const carriersInfo = Object.entries(carrierRates).map(([code, carrier]) => ({
      code,
      name: carrier.name,
      services: Object.entries(carrier.services).map(([serviceCode, service]) => ({
        code: serviceCode,
        name: service.name,
        transitTime: service.transitTime,
        features: service.features,
        ...(includeRates && {
          baseRate: service.baseRate,
          weightMultiplier: service.weightMultiplier,
        }),
      })),
      ...(includeRates && {
        fuelSurcharge: carrier.fuelSurcharge,
        surcharges: {
          residential: carrier.residentialSurcharge,
          signature: carrier.signatureSurcharge,
          saturday: carrier.saturdayDeliverySurcharge,
        },
      }),
    }));
    
    return NextResponse.json({
      success: true,
      data: carriersInfo,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carrier information' },
      { status: 500 }
    );
  }
}