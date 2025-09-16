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
const trackRequestSchema = z.object({
  trackingNumber: z.string().min(1),
  carrier: z.string().optional()
});

const bulkTrackRequestSchema = z.object({
  trackingNumbers: z.array(z.object({
    trackingNumber: z.string().min(1),
    carrier: z.string().optional()
  })).min(1).max(50)
});

// POST /api/carriers/track - Track single or multiple shipments
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    await limiter.check(request, 20, 'CACHE_TOKEN');

    // Authentication
    const user = await authService.getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if it's a bulk tracking request
    const isBulkRequest = Array.isArray(body.trackingNumbers);
    
    if (isBulkRequest) {
      const validatedData = bulkTrackRequestSchema.parse(body);
      const trackingResults = [];

      for (const trackingRequest of validatedData.trackingNumbers) {
        try {
          const result = await trackSingleShipment(
            trackingRequest.trackingNumber,
            trackingRequest.carrier,
            user.id,
            request
          );
          trackingResults.push(result);
        } catch (error) {
          trackingResults.push({
            trackingNumber: trackingRequest.trackingNumber,
            error: error instanceof Error ? error.message : 'Tracking failed',
            success: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        results: trackingResults,
        totalTracked: trackingResults.length,
        successful: trackingResults.filter(r => r.success).length
      });
    } else {
      const validatedData = trackRequestSchema.parse(body);
      const result = await trackSingleShipment(
        validatedData.trackingNumber,
        validatedData.carrier,
        user.id,
        request
      );

      return NextResponse.json({
        success: true,
        ...result
      });
    }
  } catch (error) {
    console.error('Tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500 }
    );
  }
}

// GET /api/carriers/track?trackingNumber=xxx&carrier=xxx - Track shipment via query params
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    await limiter.check(request, 30, 'CACHE_TOKEN');

    // Authentication
    const user = await authService.getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const carrier = searchParams.get('carrier');

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const result = await trackSingleShipment(
      trackingNumber,
      carrier || undefined,
      user.id,
      request
    );

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500 }
    );
  }
}

// Helper function to track a single shipment
async function trackSingleShipment(
  trackingNumber: string,
  carrierName: string | undefined,
  userId: string,
  request: NextRequest
) {
  // First, try to find the shipment in our database
  let shipment = await prisma.shipment.findFirst({
    where: {
      trackingNumber,
      ...(carrierName && { carrier: carrierName })
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  let carrierToUse = carrierName;
  
  // If shipment found in database, use its carrier
  if (shipment && !carrierToUse) {
    carrierToUse = shipment.carrier;
  }

  // If no carrier specified and no shipment found, try all carriers
  if (!carrierToUse) {
    const availableCarriers = carrierService.getAvailableCarriers();
    let trackingInfo = null;
    let usedCarrier = null;

    for (const testCarrier of availableCarriers) {
      try {
        const carrier = carrierService.getCarrier(testCarrier);
        if (carrier) {
          const info = await carrier.trackShipment(trackingNumber);
          if (info && info.length > 0) {
            trackingInfo = info;
            usedCarrier = testCarrier;
            break;
          }
        }
      } catch (error) {
        // Continue trying other carriers
        console.warn(`Failed to track with ${testCarrier}:`, error);
      }
    }

    if (!trackingInfo) {
      throw new Error('Tracking number not found with any carrier');
    }

    carrierToUse = usedCarrier;
  } else {
    // Use specified carrier
    const carrier = carrierService.getCarrier(carrierToUse);
    if (!carrier) {
      throw new Error(`Carrier ${carrierToUse} not available`);
    }

    const trackingInfo = await carrier.trackShipment(trackingNumber);
    
    if (!trackingInfo || trackingInfo.length === 0) {
      throw new Error('No tracking information found');
    }
  }

  // Get fresh tracking info
  const carrier = carrierService.getCarrier(carrierToUse!);
  const trackingInfo = await carrier!.trackShipment(trackingNumber);

  // Update shipment status if found in database
  if (shipment && trackingInfo.length > 0) {
    const latestEvent = trackingInfo[0];
    const statusMapping: Record<string, string> = {
      'delivered': 'DELIVERED',
      'out for delivery': 'OUT_FOR_DELIVERY',
      'in transit': 'IN_TRANSIT',
      'picked up': 'PICKED_UP',
      'label created': 'LABEL_CREATED',
      'exception': 'EXCEPTION',
      'returned': 'RETURNED'
    };

    const mappedStatus = Object.keys(statusMapping).find(key => 
      latestEvent.status.toLowerCase().includes(key)
    );

    if (mappedStatus) {
      shipment = await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: statusMapping[mappedStatus],
          lastTrackedAt: new Date(),
          deliveredAt: mappedStatus === 'delivered' ? latestEvent.deliveryDate || new Date() : undefined
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });
    }
  }

  // Store tracking history
  await prisma.trackingHistory.create({
    data: {
      trackingNumber,
      carrier: carrierToUse!,
      events: trackingInfo,
      shipmentId: shipment?.id,
      userId,
      timestamp: new Date()
    }
  });

  // Log carrier activity
  await carrierService.logCarrierActivity(
    carrierToUse!,
    'tracking_request',
    trackingNumber,
    {
      eventsFound: trackingInfo.length,
      shipmentId: shipment?.id
    }
  );

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'track_shipment',
      resource: 'carriers',
      resourceId: shipment?.id,
      details: {
        trackingNumber,
        carrier: carrierToUse,
        eventsFound: trackingInfo.length
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }
  });

  return {
    trackingNumber,
    carrier: carrierToUse,
    shipment,
    trackingInfo,
    lastUpdated: new Date(),
    success: true
  };
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