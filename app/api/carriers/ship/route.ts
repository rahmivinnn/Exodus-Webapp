import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { carrierService } from '@/lib/carriers';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { emailService } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

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

const shipmentRequestSchema = z.object({
  carrier: z.string(),
  from: addressSchema,
  to: addressSchema,
  packages: z.array(packageSchema).min(1),
  serviceType: z.string(),
  options: z.object({
    signatureRequired: z.boolean().optional(),
    saturdayDelivery: z.boolean().optional(),
    insurance: z.number().optional(),
    codAmount: z.number().optional(),
    dryIce: z.boolean().optional(),
    hazmat: z.boolean().optional()
  }).optional(),
  shipmentId: z.string().optional(),
  rateId: z.string().optional(),
  reference: z.string().optional(),
  description: z.string().optional()
});

const bulkShipmentSchema = z.object({
  shipments: z.array(shipmentRequestSchema).min(1).max(20)
});

const cancelShipmentSchema = z.object({
  trackingNumber: z.string().min(1),
  carrier: z.string(),
  reason: z.string().optional()
});

// POST /api/carriers/ship - Create shipment(s)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(clientId, 5, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const token = authService.extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const user = await authService.getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if it's a bulk shipment request
    const isBulkRequest = Array.isArray(body.shipments);
    
    if (isBulkRequest) {
      const validatedData = bulkShipmentSchema.parse(body);
      const shipmentResults = [];

      for (let i = 0; i < validatedData.shipments.length; i++) {
        const shipmentRequest = validatedData.shipments[i];
        try {
          const result = await createSingleShipment(
            shipmentRequest,
            user.id,
            request
          );
          shipmentResults.push({
            shipmentIndex: i,
            ...result,
            success: true
          });
        } catch (error) {
          shipmentResults.push({
            shipmentIndex: i,
            error: error instanceof Error ? error.message : 'Shipment creation failed',
            success: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        results: shipmentResults,
        totalShipments: validatedData.shipments.length,
        successful: shipmentResults.filter(r => r.success).length
      });
    } else {
      const validatedData = shipmentRequestSchema.parse(body);
      const result = await createSingleShipment(
        validatedData,
        user.id,
        request
      );

      return NextResponse.json({
        success: true,
        ...result
      });
    }
  } catch (error) {
    console.error('Shipment creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

// DELETE /api/carriers/ship - Cancel shipment
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(clientId, 10, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const token = authService.extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const user = await authService.getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = cancelShipmentSchema.parse(body);

    // Check if user owns this shipment
    const shipment = await prisma.shipment.findFirst({
      where: {
        trackingNumber: validatedData.trackingNumber,
        userId: user.id
      }
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if shipment can be cancelled
    const nonCancellableStatuses = ['DELIVERED', 'RETURNED', 'CANCELLED'];
    if (nonCancellableStatuses.includes(shipment.status)) {
      return NextResponse.json(
        { error: `Cannot cancel shipment with status: ${shipment.status}` },
        { status: 400 }
      );
    }

    // Cancel with carrier
    const carrier = carrierService.getCarrier(validatedData.carrier);
    if (!carrier) {
      return NextResponse.json(
        { error: `Carrier ${validatedData.carrier} not available` },
        { status: 400 }
      );
    }

    const cancelled = await carrier.cancelShipment(validatedData.trackingNumber);
    
    if (!cancelled) {
      return NextResponse.json(
        { error: 'Failed to cancel shipment with carrier' },
        { status: 500 }
      );
    }

    // Update shipment status
    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: validatedData.reason,
        updatedAt: new Date()
      }
    });

    // Log carrier activity
    await carrierService.logCarrierActivity(
      validatedData.carrier,
      'shipment_cancelled',
      validatedData.trackingNumber,
      {
        shipmentId: shipment.id,
        reason: validatedData.reason
      }
    );

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'shipment_cancelled',
        resource: 'carriers',
        resourceId: shipment.id,
        details: {
          trackingNumber: validatedData.trackingNumber,
          carrier: validatedData.carrier,
          reason: validatedData.reason
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Send cancellation notification
    try {
      await emailService.sendShipmentNotification(
        shipment.id,
        'cancelled',
        {
          reason: validatedData.reason
        }
      );
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      shipment: updatedShipment,
      message: 'Shipment cancelled successfully'
    });
  } catch (error) {
    console.error('Shipment cancellation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel shipment' },
      { status: 500 }
    );
  }
}

