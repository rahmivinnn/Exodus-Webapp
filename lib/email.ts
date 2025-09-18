import nodemailer from 'nodemailer';
import { prisma } from './database';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface ShipmentEmailData {
  trackingNumber: string;
  status: string;
  senderName: string;
  receiverName: string;
  senderAddress: string;
  receiverAddress: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  carrierName: string;
  weight: number;
  dimensions: string;
  cost: number;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;
  private static isConfigured = false;

  // Initialize email service
  static async initialize(): Promise<void> {
    if (this.isConfigured) return;

    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    };

    if (!config.auth.user || !config.auth.pass) {
      console.warn('Email service not configured. SMTP credentials missing.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter(config);
      await this.transporter.verify();
      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw new Error('Email service initialization failed');
    }
  }

  // Send email
  private static async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      await this.initialize();
      if (!this.isConfigured) {
        console.error('Email service not configured');
        return false;
      }
    }

    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Exodus Shipping'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Strip HTML tags for text version
  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Generate email templates
  private static generateShipmentTemplate(
    type: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception',
    data: ShipmentEmailData
  ): EmailTemplate {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/tracking/${data.trackingNumber}`;

    const templates = {
      created: {
        subject: `Shipment Created - Tracking #${data.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">📦 Shipment Created</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Your shipment has been created successfully!</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>From:</strong> ${data.senderName}<br/>${data.senderAddress}</p>
                <p><strong>To:</strong> ${data.receiverName}<br/>${data.receiverAddress}</p>
                <p><strong>Carrier:</strong> ${data.carrierName}</p>
                <p><strong>Weight:</strong> ${data.weight} kg</p>
                <p><strong>Dimensions:</strong> ${data.dimensions}</p>
                <p><strong>Cost:</strong> $${data.cost.toFixed(2)}</p>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${trackingUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Shipment</a>
              </div>
            </div>
          </div>
        `,
        text: `Shipment Created - Tracking #${data.trackingNumber}\n\nYour shipment has been created successfully!\n\nTracking Number: ${data.trackingNumber}\nFrom: ${data.senderName} - ${data.senderAddress}\nTo: ${data.receiverName} - ${data.receiverAddress}\nCarrier: ${data.carrierName}\nWeight: ${data.weight} kg\nDimensions: ${data.dimensions}\nCost: $${data.cost.toFixed(2)}\n\nTrack your shipment: ${trackingUrl}`,
      },
      picked_up: {
        subject: `Package Picked Up - Tracking #${data.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">📋 Package Picked Up</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Your package has been picked up!</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>Status:</strong> Picked Up</p>
                <p><strong>Carrier:</strong> ${data.carrierName}</p>
                ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery.toLocaleDateString()}</p>` : ''}
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${trackingUrl}" style="background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Shipment</a>
              </div>
            </div>
          </div>
        `,
        text: `Package Picked Up - Tracking #${data.trackingNumber}\n\nYour package has been picked up!\n\nTracking Number: ${data.trackingNumber}\nStatus: Picked Up\nCarrier: ${data.carrierName}${data.estimatedDelivery ? `\nEstimated Delivery: ${data.estimatedDelivery.toLocaleDateString()}` : ''}\n\nTrack your shipment: ${trackingUrl}`,
      },
      in_transit: {
        subject: `Package In Transit - Tracking #${data.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🚛 Package In Transit</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Your package is on its way!</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>Status:</strong> In Transit</p>
                <p><strong>Carrier:</strong> ${data.carrierName}</p>
                ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery.toLocaleDateString()}</p>` : ''}
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${trackingUrl}" style="background: #4facfe; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Shipment</a>
              </div>
            </div>
          </div>
        `,
        text: `Package In Transit - Tracking #${data.trackingNumber}\n\nYour package is on its way!\n\nTracking Number: ${data.trackingNumber}\nStatus: In Transit\nCarrier: ${data.carrierName}${data.estimatedDelivery ? `\nEstimated Delivery: ${data.estimatedDelivery.toLocaleDateString()}` : ''}\n\nTrack your shipment: ${trackingUrl}`,
      },
      out_for_delivery: {
        subject: `Out for Delivery - Tracking #${data.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🚚 Out for Delivery</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Your package is out for delivery!</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>Status:</strong> Out for Delivery</p>
                <p><strong>Carrier:</strong> ${data.carrierName}</p>
                <p><strong>Delivery Address:</strong> ${data.receiverAddress}</p>
                <p style="color: #e67e22; font-weight: bold;">📍 Your package will be delivered today!</p>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${trackingUrl}" style="background: #fa709a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Shipment</a>
              </div>
            </div>
          </div>
        `,
        text: `Out for Delivery - Tracking #${data.trackingNumber}\n\nYour package is out for delivery!\n\nTracking Number: ${data.trackingNumber}\nStatus: Out for Delivery\nCarrier: ${data.carrierName}\nDelivery Address: ${data.receiverAddress}\n\n📍 Your package will be delivered today!\n\nTrack your shipment: ${trackingUrl}`,
      },
      delivered: {
        subject: `Package Delivered - Tracking #${data.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #2c3e50; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">✅ Package Delivered</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Your package has been delivered successfully!</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>Status:</strong> Delivered</p>
                <p><strong>Delivered To:</strong> ${data.receiverName}</p>
                <p><strong>Delivery Address:</strong> ${data.receiverAddress}</p>
                ${data.actualDelivery ? `<p><strong>Delivered On:</strong> ${data.actualDelivery.toLocaleDateString()} at ${data.actualDelivery.toLocaleTimeString()}</p>` : ''}
                <p style="color: #27ae60; font-weight: bold;">🎉 Thank you for using our shipping service!</p>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${trackingUrl}" style="background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Delivery Details</a>
              </div>
            </div>
          </div>
        `,
        text: `Package Delivered - Tracking #${data.trackingNumber}\n\nYour package has been delivered successfully!\n\nTracking Number: ${data.trackingNumber}\nStatus: Delivered\nDelivered To: ${data.receiverName}\nDelivery Address: ${data.receiverAddress}${data.actualDelivery ? `\nDelivered On: ${data.actualDelivery.toLocaleDateString()} at ${data.actualDelivery.toLocaleTimeString()}` : ''}\n\n🎉 Thank you for using our shipping service!\n\nView delivery details: ${trackingUrl}`,
      },
      exception: {
        subject: `Delivery Exception - Tracking #${data.trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #721c24; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">⚠️ Delivery Exception</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>There's an issue with your shipment</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #e74c3c;">
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>Status:</strong> Exception</p>
                <p><strong>Carrier:</strong> ${data.carrierName}</p>
                <p style="color: #e74c3c; font-weight: bold;">⚠️ Please contact customer service for assistance.</p>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${trackingUrl}" style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
              </div>
            </div>
          </div>
        `,
        text: `Delivery Exception - Tracking #${data.trackingNumber}\n\nThere's an issue with your shipment\n\nTracking Number: ${data.trackingNumber}\nStatus: Exception\nCarrier: ${data.carrierName}\n\n⚠️ Please contact customer service for assistance.\n\nView details: ${trackingUrl}`,
      },
    };

    return templates[type];
  }

  // Send shipment notification
  static async sendShipmentNotification(
    shipmentId: string,
    status: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception'
  ): Promise<boolean> {
    try {
      // Get shipment details
      const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          sender: true,
          receiver: true,
          senderAddress: true,
          receiverAddress: true,
          carrier: true,
        },
      });

      if (!shipment) {
        console.error('Shipment not found:', shipmentId);
        return false;
      }

      // Prepare email data
      const emailData: ShipmentEmailData = {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        senderName: shipment.sender?.name || 'Unknown Sender',
        receiverName: shipment.receiver?.name || 'Unknown Receiver',
        senderAddress: `${shipment.senderAddress?.street}, ${shipment.senderAddress?.city}, ${shipment.senderAddress?.state} ${shipment.senderAddress?.zipCode}`,
        receiverAddress: `${shipment.receiverAddress?.street}, ${shipment.receiverAddress?.city}, ${shipment.receiverAddress?.state} ${shipment.receiverAddress?.zipCode}`,
        estimatedDelivery: shipment.estimatedDeliveryDate || undefined,
        actualDelivery: shipment.actualDeliveryDate || undefined,
        carrierName: shipment.carrier?.name || 'Unknown Carrier',
        weight: shipment.weight,
        dimensions: `${shipment.length}x${shipment.width}x${shipment.height} cm`,
        cost: shipment.cost,
      };

      // Generate email template
      const template = this.generateShipmentTemplate(status, emailData);

      // Send emails to sender and receiver
      const recipients = [];
      if (shipment.sender?.email) recipients.push(shipment.sender.email);
      if (shipment.receiver?.email) recipients.push(shipment.receiver.email);

      if (recipients.length === 0) {
        console.warn('No email recipients found for shipment:', shipmentId);
        return false;
      }

      const success = await this.sendEmail(
        recipients,
        template.subject,
        template.html,
        template.text
      );

      // Log email notification
      if (success) {
        await prisma.auditLog.create({
          data: {
            action: 'EMAIL_SENT',
            entityType: 'Shipment',
            entityId: shipmentId,
            details: {
              type: 'shipment_notification',
              status,
              recipients,
              trackingNumber: shipment.trackingNumber,
            },
            timestamp: new Date(),
          },
        }).catch(console.error);
      }

      return success;
    } catch (error) {
      console.error('Failed to send shipment notification:', error);
      return false;
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = {
      subject: `Welcome to ${process.env.APP_NAME || 'Exodus Shipping'}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🎉 Welcome to Exodus Shipping!</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for joining Exodus Shipping. We're excited to help you manage your shipments efficiently.</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>What you can do:</h3>
              <ul>
                <li>📦 Create and manage shipments</li>
                <li>📍 Track packages in real-time</li>
                <li>💰 Calculate shipping rates</li>
                <li>📊 View analytics and reports</li>
                <li>👥 Manage team members</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
            </div>
          </div>
        </div>
      `,
      text: `Welcome to ${process.env.APP_NAME || 'Exodus Shipping'}!\n\nHello ${userName}!\n\nThank you for joining Exodus Shipping. We're excited to help you manage your shipments efficiently.\n\nWhat you can do:\n- Create and manage shipments\n- Track packages in real-time\n- Calculate shipping rates\n- View analytics and reports\n- Manage team members\n\nGet started: ${process.env.APP_URL || 'http://localhost:3000'}`,
    };

    return this.sendEmail(userEmail, template.subject, template.html, template.text);
  }

  // Send password reset email
  static async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const template = {
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #721c24; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🔒 Password Reset</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Reset Your Password</h2>
            <p>You requested a password reset for your account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #7f8c8d; font-size: 14px;">This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
          </div>
        </div>
      `,
      text: `Password Reset Request\n\nYou requested a password reset for your account. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request this reset, please ignore this email.`,
    };

    return this.sendEmail(userEmail, template.subject, template.html, template.text);
  }

  // Send email verification
  static async sendEmailVerification(userEmail: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const template = {
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">📧 Verify Your Email</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Please verify your email address</h2>
            <p>To complete your registration, please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${verificationUrl}" style="background: #4facfe; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #7f8c8d; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
        </div>
      `,
      text: `Verify Your Email Address\n\nTo complete your registration, please click the link below to verify your email address:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
    };

    return this.sendEmail(userEmail, template.subject, template.html, template.text);
  }
}

// Initialize email service on module load
EmailService.initialize().catch(console.error);

export default EmailService;