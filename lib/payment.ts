import Stripe from 'stripe';
import { prisma } from './database';

interface PaymentIntent {
  amount: number;
  currency: string;
  shipmentId: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'wallet';
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details?: {
    name: string;
    email: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export class PaymentService {
  private static stripe: Stripe;
  private static isInitialized = false;

  // Initialize Stripe
  static initialize(): void {
    if (this.isInitialized) return;

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.warn('Stripe secret key not found. Payment processing disabled.');
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    this.isInitialized = true;
    console.log('Payment service initialized successfully');
  }

  // Create payment intent
  static async createPaymentIntent(data: PaymentIntent): Promise<{
    success: boolean;
    paymentIntent?: Stripe.PaymentIntent;
    clientSecret?: string;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        this.initialize();
        if (!this.isInitialized) {
          return { success: false, error: 'Payment service not configured' };
        }
      }

      // Validate shipment exists
      const shipment = await prisma.shipment.findUnique({
        where: { id: data.shipmentId },
        include: {
          sender: true,
          receiver: true,
          carrier: true
        }
      });

      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }

      // Create Stripe customer if needed
      let customerId = data.customerId;
      if (!customerId && shipment.sender?.email) {
        const customer = await this.stripe.customers.create({
          email: shipment.sender.email,
          name: shipment.sender.name,
          metadata: {
            userId: shipment.sender.id,
            companyId: shipment.sender.companyId || ''
          }
        });
        customerId = customer.id;
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        customer: customerId,
        description: data.description || `Shipping payment for ${shipment.trackingNumber}`,
        metadata: {
          shipmentId: data.shipmentId,
          trackingNumber: shipment.trackingNumber,
          carrierName: shipment.carrier?.name || '',
          ...data.metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Save payment record
      const payment = await prisma.payment.create({
        data: {
          id: paymentIntent.id,
          shipmentId: data.shipmentId,
          userId: shipment.senderId,
          amount: data.amount,
          currency: data.currency,
          status: 'pending',
          paymentMethod: 'stripe',
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: customerId,
          metadata: {
            description: data.description,
            ...data.metadata
          }
        }
      });

      // Log payment creation
      await prisma.auditLog.create({
        data: {
          action: 'PAYMENT_CREATED',
          entityType: 'Payment',
          entityId: payment.id,
          userId: shipment.senderId,
          details: {
            amount: data.amount,
            currency: data.currency,
            shipmentId: data.shipmentId,
            trackingNumber: shipment.trackingNumber,
            paymentIntentId: paymentIntent.id
          },
          timestamp: new Date()
        }
      });

      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret || undefined
      };

    } catch (error) {
      console.error('Create payment intent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  // Confirm payment
  static async confirmPayment(paymentIntentId: string, paymentMethod?: PaymentMethod): Promise<{
    success: boolean;
    paymentIntent?: Stripe.PaymentIntent;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        this.initialize();
        if (!this.isInitialized) {
          return { success: false, error: 'Payment service not configured' };
        }
      }

      let confirmData: any = {};

      if (paymentMethod) {
        if (paymentMethod.type === 'card' && paymentMethod.card) {
          confirmData.payment_method = {
            type: 'card',
            card: {
              number: paymentMethod.card.number,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
              cvc: paymentMethod.card.cvc,
            },
            billing_details: paymentMethod.billing_details
          };
        }
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmData
      );

      // Update payment record
      await prisma.payment.update({
        where: { id: paymentIntentId },
        data: {
          status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed',
          processedAt: new Date(),
          metadata: {
            stripeStatus: paymentIntent.status,
            lastUpdated: new Date().toISOString()
          }
        }
      });

      return {
        success: true,
        paymentIntent
      };

    } catch (error) {
      console.error('Confirm payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      };
    }
  }

  // Get payment status
  static async getPaymentStatus(paymentIntentId: string): Promise<{
    success: boolean;
    payment?: any;
    stripePayment?: Stripe.PaymentIntent;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        this.initialize();
        if (!this.isInitialized) {
          return { success: false, error: 'Payment service not configured' };
        }
      }

      // Get payment from database
      const payment = await prisma.payment.findUnique({
        where: { id: paymentIntentId },
        include: {
          shipment: {
            include: {
              carrier: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      // Get latest status from Stripe
      const stripePayment = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Update local status if different
      if (payment.status !== stripePayment.status) {
        await prisma.payment.update({
          where: { id: paymentIntentId },
          data: {
            status: stripePayment.status === 'succeeded' ? 'completed' : 
                   stripePayment.status === 'canceled' ? 'cancelled' : 'failed',
            processedAt: stripePayment.status === 'succeeded' ? new Date() : payment.processedAt
          }
        });
      }

      return {
        success: true,
        payment: {
          ...payment,
          status: stripePayment.status === 'succeeded' ? 'completed' : 
                 stripePayment.status === 'canceled' ? 'cancelled' : 'failed'
        },
        stripePayment
      };

    } catch (error) {
      console.error('Get payment status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment status'
      };
    }
  }

  // Process refund
  static async processRefund(data: RefundRequest): Promise<{
    success: boolean;
    refund?: Stripe.Refund;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        this.initialize();
        if (!this.isInitialized) {
          return { success: false, error: 'Payment service not configured' };
        }
      }

      // Get payment record
      const payment = await prisma.payment.findUnique({
        where: { id: data.paymentIntentId },
        include: { shipment: true }
      });

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (payment.status !== 'completed') {
        return { success: false, error: 'Payment not completed, cannot refund' };
      }

      // Create refund
      const refund = await this.stripe.refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount ? Math.round(data.amount * 100) : undefined,
        reason: data.reason,
        metadata: {
          shipmentId: payment.shipmentId,
          trackingNumber: payment.shipment?.trackingNumber || '',
          ...data.metadata
        }
      });

      // Create refund record
      await prisma.refund.create({
        data: {
          id: refund.id,
          paymentId: payment.id,
          amount: refund.amount / 100,
          currency: refund.currency,
          reason: data.reason || 'requested_by_customer',
          status: refund.status,
          stripeRefundId: refund.id,
          processedAt: new Date(),
          metadata: data.metadata
        }
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: data.paymentIntentId },
        data: {
          status: refund.amount === (payment.amount * 100) ? 'refunded' : 'partially_refunded'
        }
      });

      // Log refund
      await prisma.auditLog.create({
        data: {
          action: 'PAYMENT_REFUNDED',
          entityType: 'Payment',
          entityId: payment.id,
          userId: payment.userId,
          details: {
            refundId: refund.id,
            amount: refund.amount / 100,
            reason: data.reason,
            shipmentId: payment.shipmentId
          },
          timestamp: new Date()
        }
      });

      return {
        success: true,
        refund
      };

    } catch (error) {
      console.error('Process refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      };
    }
  }

  // Get payment methods for customer
  static async getPaymentMethods(customerId: string): Promise<{
    success: boolean;
    paymentMethods?: Stripe.PaymentMethod[];
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        this.initialize();
        if (!this.isInitialized) {
          return { success: false, error: 'Payment service not configured' };
        }
      }

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data
      };

    } catch (error) {
      console.error('Get payment methods error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment methods'
      };
    }
  }

  // Calculate fees
  static calculateFees(amount: number, currency: string = 'USD'): {
    stripeFee: number;
    processingFee: number;
    totalFees: number;
    netAmount: number;
  } {
    // Stripe fees (as of 2024): 2.9% + $0.30 for US cards
    const stripePercentage = 0.029;
    const stripeFixed = 0.30;
    
    const stripeFee = (amount * stripePercentage) + stripeFixed;
    
    // Additional processing fee (configurable)
    const processingFeePercentage = parseFloat(process.env.PROCESSING_FEE_PERCENTAGE || '0.5') / 100;
    const processingFee = amount * processingFeePercentage;
    
    const totalFees = stripeFee + processingFee;
    const netAmount = amount - totalFees;

    return {
      stripeFee: Math.round(stripeFee * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100
    };
  }

  // Webhook handler for Stripe events
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as Stripe.Dispute);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
    }
  }

  // Handle successful payment
  private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await prisma.payment.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'completed',
        processedAt: new Date(),
        metadata: {
          stripeStatus: paymentIntent.status,
          chargeId: paymentIntent.latest_charge,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    // Update shipment status
    const payment = await prisma.payment.findUnique({
      where: { id: paymentIntent.id },
      include: { shipment: true }
    });

    if (payment?.shipment) {
      await prisma.shipment.update({
        where: { id: payment.shipmentId },
        data: { paymentStatus: 'paid' }
      });

      // Send notification
      const { EmailService } = await import('./email');
      await EmailService.sendShipmentNotification(payment.shipmentId, 'created');
    }
  }

  // Handle failed payment
  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await prisma.payment.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'failed',
        metadata: {
          stripeStatus: paymentIntent.status,
          lastError: paymentIntent.last_payment_error?.message,
          lastUpdated: new Date().toISOString()
        }
      }
    });
  }

  // Handle charge dispute
  private static async handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
    // Log dispute for manual review
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_DISPUTED',
        entityType: 'Payment',
        entityId: dispute.payment_intent as string,
        details: {
          disputeId: dispute.id,
          amount: dispute.amount / 100,
          reason: dispute.reason,
          status: dispute.status
        },
        timestamp: new Date()
      }
    });
  }
}

// Initialize payment service on module load
PaymentService.initialize();

export default PaymentService;