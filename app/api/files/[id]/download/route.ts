import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UploadService } from '@/lib/upload';
import { prisma } from '@/lib/database';
import { readFile } from 'fs/promises';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/files/[id]/download - Download file
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const thumbnail = searchParams.get('thumbnail') === 'true';
    
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

    // Handle S3 files
    if (file.s3Key) {
      try {
        const downloadUrl = await UploadService.getDownloadUrl(file.id, 300); // 5 minutes
        
        // Log download activity
        await prisma.auditLog.create({
          data: {
            userId: authResult.user.id,
            action: 'FILE_DOWNLOAD',
            entityType: 'File',
            entityId: id,
            details: {
              filename: file.originalName,
              category: file.category,
              size: file.size,
              thumbnail
            },
            timestamp: new Date()
          }
        }).catch(console.error);

        // Redirect to S3 signed URL
        return NextResponse.redirect(downloadUrl);
      } catch (error) {
        console.error('S3 download error:', error);
        return NextResponse.json(
          { error: 'Failed to generate download URL' },
          { status: 500 }
        );
      }
    }

    // Handle local files
    const filePath = thumbnail && file.thumbnailPath ? file.thumbnailPath : file.path;
    
    if (!filePath) {
      return NextResponse.json(
        { error: thumbnail ? 'Thumbnail not available' : 'File path not found' },
        { status: 404 }
      );
    }

    try {
      // Check if file exists
      const fileStats = await stat(filePath);
      
      // Read file
      const fileBuffer = await readFile(filePath);
      
      // Determine content type
      let contentType = file.mimeType;
      if (thumbnail) {
        contentType = 'image/jpeg'; // Thumbnails are always JPEG
      }

      // Log download activity
      await prisma.auditLog.create({
        data: {
          userId: authResult.user.id,
          action: 'FILE_DOWNLOAD',
          entityType: 'File',
          entityId: id,
          details: {
            filename: file.originalName,
            category: file.category,
            size: file.size,
            thumbnail
          },
          timestamp: new Date()
        }
      }).catch(console.error);

      // Set appropriate headers
      const headers = new Headers({
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        'Last-Modified': fileStats.mtime.toUTCString()
      });

      // Handle range requests for large files
      const range = request.headers.get('range');
      if (range && !thumbnail) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileStats.size - 1;
        const chunkSize = (end - start) + 1;

        headers.set('Content-Range', `bytes ${start}-${end}/${fileStats.size}`);
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Content-Length', chunkSize.toString());

        const chunk = fileBuffer.slice(start, end + 1);
        return new NextResponse(chunk, {
          status: 206,
          headers
        });
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers
      });

    } catch (error) {
      console.error('Local file download error:', error);
      
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json(
          { error: 'File not found on disk' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to read file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}

// HEAD /api/files/[id]/download - Get file metadata for download
export async function HEAD(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    // Authentication
    const authResult = await AuthService.authenticate(request);
    if (!authResult.success || !authResult.user) {
      return new NextResponse(null, { status: 401 });
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
      return new NextResponse(null, { status: 404 });
    }

    // For S3 files, we can't easily get the actual file stats without downloading
    if (file.s3Key) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': file.mimeType,
          'Content-Length': file.size.toString(),
          'Content-Disposition': `attachment; filename="${file.originalName}"`,
          'Accept-Ranges': 'bytes'
        }
      });
    }

    // For local files, get actual file stats
    if (file.path) {
      try {
        const fileStats = await stat(file.path);
        
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Content-Type': file.mimeType,
            'Content-Length': fileStats.size.toString(),
            'Content-Disposition': `attachment; filename="${file.originalName}"`,
            'Last-Modified': fileStats.mtime.toUTCString(),
            'Accept-Ranges': 'bytes'
          }
        });
      } catch (error) {
        return new NextResponse(null, { status: 404 });
      }
    }

    return new NextResponse(null, { status: 404 });

  } catch (error) {
    console.error('File HEAD error:', error);
    return new NextResponse(null, { status: 500 });
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
    },
  });
}