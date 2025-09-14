import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService, rateLimit } from '@/lib/auth';
import { prisma } from '@/lib/database';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(200, 'Company name too long').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  role: z.enum(['USER', 'MANAGER']).default('USER'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || 'unknown';
    if (!rateLimit(`register:${clientIP}`, 3, 60 * 60 * 1000)) { // 3 attempts per hour
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { name, email, password, companyName, phone, role } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user and company in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let company = null;
      
      // Create company if provided
      if (companyName) {
        company = await tx.company.create({
          data: {
            name: companyName,
            isActive: true,
          },
        });
      }

      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role,
          companyId: company?.id,
          isActive: true,
          emailVerified: false,
        },
      });

      // If user created a company, make them the owner
      if (company) {
        await tx.company.update({
          where: { id: company.id },
          data: { ownerId: user.id },
        });
      }

      return { user, company };
    });

    // Generate email verification token
    const verificationToken = AuthService.generateEmailVerificationToken(email);

    // Log registration
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: result.user.id,
        userId: result.user.id,
        details: {
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          companyId: result.company?.id,
          ip: clientIP,
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    // TODO: Send verification email
    // await EmailService.sendVerificationEmail(email, verificationToken);

    // Generate JWT token for immediate login
    const user = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role as 'ADMIN' | 'MANAGER' | 'USER',
      companyId: result.user.companyId || undefined,
      isActive: result.user.isActive,
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt,
    };

    const token = AuthService.generateToken(user);

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        emailVerified: false,
      },
      token,
      verificationToken, // In production, don't send this in response
    });

    // Set HTTP-only cookie for token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60, // 1 day
      path: '/',
    };

    response.cookies.set('auth-token', token, cookieOptions);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
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