import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { PaymentService } from '@/lib/payment';
import { AuthService } from '@/lib/auth';

// Validation schemas
const createPaymentSchema = z.object({
  shipmentId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  description: z.string().optional(),
  savePaymentMethod: z.boolean().default(false),
  metadata: z.record(z.string()).optional()
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethod: z.object({
    type: z.enum(['card', 'bank_transfer', 'wallet']),
    card: z.object({
      number: z.string(),
      exp_month: z.number().min(1).max(12),
      exp_year: z.number().min(new Date().getFullYear()),
      cvc: z.string().length(3)
    }).optional(),
    billing_details: z.object({
      name: z.string(),
      email: z.string().email(),
      address: z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string().length(2)
      }).optional()
    }).optional()
  }).optional()
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// POST /api/payments - Create payment intent
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`payment_${clientIp}`, 10, 60000)) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Verify shipment ownership
    const shipment = await prisma.shipment.findFirst({
      where: {
        id: validatedData.shipmentId,
        OR: [
          { senderId: authResult.user.id },
          {
            sender: {
              companyId: authResult.user.companyId
            }
          }
        ]
      },
      include: {
        sender: true,
        carrier: true
      }
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        shipmentId: validatedData.shipmentId,
        status: { in: ['pending', 'completed'] }
      }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this shipment' },
        { status: 400 }
      );
    }

    // Calculate fees
    const fees = PaymentService.calculateFees(validatedData.amount, validatedData.currency);
    
    // Create payment intent
    const result = await PaymentService.createPaymentIntent({
      amount: validatedData.amount,
      currency: validatedData.currency,
      shipmentId: validatedData.shipmentId,
      description: validatedData.description || `Shipping payment for ${shipment.trackingNumber}`,
      metadata: {
        userId: authResult.user.id,
        companyId: authResult.user.companyId || '',
        trackingNumber: shipment.trackingNumber,
        ...validatedData.metadata
      }
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: result.paymentIntent?.id,
        clientSecret: result.clientSecret,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: result.paymentIntent?.status
      },
      fees,
      shipment: {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        carrierName: shipment.carrier?.name
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// GET /api/payments - Get user payments
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');
    const shipmentId = searchParams.get('shipmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {
      userId: authResult.user.id
    };

    if (status) {
      where.status = status;
    }

    if (shipmentId) {
      where.shipmentId = shipmentId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          shipment: {
            include: {
              carrier: true,
              senderAddress: true,
              receiverAddress: true
            }
          },
          refunds: true
        }
      }),
      prisma.payment.count({ where })
    ]);

    // Calculate summary statistics
    const summary = await prisma.payment.aggregate({
      where: { userId: authResult.user.id },
      _sum: { amount: true },
      _count: { _all: true }
    });

    const statusCounts = await prisma.payment.groupBy({
      by: ['status'],
      where: { userId: authResult.user.id },
      _count: { _all: true }
    });

    return NextResponse.json({
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
        shipment: {
          id: payment.shipment.id,
          trackingNumber: payment.shipment.trackingNumber,
          status: payment.shipment.status,
          carrierName: payment.shipment.carrier?.name,
          senderAddress: payment.shipment.senderAddress,
          receiverAddress: payment.shipment.receiverAddress
        },
        refunds: payment.refunds
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalPayments: summary._count._all,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count._all;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// PUT /api/payments - Confirm payment
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`confirm_${clientIp}`, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many confirmation requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = confirmPaymentSchema.parse(body);

    // Verify payment ownership
    const payment = await prisma.payment.findFirst({
      where: {
        id: validatedData.paymentIntentId,
        userId: authResult.user.id
      },
      include: {
        shipment: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or access denied' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment cannot be confirmed in current status' },
        { status: 400 }
      );
    }

    // Confirm payment
    const result = await PaymentService.confirmPayment(
      validatedData.paymentIntentId,
      validatedData.paymentMethod
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: result.paymentIntent?.id,
        status: result.paymentIntent?.status,
        amount: payment.amount,
        currency: payment.currency
      },
      shipment: {
        id: payment.shipment.id,
        trackingNumber: payment.shipment.trackingNumber
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm payment' },
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