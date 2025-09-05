import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error } = await withAuth(request);
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get detailed user information with company
    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
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

    if (!userDetails) {
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
          { senderId: user.id },
          { receiverId: user.id },
          ...(user.companyId ? [{ senderCompanyId: user.companyId }, { receiverCompanyId: user.companyId }] : []),
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

    // Get recent activity
    const recentActivity = await prisma.auditLog.findMany({
      where: { userId: user.id },
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

    return NextResponse.json({
      success: true,
      user: {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name,
        phone: userDetails.phone,
        role: userDetails.role,
        isActive: userDetails.isActive,
        emailVerified: userDetails.emailVerified,
        lastLoginAt: userDetails.lastLoginAt,
        loginCount: userDetails.loginCount,
        createdAt: userDetails.createdAt,
        updatedAt: userDetails.updatedAt,
        company: userDetails.company,
        shipmentCount: userDetails._count.shipments,
      },
      stats: {
        shipments: shipmentStats,
        totalShipments: Object.values(shipmentStats).reduce((sum, count) => sum + count, 0),
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error } = await withAuth(request);
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    // Validate input
    if (name && (typeof name !== 'string' || name.length < 2 || name.length > 100)) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (phone && (typeof phone !== 'string' || !/^\+?[1-9]\d{1,14}$/.test(phone))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        updatedAt: new Date(),
      },
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
      },
    });

    // Log profile update
    await prisma.auditLog.create({
      data: {
        action: 'PROFILE_UPDATED',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        details: {
          updatedFields: { name, phone },
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        timestamp: new Date(),
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        emailVerified: updatedUser.emailVerified,
        lastLoginAt: updatedUser.lastLoginAt,
        loginCount: updatedUser.loginCount,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        company: updatedUser.company,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}