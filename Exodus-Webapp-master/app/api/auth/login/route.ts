import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService, rateLimit } from '@/lib/auth';
import { prisma } from '@/lib/database';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || 'unknown';
    if (!rateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { email, password, rememberMe } = validatedData;

    // Authenticate user
    const user = await AuthService.authenticateUser(email, password);
    
    if (!user) {
      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          entityType: 'User',
          entityId: email,
          details: {
            email,
            ip: clientIP,
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
          timestamp: new Date(),
        },
      }).catch(console.error);

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = AuthService.generateToken(user);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    }).catch(console.error);

    // Log successful login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
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

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      token,
    });

    // Set HTTP-only cookie for token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/',
    };

    response.cookies.set('auth-token', token, cookieOptions);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}