import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, AuthService } from '@/lib/auth';
import { prisma } from '@/lib/database';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  companyId: z.string().uuid().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Get all users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const { user, error } = await withAuth(request, 'MANAGER');
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = querySchema.parse(queryParams);

    const { page, limit, search, role, companyId, isActive, sortBy, sortOrder } = validatedQuery;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Non-admin users can only see users from their company
    if (user.role !== 'ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }

    // Apply filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (companyId) where.companyId = companyId;
    if (isActive !== undefined) where.isActive = isActive;

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              shipments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      company: user.company,
      shipmentCount: user._count.shipments,
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      filters: {
        search,
        role,
        companyId,
        isActive,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const { user, error } = await withAuth(request, 'ADMIN');
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const { name, email, password, phone, role, companyId, isActive } = validatedData;

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

    // Validate company if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        companyId,
        isActive,
        emailVerified: false,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log user creation
    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: newUser.id,
        userId: user.id,
        details: {
          createdUser: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            companyId: newUser.companyId,
          },
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    // Remove sensitive data from response
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: userResponse,
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    
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

// Bulk operations
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    const { user, error } = await withAuth(request, 'ADMIN');
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, userIds, data } = body;

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid bulk operation data' },
        { status: 400 }
      );
    }

    let result;
    let auditAction;

    switch (action) {
      case 'activate':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true, updatedAt: new Date() },
        });
        auditAction = 'USERS_ACTIVATED';
        break;

      case 'deactivate':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false, updatedAt: new Date() },
        });
        auditAction = 'USERS_DEACTIVATED';
        break;

      case 'update':
        const validatedUpdateData = updateUserSchema.parse(data);
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { ...validatedUpdateData, updatedAt: new Date() },
        });
        auditAction = 'USERS_BULK_UPDATED';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid bulk action' },
          { status: 400 }
        );
    }

    // Log bulk operation
    await prisma.auditLog.create({
      data: {
        action: auditAction,
        entityType: 'User',
        entityId: userIds.join(','),
        userId: user.id,
        details: {
          action,
          userIds,
          data,
          affectedCount: result.count,
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      affectedCount: result.count,
    });
  } catch (error) {
    console.error('Bulk user operation error:', error);
    
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}