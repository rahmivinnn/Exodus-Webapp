import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { EmailService } from '@/lib/email';
import { AuthService } from '@/lib/auth';

// Validation schemas
const sendNotificationSchema = z.object({
  shipmentId: z.string().uuid(),
  type: z.enum(['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception']),
  recipients: z.array(z.string().email()).optional(),
  customMessage: z.string().optional(),
});

const bulkNotificationSchema = z.object({
  notifications: z.array(sendNotificationSchema).max(50),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  notificationTypes: z.array(z.enum([
    'shipment_created',
    'shipment_picked_up', 
    'shipment_in_transit',
    'shipment_out_for_delivery',
    'shipment_delivered',
    'shipment_exception',
    'payment_processed',
    'account_updates'
  ])),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
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

// POST /api/notifications - Send notification
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`notification_${clientIp}`, 20, 60000)) {
      return NextResponse.json(
        { error: 'Too many notification requests. Please try again later.' },
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
    const validatedData = sendNotificationSchema.parse(body);

    // Check if user has permission to send notifications for this shipment
    const shipment = await prisma.shipment.findFirst({
      where: {
        id: validatedData.shipmentId,
        OR: [
          { senderId: authResult.user.id },
          { receiverId: authResult.user.id },
          {
            sender: {
              companyId: authResult.user.companyId
            }
          }
        ]
      },
      include: {
        sender: true,
        receiver: true,
        carrier: true
      }
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found or access denied' },
        { status: 404 }
      );
    }

    // Send email notification
    const emailSent = await EmailService.sendShipmentNotification(
      validatedData.shipmentId,
      validatedData.type
    );

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        type: `shipment_${validatedData.type}`,
        title: `Shipment ${validatedData.type.replace('_', ' ')}`,
        message: validatedData.customMessage || `Your shipment ${shipment.trackingNumber} is ${validatedData.type.replace('_', ' ')}`,
        userId: shipment.senderId,
        entityType: 'Shipment',
        entityId: shipment.id,
        isRead: false,
        channels: {
          email: emailSent,
          sms: false,
          push: false
        },
        metadata: {
          trackingNumber: shipment.trackingNumber,
          carrierName: shipment.carrier?.name,
          status: validatedData.type
        }
      }
    });

    // Also create notification for receiver if different
    if (shipment.receiverId && shipment.receiverId !== shipment.senderId) {
      await prisma.notification.create({
        data: {
          type: `shipment_${validatedData.type}`,
          title: `Shipment ${validatedData.type.replace('_', ' ')}`,
          message: validatedData.customMessage || `Shipment ${shipment.trackingNumber} is ${validatedData.type.replace('_', ' ')}`,
          userId: shipment.receiverId,
          entityType: 'Shipment',
          entityId: shipment.id,
          isRead: false,
          channels: {
            email: emailSent,
            sms: false,
            push: false
          },
          metadata: {
            trackingNumber: shipment.trackingNumber,
            carrierName: shipment.carrier?.name,
            status: validatedData.type
          }
        }
      });
    }

    // Log the notification
    await prisma.auditLog.create({
      data: {
        action: 'NOTIFICATION_SENT',
        entityType: 'Notification',
        entityId: notification.id,
        userId: authResult.user.id,
        details: {
          shipmentId: validatedData.shipmentId,
          notificationType: validatedData.type,
          trackingNumber: shipment.trackingNumber,
          emailSent,
          recipients: validatedData.recipients
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        emailSent,
        trackingNumber: shipment.trackingNumber
      }
    });

  } catch (error) {
    console.error('Notification sending error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET /api/notifications - Get user notifications
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
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const entityType = searchParams.get('entityType');

    // Build where clause
    const where: any = {
      userId: authResult.user.id
    };

    if (type) {
      where.type = type;
    }

    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    if (entityType) {
      where.entityType = entityType;
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: authResult.user.id,
        isRead: false
      }
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Bulk update notifications
export async function PUT(request: NextRequest) {
  try {
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read
      const updated = await prisma.notification.updateMany({
        where: {
          userId: authResult.user.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        updated: updated.count
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    switch (action) {
      case 'mark_read':
        updateData = { isRead: true, readAt: new Date() };
        break;
      case 'mark_unread':
        updateData = { isRead: false, readAt: null };
        break;
      case 'delete':
        // Soft delete
        updateData = { deletedAt: new Date() };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: authResult.user.id
      },
      data: updateData
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: `NOTIFICATIONS_${action.toUpperCase()}`,
        entityType: 'Notification',
        entityId: notificationIds[0],
        userId: authResult.user.id,
        details: {
          action,
          notificationIds,
          count: updated.count
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      updated: updated.count
    });

  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
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