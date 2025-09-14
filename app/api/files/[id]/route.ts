import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UploadService } from '@/lib/upload';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Validation schemas
const updateFileSchema = z.object({
  originalName: z.string().min(1).max(255).optional(),
  category: z.enum(['shipping_label', 'invoice', 'customs_form', 'proof_of_delivery', 'other']).optional(),
  shipmentId: z.string().optional()
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/files/[id] - Get file details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find file with access check
    const file = await prisma.file.findFirst({
      where: {
        id,
        OR: [
          { uploadedById: authResult.user.id },
          { shipment: { senderId: authResult.user.id } },
          { shipment: { receiverId: authResult.user.id } },
          { shipment: { company: { users: { some: { id: authResult.user.id } } } } }
        ]
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
            status: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      );
    }

    // Generate download URL if needed
    let downloadUrl = file.url;
    if (file.s3Key) {
      try {
        downloadUrl = await UploadService.getDownloadUrl(file.id);
      } catch (error) {
        console.warn('Failed to generate download URL:', error);
      }
    }

    return NextResponse.json({
      ...file,
      downloadUrl
    });

  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}

// PUT /api/files/[id] - Update file metadata
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = updateFileSchema.parse(body);

    // Find file with access check
    const file = await prisma.file.findFirst({
      where: {
        id,
        OR: [
          { uploadedById: authResult.user.id },
          { shipment: { senderId: authResult.user.id } },
          { shipment: { receiverId: authResult.user.id } },
          { shipment: { company: { users: { some: { id: authResult.user.id } } } } }
        ]
      }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      );
    }

    // Check shipment access if changing shipmentId
    if (validatedData.shipmentId && validatedData.shipmentId !== file.shipmentId) {
      const shipment = await prisma.shipment.findFirst({
        where: {
          id: validatedData.shipmentId,
          OR: [
            { senderId: authResult.user.id },
            { receiverId: authResult.user.id },
            { company: { users: { some: { id: authResult.user.id } } } }
          ]
        }
      });

      if (!shipment) {
        return NextResponse.json(
          { error: 'Target shipment not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Update file
    const updatedFile = await prisma.file.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
            status: true
          }
        }
      }
    });

    // Log update activity
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.id,
        action: 'FILE_UPDATE',
        entityType: 'File',
        entityId: id,
        details: {
          changes: validatedData,
          originalName: file.originalName
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      file: updatedFile,
      message: 'File updated successfully'
    });

  } catch (error) {
    console.error('Update file error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[id] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find file with access check
    const file = await prisma.file.findFirst({
      where: {
        id,
        OR: [
          { uploadedById: authResult.user.id },
          { shipment: { senderId: authResult.user.id } },
          { shipment: { receiverId: authResult.user.id } },
          { shipment: { company: { users: { some: { id: authResult.user.id } } } } }
        ]
      }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      );
    }

    // Delete file
    await UploadService.deleteFile(id, authResult.user.id);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}