// Helper function to create a single shipment
async function createSingleShipment(
  shipmentRequest: z.infer<typeof shipmentRequestSchema>,
  userId: string,
  request: NextRequest
) {
  // Check if carrier is available
  const carrier = carrierService.getCarrier(shipmentRequest.carrier);
  if (!carrier) {
    throw new Error(`Carrier ${shipmentRequest.carrier} not available`);
  }

  // Validate rate if provided
  let selectedRate = null;
  if (shipmentRequest.rateId) {
    selectedRate = await prisma.rate.findFirst({
      where: {
        id: shipmentRequest.rateId,
        rateRequest: {
          userId
        }
      },
      include: {
        rateRequest: true
      }
    });

    if (!selectedRate) {
      throw new Error('Invalid or expired rate ID');
    }

    // Verify rate matches request
    if (selectedRate.carrier !== shipmentRequest.carrier || 
        selectedRate.service !== shipmentRequest.serviceType) {
      throw new Error('Rate does not match shipment request');
    }
  }

  // Create shipment with carrier
  const carrierShipmentRequest = {
    from: shipmentRequest.from,
    to: shipmentRequest.to,
    packages: shipmentRequest.packages,
    serviceType: shipmentRequest.serviceType,
    options: shipmentRequest.options
  };

  const labelResponse = await carrier.createShipment(carrierShipmentRequest);

  // Calculate total package weight and dimensions
  const totalWeight = shipmentRequest.packages.reduce((sum, pkg) => sum + pkg.weight, 0);
  const totalValue = shipmentRequest.packages.reduce((sum, pkg) => sum + (pkg.value || 0), 0);

  // Update existing shipment or create new one
  let shipment;
  if (shipmentRequest.shipmentId) {
    // Update existing shipment
    shipment = await prisma.shipment.update({
      where: { 
        id: shipmentRequest.shipmentId,
        userId // Ensure user owns the shipment
      },
      data: {
        trackingNumber: labelResponse.trackingNumber,
        carrier: shipmentRequest.carrier,
        serviceType: shipmentRequest.serviceType,
        labelUrl: labelResponse.labelUrl,
        shippingCost: labelResponse.cost,
        status: 'LABEL_CREATED',
        fromAddress: shipmentRequest.from,
        toAddress: shipmentRequest.to,
        packages: shipmentRequest.packages,
        totalWeight,
        totalValue,
        reference: shipmentRequest.reference,
        description: shipmentRequest.description,
        rateId: shipmentRequest.rateId,
        updatedAt: new Date()
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
  } else {
    // Create new shipment record
    shipment = await prisma.shipment.create({
      data: {
        trackingNumber: labelResponse.trackingNumber,
        carrier: shipmentRequest.carrier,
        serviceType: shipmentRequest.serviceType,
        labelUrl: labelResponse.labelUrl,
        shippingCost: labelResponse.cost,
        status: 'LABEL_CREATED',
        fromAddress: shipmentRequest.from,
        toAddress: shipmentRequest.to,
        packages: shipmentRequest.packages,
        totalWeight,
        totalValue,
        reference: shipmentRequest.reference,
        description: shipmentRequest.description,
        rateId: shipmentRequest.rateId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
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

  // Log carrier activity
  await carrierService.logCarrierActivity(
    shipmentRequest.carrier,
    'shipment_created',
    labelResponse.trackingNumber,
    {
      shipmentId: shipment.id,
      cost: labelResponse.cost,
      service: shipmentRequest.serviceType,
      packages: shipmentRequest.packages.length,
      weight: totalWeight
    }
  );

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'shipment_created',
      resource: 'carriers',
      resourceId: shipment.id,
      details: {
        carrier: shipmentRequest.carrier,
        trackingNumber: labelResponse.trackingNumber,
        cost: labelResponse.cost,
        service: shipmentRequest.serviceType,
        rateUsed: !!shipmentRequest.rateId
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }
  });

  // Send shipment creation notification
  try {
    await emailService.sendShipmentNotification(
      shipment.id,
      'created',
      {
        trackingNumber: labelResponse.trackingNumber,
        carrier: shipmentRequest.carrier,
        service: shipmentRequest.serviceType
      }
    );
  } catch (emailError) {
    console.error('Failed to send shipment creation email:', emailError);
  }

  return {
    shipment,
    label: labelResponse,
    estimatedCost: selectedRate?.cost || labelResponse.cost,
    savings: selectedRate ? Math.abs(selectedRate.cost - labelResponse.cost) : 0
  };
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}