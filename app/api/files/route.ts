import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UploadService } from '@/lib/upload';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/database';

// Rate limiting
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();
const UPLOAD_RATE_LIMIT = 10; // uploads per hour
const UPLOAD_WINDOW = 60 * 60 * 1000; // 1 hour

// Validation schemas
const uploadSchema = z.object({
  category: z.enum(['shipping_label', 'invoice', 'customs_form', 'proof_of_delivery', 'other']),
  shipmentId: z.string().optional(),
  compress: z.boolean().optional().default(false),
  generateThumbnail: z.boolean().optional().default(true)
});

const querySchema = z.object({
  shipmentId: z.string().optional(),
  category: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional()
});

function checkUploadRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = uploadAttempts.get(identifier);

  if (!attempts || now > attempts.resetTime) {
    uploadAttempts.set(identifier, { count: 1, resetTime: now + UPLOAD_WINDOW });
    return true;
  }

  if (attempts.count >= UPLOAD_RATE_LIMIT) {
    return false;
  }

  attempts.count++;
  return true;
}

// POST /api/files - Upload files
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkUploadRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Try again later.' },
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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate options
    const options = {
      category: formData.get('category') as string || 'other',
      shipmentId: formData.get('shipmentId') as string || undefined,
      compress: formData.get('compress') === 'true',
      generateThumbnail: formData.get('generateThumbnail') !== 'false'
    };

    const validatedOptions = uploadSchema.parse(options);

    // Check shipment access if shipmentId provided
    if (validatedOptions.shipmentId) {
      const shipment = await prisma.shipment.findFirst({
        where: {
          id: validatedOptions.shipmentId,
          OR: [
            { senderId: authResult.user.id },
            { receiverId: authResult.user.id },
            { company: { users: { some: { id: authResult.user.id } } } }
          ]
        }
      });

      if (!shipment) {
        return NextResponse.json(
          { error: 'Shipment not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Upload files
    const uploadResults = await UploadService.uploadMultipleFiles(files, {
      ...validatedOptions,
      userId: authResult.user.id
    });

    // Log upload activity
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.id,
        action: 'FILES_UPLOAD',
        entityType: 'File',
        entityId: uploadResults.map(r => r.id).join(','),
        details: {
          fileCount: uploadResults.length,
          category: validatedOptions.category,
          shipmentId: validatedOptions.shipmentId,
          totalSize: uploadResults.reduce((sum, r) => sum + r.size, 0)
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      files: uploadResults,
      message: `Successfully uploaded ${uploadResults.length} file(s)`
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid upload parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET /api/files - List files
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
    const query = querySchema.parse({
      shipmentId: searchParams.get('shipmentId'),
      category: searchParams.get('category'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search')
    });

    const page = parseInt(query.page);
    const limit = Math.min(parseInt(query.limit), 100); // Max 100 files per page
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { uploadedById: authResult.user.id },
        { shipment: { senderId: authResult.user.id } },
        { shipment: { receiverId: authResult.user.id } },
        { shipment: { company: { users: { some: { id: authResult.user.id } } } } }
      ]
    };

    if (query.shipmentId) {
      where.shipmentId = query.shipmentId;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { filename: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Get files with pagination
    const [files, totalCount] = await Promise.all([
      prisma.file.findMany({
        where,
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
        },
        orderBy: { uploadedAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.file.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('File list error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}

// DELETE /api/files - Bulk delete files
export async function DELETE(request: NextRequest) {
  try {
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { fileIds } = await request.json();
    
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'File IDs array required' },
        { status: 400 }
      );
    }

    // Verify user has access to all files
    const files = await prisma.file.findMany({
      where: {
        id: { in: fileIds },
        OR: [
          { uploadedById: authResult.user.id },
          { shipment: { senderId: authResult.user.id } },
          { shipment: { receiverId: authResult.user.id } },
          { shipment: { company: { users: { some: { id: authResult.user.id } } } } }
        ]
      }
    });

    if (files.length !== fileIds.length) {
      return NextResponse.json(
        { error: 'Some files not found or access denied' },
        { status: 404 }
      );
    }

    // Delete files
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        await UploadService.deleteFile(file.id, authResult.user.id);
        deletedFiles.push(file.id);
      } catch (error) {
        errors.push(`${file.originalName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log bulk deletion
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.id,
        action: 'FILES_BULK_DELETE',
        entityType: 'File',
        entityId: deletedFiles.join(','),
        details: {
          deletedCount: deletedFiles.length,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedFiles.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully deleted ${deletedFiles.length} file(s)`
    });

  } catch (error) {
    console.error('Bulk file deletion error:', error);
    return NextResponse.json(
      { error: 'Bulk deletion failed' },
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}