import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { PaymentService } from '@/lib/payment';
import { AuthService } from '@/lib/auth';

// Validation schemas
const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
  metadata: z.record(z.string()).optional()
});

// GET /api/payments/[id] - Get payment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const paymentId = params.id;

    // Get payment with detailed information
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        OR: [
          { userId: authResult.user.id },
          {
            shipment: {
              sender: {
                companyId: authResult.user.companyId
              }
            }
          }
        ]
      },
      include: {
        shipment: {
          include: {
            carrier: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            senderAddress: true,
            receiverAddress: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        refunds: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get latest status from Stripe if needed
    let stripePayment = null;
    if (payment.stripePaymentIntentId) {
      const statusResult = await PaymentService.getPaymentStatus(payment.stripePaymentIntentId);
      if (statusResult.success) {
        stripePayment = statusResult.stripePayment;
      }
    }

    // Calculate refund information
    const totalRefunded = payment.refunds.reduce((sum, refund) => sum + refund.amount, 0);
    const refundableAmount = payment.amount - totalRefunded;

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        stripeCustomerId: payment.stripeCustomerId,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
        metadata: payment.metadata,
        shipment: {
          id: payment.shipment.id,
          trackingNumber: payment.shipment.trackingNumber,
          status: payment.shipment.status,
          paymentStatus: payment.shipment.paymentStatus,
          cost: payment.shipment.cost,
          weight: payment.shipment.weight,
          dimensions: {
            length: payment.shipment.length,
            width: payment.shipment.width,
            height: payment.shipment.height
          },
          carrier: payment.shipment.carrier,
          sender: payment.shipment.sender,
          receiver: payment.shipment.receiver,
          senderAddress: payment.shipment.senderAddress,
          receiverAddress: payment.shipment.receiverAddress,
          createdAt: payment.shipment.createdAt,
          estimatedDeliveryDate: payment.shipment.estimatedDeliveryDate
        },
        user: payment.user,
        refunds: payment.refunds.map(refund => ({
          id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          reason: refund.reason,
          status: refund.status,
          processedAt: refund.processedAt,
          metadata: refund.metadata
        })),
        refundInfo: {
          totalRefunded,
          refundableAmount,
          canRefund: refundableAmount > 0 && payment.status === 'completed'
        }
      },
      stripePayment: stripePayment ? {
        id: stripePayment.id,
        status: stripePayment.status,
        amount: stripePayment.amount / 100,
        currency: stripePayment.currency,
        created: new Date(stripePayment.created * 1000),
        payment_method: stripePayment.payment_method
      } : null
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}

// POST /api/payments/[id] - Process refund
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!AuthService.hasPermission(authResult.user, 'payments', 'refund')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const paymentId = params.id;
    const body = await request.json();
    const validatedData = refundSchema.parse(body);

    // Verify payment ownership and status
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        OR: [
          { userId: authResult.user.id },
          {
            shipment: {
              sender: {
                companyId: authResult.user.companyId
              }
            }
          }
        ]
      },
      include: {
        shipment: true,
        refunds: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or access denied' },
        { status: 404 }
      );
    }

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment must be completed to process refund' },
        { status: 400 }
      );
    }

    // Calculate refundable amount
    const totalRefunded = payment.refunds.reduce((sum, refund) => sum + refund.amount, 0);
    const refundableAmount = payment.amount - totalRefunded;
    const requestedAmount = validatedData.amount || refundableAmount;

    if (requestedAmount > refundableAmount) {
      return NextResponse.json(
        { error: `Cannot refund more than ${refundableAmount}. Already refunded: ${totalRefunded}` },
        { status: 400 }
      );
    }

    if (requestedAmount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Process refund
    const refundResult = await PaymentService.processRefund({
      paymentIntentId: paymentId,
      amount: requestedAmount,
      reason: validatedData.reason,
      metadata: {
        processedBy: authResult.user.id,
        processedByName: authResult.user.name,
        shipmentId: payment.shipmentId,
        ...validatedData.metadata
      }
    });

    if (!refundResult.success) {
      return NextResponse.json(
        { error: refundResult.error },
        { status: 400 }
      );
    }

    // Send notification about refund
    try {
      const { EmailService } = await import('@/lib/email');
      if (payment.shipment.senderId) {
        const user = await prisma.user.findUnique({
          where: { id: payment.shipment.senderId }
        });
        
        if (user?.email) {
          const refundTemplate = {
            subject: `Refund Processed - Payment ${paymentId}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0;">💰 Refund Processed</h1>
                </div>
                <div style="padding: 20px; background: #f9f9f9;">
                  <h2>Hello ${user.name}!</h2>
                  <p>Your refund has been processed successfully.</p>
                  <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Refund Amount:</strong> $${requestedAmount.toFixed(2)} ${payment.currency}</p>
                    <p><strong>Payment ID:</strong> ${paymentId}</p>
                    <p><strong>Tracking Number:</strong> ${payment.shipment.trackingNumber}</p>
                    <p><strong>Reason:</strong> ${validatedData.reason.replace('_', ' ')}</p>
                    <p><strong>Processing Time:</strong> 5-10 business days</p>
                  </div>
                  <p style="color: #7f8c8d; font-size: 14px;">The refund will appear on your original payment method within 5-10 business days.</p>
                </div>
              </div>
            `,
            text: `Refund Processed - Payment ${paymentId}\n\nHello ${user.name}!\n\nYour refund has been processed successfully.\n\nRefund Amount: $${requestedAmount.toFixed(2)} ${payment.currency}\nPayment ID: ${paymentId}\nTracking Number: ${payment.shipment.trackingNumber}\nReason: ${validatedData.reason.replace('_', ' ')}\nProcessing Time: 5-10 business days\n\nThe refund will appear on your original payment method within 5-10 business days.`
          };

          await EmailService.sendEmail(
            user.email,
            refundTemplate.subject,
            refundTemplate.html,
            refundTemplate.text
          );
        }
      }
    } catch (emailError) {
      console.error('Failed to send refund notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refundResult.refund?.id,
        amount: requestedAmount,
        currency: payment.currency,
        reason: validatedData.reason,
        status: refundResult.refund?.status,
        estimatedArrival: '5-10 business days'
      },
      payment: {
        id: payment.id,
        originalAmount: payment.amount,
        totalRefunded: totalRefunded + requestedAmount,
        remainingAmount: payment.amount - (totalRefunded + requestedAmount)
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}

// PUT /api/payments/[id] - Update payment metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const paymentId = params.id;
    const body = await request.json();
    const { metadata, notes } = body;

    // Verify payment ownership
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        OR: [
          { userId: authResult.user.id },
          {
            shipment: {
              sender: {
                companyId: authResult.user.companyId
              }
            }
          }
        ]
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or access denied' },
        { status: 404 }
      );
    }

    // Update payment metadata
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        metadata: {
          ...payment.metadata,
          ...metadata,
          lastUpdatedBy: authResult.user.id,
          lastUpdatedAt: new Date().toISOString(),
          notes
        }
      }
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_UPDATED',
        entityType: 'Payment',
        entityId: paymentId,
        userId: authResult.user.id,
        details: {
          updatedFields: { metadata, notes },
          previousMetadata: payment.metadata
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        metadata: updatedPayment.metadata,
        updatedAt: updatedPayment.updatedAt
      }
    });

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}