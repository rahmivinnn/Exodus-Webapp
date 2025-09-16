import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentService } from '@/lib/payment';
import { prisma } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!endpointSecret) {
      console.error('Missing Stripe webhook secret');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.updated':
        await handleChargeDisputeUpdated(event.data.object as Stripe.Dispute);
        break;

      case 'refund.created':
        await handleRefundCreated(event.data.object as Stripe.Refund);
        break;

      case 'refund.updated':
        await handleRefundUpdated(event.data.object as Stripe.Refund);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log webhook event
    await prisma.webhookLog.create({
      data: {
        provider: 'stripe',
        eventType: event.type,
        eventId: event.id,
        processed: true,
        payload: event,
        processedAt: new Date()
      }
    }).catch(console.error);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log failed webhook
    try {
      await prisma.webhookLog.create({
        data: {
          provider: 'stripe',
          eventType: 'unknown',
          eventId: 'unknown',
          processed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date()
        }
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Payment Intent Handlers
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'completed',
        processedAt: new Date(),
        metadata: {
          stripeStatus: paymentIntent.status,
          chargeId: paymentIntent.latest_charge,
          paymentMethodId: paymentIntent.payment_method,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    // Update shipment payment status
    const payment = await prisma.payment.findUnique({
      where: { id: paymentIntent.id },
      include: { shipment: true }
    });

    if (payment?.shipment) {
      await prisma.shipment.update({
        where: { id: payment.shipmentId },
        data: { paymentStatus: 'paid' }
      });

      // Send payment confirmation email
      const { EmailService } = await import('@/lib/email');
      await EmailService.sendShipmentNotification(payment.shipmentId, 'created');
    }

    console.log(`Payment succeeded: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'failed',
        metadata: {
          stripeStatus: paymentIntent.status,
          lastError: paymentIntent.last_payment_error?.message,
          errorCode: paymentIntent.last_payment_error?.code,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    console.log(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'cancelled',
        metadata: {
          stripeStatus: paymentIntent.status,
          canceledAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      }
    });

    console.log(`Payment canceled: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment_intent.canceled:', error);
  }
}

async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'processing',
        metadata: {
          stripeStatus: paymentIntent.status,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    console.log(`Payment processing: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment_intent.processing:', error);
  }
}

async function handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'requires_action',
        metadata: {
          stripeStatus: paymentIntent.status,
          nextAction: paymentIntent.next_action?.type,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    console.log(`Payment requires action: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment_intent.requires_action:', error);
  }
}

// Charge Handlers
async function handleChargeSucceeded(charge: Stripe.Charge) {
  try {
    // Log successful charge
    await prisma.auditLog.create({
      data: {
        action: 'CHARGE_SUCCEEDED',
        entityType: 'Payment',
        entityId: charge.payment_intent as string,
        details: {
          chargeId: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency,
          paymentMethod: charge.payment_method_details?.type,
          receiptUrl: charge.receipt_url
        },
        timestamp: new Date()
      }
    });

    console.log(`Charge succeeded: ${charge.id}`);
  } catch (error) {
    console.error('Error handling charge.succeeded:', error);
  }
}

async function handleChargeFailed(charge: Stripe.Charge) {
  try {
    // Log failed charge
    await prisma.auditLog.create({
      data: {
        action: 'CHARGE_FAILED',
        entityType: 'Payment',
        entityId: charge.payment_intent as string,
        details: {
          chargeId: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency,
          failureCode: charge.failure_code,
          failureMessage: charge.failure_message
        },
        timestamp: new Date()
      }
    });

    console.log(`Charge failed: ${charge.id}`);
  } catch (error) {
    console.error('Error handling charge.failed:', error);
  }
}

// Dispute Handlers
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    // Create dispute record
    await prisma.dispute.create({
      data: {
        id: dispute.id,
        paymentId: dispute.payment_intent as string,
        amount: dispute.amount / 100,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        evidenceDueBy: new Date(dispute.evidence_details.due_by * 1000),
        stripeDisputeId: dispute.id,
        metadata: {
          chargeId: dispute.charge,
          networkReasonCode: dispute.network_reason_code
        }
      }
    });

    // Log dispute creation
    await prisma.auditLog.create({
      data: {
        action: 'DISPUTE_CREATED',
        entityType: 'Payment',
        entityId: dispute.payment_intent as string,
        details: {
          disputeId: dispute.id,
          amount: dispute.amount / 100,
          reason: dispute.reason,
          evidenceDueBy: new Date(dispute.evidence_details.due_by * 1000)
        },
        timestamp: new Date()
      }
    });

    console.log(`Dispute created: ${dispute.id}`);
  } catch (error) {
    console.error('Error handling charge.dispute.created:', error);
  }
}

async function handleChargeDisputeUpdated(dispute: Stripe.Dispute) {
  try {
    await prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: dispute.status,
        metadata: {
          chargeId: dispute.charge,
          networkReasonCode: dispute.network_reason_code,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    console.log(`Dispute updated: ${dispute.id}`);
  } catch (error) {
    console.error('Error handling charge.dispute.updated:', error);
  }
}

// Refund Handlers
async function handleRefundCreated(refund: Stripe.Refund) {
  try {
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: refund.status,
        metadata: {
          stripeStatus: refund.status,
          chargeId: refund.charge,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    console.log(`Refund created: ${refund.id}`);
  } catch (error) {
    console.error('Error handling refund.created:', error);
  }
}

async function handleRefundUpdated(refund: Stripe.Refund) {
  try {
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: refund.status,
        metadata: {
          stripeStatus: refund.status,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    console.log(`Refund updated: ${refund.id}`);
  } catch (error) {
    console.error('Error handling refund.updated:', error);
  }
}

// Customer Handlers
async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    console.log(`Customer created: ${customer.id}`);
  } catch (error) {
    console.error('Error handling customer.created:', error);
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  try {
    console.log(`Customer updated: ${customer.id}`);
  } catch (error) {
    console.error('Error handling customer.updated:', error);
  }
}

// Payment Method Handlers
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    console.log(`Payment method attached: ${paymentMethod.id}`);
  } catch (error) {
    console.error('Error handling payment_method.attached:', error);
  }
}

// Invoice Handlers
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    },
  });
}