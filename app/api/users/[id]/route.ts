import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, AuthService } from '@/lib/auth';
import { prisma } from '@/lib/database';

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { user, error } = await withAuth(request);
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate UUID
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check permissions
    const canViewUser = 
      user.role === 'ADMIN' || 
      user.id === id || 
      (user.role === 'MANAGER' && user.companyId);

    if (!canViewUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Build where clause based on permissions
    const where: any = { id };
    if (user.role !== 'ADMIN' && user.id !== id) {
      where.companyId = user.companyId;
    }

    // Get user details
    const targetUser = await prisma.user.findFirst({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            website: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            shipments: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user statistics
    const stats = await prisma.shipment.groupBy({
      by: ['status'],
      where: {
        OR: [
          { senderId: targetUser.id },
          { receiverId: targetUser.id },
        ],
      },
      _count: {
        status: true,
      },
    });

    const shipmentStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Get recent activity (only for the user themselves or admins)
    let recentActivity = [];
    if (user.id === id || user.role === 'ADMIN') {
      recentActivity = await prisma.auditLog.findMany({
        where: { userId: targetUser.id },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          entityType: true,
          timestamp: true,
          details: true,
        },
      });
    }

    // Remove sensitive data
    const { password, ...userResponse } = targetUser;

    return NextResponse.json({
      success: true,
      data: {
        ...userResponse,
        shipmentCount: targetUser._count.shipments,
        stats: {
          shipments: shipmentStats,
          totalShipments: Object.values(shipmentStats).reduce((sum, count) => sum + count, 0),
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { user, error } = await withAuth(request);
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate UUID
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Check if this is a password change request
    if (body.currentPassword) {
      return handlePasswordChange(request, user, id, body);
    }

    const validatedData = updateUserSchema.parse(body);

    // Check permissions
    const canUpdateUser = 
      user.role === 'ADMIN' || 
      (user.role === 'MANAGER' && user.companyId) ||
      (user.id === id && !validatedData.role && !validatedData.isActive); // Users can only update their own basic info

    if (!canUpdateUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Additional permission checks
    if (user.role !== 'ADMIN') {
      // Managers can only update users in their company
      if (user.role === 'MANAGER' && targetUser.companyId !== user.companyId) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Users can only update themselves
      if (user.role === 'USER' && user.id !== id) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Non-admins cannot change roles or active status
      if (validatedData.role || validatedData.isActive !== undefined) {
        return NextResponse.json(
          { error: 'Insufficient permissions to change role or status' },
          { status: 403 }
        );
      }
    }

    // Validate company if provided
    if (validatedData.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: validatedData.companyId },
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
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

    // Log user update
    await prisma.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: id,
        userId: user.id,
        details: {
          updatedFields: validatedData,
          targetUser: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
          },
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    // Remove sensitive data
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse,
    });
  } catch (error) {
    console.error('Update user error:', error);
    
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

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const { user, error } = await withAuth(request, 'ADMIN');
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate UUID
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shipments: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has associated shipments
    if (targetUser._count.shipments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with associated shipments. Deactivate instead.' },
        { status: 400 }
      );
    }

    // Soft delete by deactivating
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${targetUser.email}`,
        updatedAt: new Date(),
      },
    });

    // Log user deletion
    await prisma.auditLog.create({
      data: {
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: id,
        userId: user.id,
        details: {
          deletedUser: {
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.name,
            role: targetUser.role,
          },
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle password change
async function handlePasswordChange(
  request: NextRequest,
  user: any,
  targetUserId: string,
  body: any
) {
  try {
    const validatedData = changePasswordSchema.parse(body);
    const { currentPassword, newPassword } = validatedData;

    // Only users can change their own password, or admins can change any password
    if (user.id !== targetUserId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password (skip for admins changing other users' passwords)
    if (user.id === targetUserId) {
      const isCurrentPasswordValid = await AuthService.comparePassword(
        currentPassword,
        targetUser.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Log password change
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        entityType: 'User',
        entityId: targetUserId,
        userId: user.id,
        details: {
          targetUser: {
            id: targetUser.id,
            email: targetUser.email,
          },
          changedByAdmin: user.id !== targetUserId,
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}