import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService, rateLimit } from '@/lib/auth';
import { prisma } from '@/lib/database';

const resetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Request password reset
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || 'unknown';
    if (!rateLimit(`reset-request:${clientIP}`, 3, 60 * 60 * 1000)) { // 3 attempts per hour
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = resetRequestSchema.parse(body);
    const { email } = validatedData;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    const response = {
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    };

    if (user && user.isActive) {
      // Generate password reset token
      const resetToken = AuthService.generatePasswordResetToken();
      
      // Store reset token in database
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Log password reset request
      await prisma.auditLog.create({
        data: {
          action: 'PASSWORD_RESET_REQUESTED',
          entityType: 'User',
          entityId: user.id,
          userId: user.id,
          details: {
            email: user.email,
            ip: clientIP,
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
          timestamp: new Date(),
        },
      }).catch(console.error);

      // TODO: Send password reset email
      // await EmailService.sendPasswordResetEmail(email, resetToken);
      
      // In development, return the token (remove in production)
      if (process.env.NODE_ENV === 'development') {
        (response as any).resetToken = resetToken;
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Password reset request error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reset password with token
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || 'unknown';
    if (!rateLimit(`reset-password:${clientIP}`, 5, 60 * 60 * 1000)) { // 5 attempts per hour
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);
    const { token, password } = validatedData;

    // Verify reset token
    if (!AuthService.verifyPasswordResetToken(token)) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find password reset record
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(password);

    // Update password and mark reset token as used
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: passwordReset.userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      // Mark reset token as used
      await tx.passwordReset.update({
        where: { id: passwordReset.id },
        data: {
          usedAt: new Date(),
        },
      });

      // Invalidate all other reset tokens for this user
      await tx.passwordReset.updateMany({
        where: {
          userId: passwordReset.userId,
          usedAt: null,
          id: { not: passwordReset.id },
        },
        data: {
          usedAt: new Date(),
        },
      });
    });

    // Log password reset
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'User',
        entityId: passwordReset.userId,
        userId: passwordReset.userId,
        details: {
          email: passwordReset.user.email,
          ip: clientIP,
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}