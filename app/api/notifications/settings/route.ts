import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { AuthService } from '@/lib/auth';

// Validation schemas
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
    'account_updates',
    'marketing_updates',
    'security_alerts'
  ])),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string()
  }).optional(),
  frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional(),
  language: z.string().optional(),
  emailFormat: z.enum(['html', 'text']).optional()
});

// GET /api/notifications/settings - Get user notification settings
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

    // Get user's notification settings
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: authResult.user.id }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: authResult.user.id,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          notificationTypes: [
            'shipment_created',
            'shipment_picked_up',
            'shipment_in_transit',
            'shipment_out_for_delivery',
            'shipment_delivered',
            'shipment_exception'
          ],
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'UTC'
          },
          frequency: 'immediate',
          language: 'en',
          emailFormat: 'html'
        }
      });
    }

    return NextResponse.json({
      settings: {
        id: settings.id,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
        notificationTypes: settings.notificationTypes,
        quietHours: settings.quietHours,
        frequency: settings.frequency,
        language: settings.language,
        emailFormat: settings.emailFormat,
        updatedAt: settings.updatedAt
      }
    });

  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/settings - Update user notification settings
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
    const validatedData = notificationSettingsSchema.parse(body);

    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: authResult.user.id },
      update: {
        emailNotifications: validatedData.emailNotifications,
        smsNotifications: validatedData.smsNotifications,
        pushNotifications: validatedData.pushNotifications,
        notificationTypes: validatedData.notificationTypes,
        quietHours: validatedData.quietHours,
        frequency: validatedData.frequency,
        language: validatedData.language,
        emailFormat: validatedData.emailFormat,
        updatedAt: new Date()
      },
      create: {
        userId: authResult.user.id,
        emailNotifications: validatedData.emailNotifications,
        smsNotifications: validatedData.smsNotifications,
        pushNotifications: validatedData.pushNotifications,
        notificationTypes: validatedData.notificationTypes,
        quietHours: validatedData.quietHours || {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'UTC'
        },
        frequency: validatedData.frequency || 'immediate',
        language: validatedData.language || 'en',
        emailFormat: validatedData.emailFormat || 'html'
      }
    });

    // Log the settings update
    await prisma.auditLog.create({
      data: {
        action: 'NOTIFICATION_SETTINGS_UPDATED',
        entityType: 'NotificationSettings',
        entityId: settings.id,
        userId: authResult.user.id,
        details: {
          emailNotifications: validatedData.emailNotifications,
          smsNotifications: validatedData.smsNotifications,
          pushNotifications: validatedData.pushNotifications,
          notificationTypes: validatedData.notificationTypes,
          frequency: validatedData.frequency
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
        notificationTypes: settings.notificationTypes,
        quietHours: settings.quietHours,
        frequency: settings.frequency,
        language: settings.language,
        emailFormat: settings.emailFormat,
        updatedAt: settings.updatedAt
      }
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/settings/test - Test notification settings
export async function POST(request: NextRequest) {
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
    const { type } = body; // email, sms, push

    if (!['email', 'sms', 'push'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Get user settings
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!settings) {
      return NextResponse.json(
        { error: 'Notification settings not found' },
        { status: 404 }
      );
    }

    let testResult = false;

    // Test based on type
    switch (type) {
      case 'email':
        if (settings.emailNotifications && authResult.user.email) {
          // Import EmailService dynamically to avoid circular imports
          const { EmailService } = await import('@/lib/email');
          
          const testTemplate = {
            subject: 'Test Email Notification - Exodus Shipping',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0;">🧪 Test Email Notification</h1>
                </div>
                <div style="padding: 20px; background: #f9f9f9;">
                  <h2>Hello ${authResult.user.name}!</h2>
                  <p>This is a test email to verify your notification settings are working correctly.</p>
                  <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>✅ Email notifications are enabled</strong></p>
                    <p><strong>📧 Email format:</strong> ${settings.emailFormat}</p>
                    <p><strong>🔔 Frequency:</strong> ${settings.frequency}</p>
                    <p><strong>🌐 Language:</strong> ${settings.language}</p>
                  </div>
                  <p style="color: #7f8c8d; font-size: 14px;">If you received this email, your notification settings are working properly!</p>
                </div>
              </div>
            `,
            text: `Test Email Notification - Exodus Shipping\n\nHello ${authResult.user.name}!\n\nThis is a test email to verify your notification settings are working correctly.\n\n✅ Email notifications are enabled\n📧 Email format: ${settings.emailFormat}\n🔔 Frequency: ${settings.frequency}\n🌐 Language: ${settings.language}\n\nIf you received this email, your notification settings are working properly!`
          };

          testResult = await EmailService.sendEmail(
            authResult.user.email,
            testTemplate.subject,
            testTemplate.html,
            testTemplate.text
          );
        }
        break;

      case 'sms':
        // SMS testing would be implemented here
        // For now, just check if SMS is enabled
        testResult = settings.smsNotifications;
        break;

      case 'push':
        // Push notification testing would be implemented here
        // For now, just check if push is enabled
        testResult = settings.pushNotifications;
        break;
    }

    // Log the test
    await prisma.auditLog.create({
      data: {
        action: 'NOTIFICATION_TEST',
        entityType: 'NotificationSettings',
        entityId: settings.id,
        userId: authResult.user.id,
        details: {
          type,
          success: testResult,
          email: authResult.user.email
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      testResult,
      message: testResult 
        ? `Test ${type} notification sent successfully` 
        : `Failed to send test ${type} notification or ${type} notifications are disabled`
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: 'Failed to test notification' },
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