import { NextRequest } from 'next/server';
import { writeFile, mkdir, unlink, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './database';
// Import sharp with fallback
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp not available, image processing disabled');
  sharp = null;
}
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// File upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    document: ['pdf', 'doc', 'docx', 'txt'],
    shipping: ['pdf', 'png', 'jpg', 'jpeg']
  },
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  useS3: process.env.USE_S3 === 'true'
};

// S3 client configuration
const s3Client = UPLOAD_CONFIG.useS3 ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
}) : null;

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'exodus-shipping';

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path?: string;
  s3Key?: string;
}

export interface UploadOptions {
  category: 'shipping_label' | 'invoice' | 'customs_form' | 'proof_of_delivery' | 'other';
  shipmentId?: string;
  userId: string;
  compress?: boolean;
  generateThumbnail?: boolean;
}

export class UploadService {
  /**
   * Upload file from form data
   */
  static async uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file, options.category);

      // Generate unique filename
      const fileExtension = extname(file.name).toLowerCase();
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const originalName = file.name;

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      let processedBuffer = buffer;

      // Process image if needed
      if (this.isImage(file.type) && options.compress) {
        processedBuffer = await this.compressImage(buffer);
      }

      let uploadResult: UploadResult;

      if (UPLOAD_CONFIG.useS3) {
        uploadResult = await this.uploadToS3(
          processedBuffer,
          uniqueFilename,
          file.type,
          options
        );
      } else {
        uploadResult = await this.uploadToLocal(
          processedBuffer,
          uniqueFilename,
          file.type,
          options
        );
      }

      // Save file record to database
      const fileRecord = await prisma.file.create({
        data: {
          id: uploadResult.id,
          filename: uniqueFilename,
          originalName,
          mimeType: file.type,
          size: processedBuffer.length,
          category: options.category,
          url: uploadResult.url,
          path: uploadResult.path,
          s3Key: uploadResult.s3Key,
          shipmentId: options.shipmentId,
          uploadedById: options.userId,
          uploadedAt: new Date()
        }
      });

      // Generate thumbnail for images
      if (this.isImage(file.type) && options.generateThumbnail) {
        await this.generateThumbnail(uploadResult, processedBuffer);
      }

      // Log upload activity
      await prisma.auditLog.create({
        data: {
          userId: options.userId,
          action: 'FILE_UPLOAD',
          entityType: 'File',
          entityId: uploadResult.id,
          details: {
            filename: originalName,
            category: options.category,
            size: processedBuffer.length,
            shipmentId: options.shipmentId
          },
          timestamp: new Date()
        }
      });

      return {
        ...uploadResult,
        originalName,
        mimeType: file.type,
        size: processedBuffer.length
      };

    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: File[],
    options: UploadOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, options);
        results.push(result);
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some files failed to upload:', errors);
    }

    return results;
  }

  /**
   * Delete file
   */
  static async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId }
      });

      if (!file) {
        throw new Error('File not found');
      }

      // Delete from storage
      if (file.s3Key && UPLOAD_CONFIG.useS3) {
        await this.deleteFromS3(file.s3Key);
      } else if (file.path) {
        await this.deleteFromLocal(file.path);
      }

      // Delete thumbnail if exists
      if (file.thumbnailPath) {
        if (UPLOAD_CONFIG.useS3) {
          await this.deleteFromS3(file.thumbnailPath);
        } else {
          await this.deleteFromLocal(file.thumbnailPath);
        }
      }

      // Delete from database
      await prisma.file.delete({
        where: { id: fileId }
      });

      // Log deletion
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'FILE_DELETE',
          entityType: 'File',
          entityId: fileId,
          details: {
            filename: file.originalName,
            category: file.category
          },
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file download URL
   */
  static async getDownloadUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId }
      });

      if (!file) {
        throw new Error('File not found');
      }

      if (file.s3Key && UPLOAD_CONFIG.useS3) {
        return await this.getS3SignedUrl(file.s3Key, expiresIn);
      } else {
        return file.url;
      }

    } catch (error) {
      console.error('Get download URL error:', error);
      throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get files by shipment
   */
  static async getFilesByShipment(shipmentId: string): Promise<any[]> {
    return await prisma.file.findMany({
      where: { shipmentId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Validate file
   */
  private static validateFile(file: File, category: string): void {
    // Check file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      throw new Error(`File size exceeds limit of ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`);
    }

    // Check file type
    const fileExtension = extname(file.name).toLowerCase().slice(1);
    const allowedTypes = UPLOAD_CONFIG.allowedTypes.shipping;
    
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check filename
    if (!file.name || file.name.trim() === '') {
      throw new Error('Invalid filename');
    }
  }

  /**
   * Upload to S3
   */
  private static async uploadToS3(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }

    const key = `uploads/${options.category}/${filename}`;
    const id = uuidv4();

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
        category: options.category,
        userId: options.userId,
        shipmentId: options.shipmentId || '',
        uploadId: id
      }
    });

    await s3Client.send(command);

    const url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      id,
      filename,
      originalName: filename,
      mimeType,
      size: buffer.length,
      url,
      s3Key: key
    };
  }

  /**
   * Upload to local storage
   */
  private static async uploadToLocal(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const uploadDir = join(UPLOAD_CONFIG.uploadDir, options.category);
    const filePath = join(uploadDir, filename);
    const id = uuidv4();

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    await writeFile(filePath, buffer);

    const url = `/api/files/${id}/download`;

    return {
      id,
      filename,
      originalName: filename,
      mimeType,
      size: buffer.length,
      url,
      path: filePath
    };
  }

  /**
   * Delete from S3
   */
  private static async deleteFromS3(key: string): Promise<void> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key
    });

    await s3Client.send(command);
  }

  /**
   * Delete from local storage
   */
  private static async deleteFromLocal(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (error) {
      // File might not exist, ignore error
      console.warn('Failed to delete local file:', path);
    }
  }

  /**
   * Get S3 signed URL
   */
  private static async getS3SignedUrl(key: string, expiresIn: number): Promise<string> {
    if (!s3Client) {
      throw new Error('S3 client not configured');
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Compress image
   */
  private static async compressImage(buffer: Buffer): Promise<Buffer> {
    if (!sharp) {
      console.warn('Sharp not available, skipping compression');
      return buffer;
    }
    
    try {
      return await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return buffer;
    }
  }

  /**
   * Generate thumbnail
   */
  private static async generateThumbnail(
    uploadResult: UploadResult,
    buffer: Buffer
  ): Promise<void> {
    if (!sharp) {
      console.warn('Sharp not available, skipping thumbnail generation');
      return;
    }
    
    try {
      const thumbnailBuffer = await sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailFilename = `thumb_${uploadResult.filename}`;
      
      if (UPLOAD_CONFIG.useS3 && uploadResult.s3Key) {
        const thumbnailKey = uploadResult.s3Key.replace(uploadResult.filename, thumbnailFilename);
        
        const command = new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg'
        });

        await s3Client!.send(command);
        
        // Update file record with thumbnail info
        await prisma.file.update({
          where: { id: uploadResult.id },
          data: {
            thumbnailPath: thumbnailKey,
            thumbnailUrl: `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`
          }
        });
      } else if (uploadResult.path) {
        const thumbnailPath = uploadResult.path.replace(uploadResult.filename, thumbnailFilename);
        await writeFile(thumbnailPath, thumbnailBuffer);
        
        // Update file record with thumbnail info
        await prisma.file.update({
          where: { id: uploadResult.id },
          data: {
            thumbnailPath,
            thumbnailUrl: `/api/files/${uploadResult.id}/thumbnail`
          }
        });
      }

    } catch (error) {
      console.warn('Thumbnail generation failed:', error);
    }
  }

  /**
   * Check if file is image
   */
  private static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Get file statistics
   */
  static async getFileStats(userId?: string): Promise<any> {
    const where = userId ? { uploadedById: userId } : {};

    const [totalFiles, totalSize, filesByCategory] = await Promise.all([
      prisma.file.count({ where }),
      prisma.file.aggregate({
        where,
        _sum: { size: true }
      }),
      prisma.file.groupBy({
        by: ['category'],
        where,
        _count: { id: true },
        _sum: { size: true }
      })
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      filesByCategory: filesByCategory.map(item => ({
        category: item.category,
        count: item._count.id,
        size: item._sum.size || 0
      }))
    };
  }

  /**
   * Clean up old files
   */
  static async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldFiles = await prisma.file.findMany({
      where: {
        uploadedAt: { lt: cutoffDate },
        category: 'other' // Only cleanup non-essential files
      }
    });

    let deletedCount = 0;

    for (const file of oldFiles) {
      try {
        if (file.s3Key && UPLOAD_CONFIG.useS3) {
          await this.deleteFromS3(file.s3Key);
        } else if (file.path) {
          await this.deleteFromLocal(file.path);
        }

        await prisma.file.delete({
          where: { id: file.id }
        });

        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete old file ${file.id}:`, error);
      }
    }

    return deletedCount;
  }
}