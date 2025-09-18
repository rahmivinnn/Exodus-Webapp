import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with configuration
export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/exodus_shipping',
      },
    },
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection utility functions
export class DatabaseService {
  private static instance: DatabaseService;
  private client: PrismaClient;

  private constructor() {
    this.client = prisma;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): PrismaClient {
    return this.client;
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Connection management
  public async connect(): Promise<void> {
    try {
      await this.client.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect from database:', error);
      throw error;
    }
  }

  // Transaction wrapper
  public async transaction<T>(
    callback: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await this.client.$transaction(callback);
  }

  // Soft delete utility
  public async softDelete(model: string, id: string): Promise<any> {
    const modelDelegate = (this.client as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Bulk operations
  public async bulkCreate(model: string, data: any[]): Promise<any> {
    const modelDelegate = (this.client as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.createMany({
      data,
      skipDuplicates: true,
    });
  }

  public async bulkUpdate(model: string, updates: { where: any; data: any }[]): Promise<any[]> {
    const modelDelegate = (this.client as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    const results = [];
    for (const update of updates) {
      const result = await modelDelegate.updateMany(update);
      results.push(result);
    }
    return results;
  }

  // Search utilities
  public async search(model: string, query: string, fields: string[]): Promise<any[]> {
    const modelDelegate = (this.client as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    const searchConditions = fields.map(field => ({
      [field]: {
        contains: query,
        mode: 'insensitive' as const,
      },
    }));

    return await modelDelegate.findMany({
      where: {
        OR: searchConditions,
      },
    });
  }

  // Pagination utility
  public async paginate(
    model: string,
    page: number = 1,
    limit: number = 10,
    where: any = {},
    orderBy: any = { createdAt: 'desc' }
  ): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const modelDelegate = (this.client as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      modelDelegate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      modelDelegate.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Aggregation utilities
  public async aggregate(model: string, aggregation: any): Promise<any> {
    const modelDelegate = (this.client as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.aggregate(aggregation);
  }

  public async groupBy(model: string, grouping: any): Promise<any> {
    const modelDelegate = (this.client as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.groupBy(grouping);
  }

  // Audit logging
  public async logAudit(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.client.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          oldValues,
          newValues,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
      // Don't throw error to prevent breaking the main operation
    }
  }

  // Database seeding utilities
  public async seed(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      // Seed carriers
      await this.seedCarriers();
      
      // Seed admin user
      await this.seedAdminUser();
      
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async seedCarriers(): Promise<void> {
    const carriers = [
      {
        name: 'FedEx',
        code: 'FEDEX',
        type: 'EXPRESS' as const,
        domestic: true,
        international: true,
        regions: ['US', 'CA', 'MX', 'EU', 'AS', 'AU'],
        baseRate: 12.99,
        weightMultiplier: 2.5,
        fuelSurcharge: 0.15,
        phone: '1-800-463-3339',
        email: 'support@fedex.com',
        website: 'https://www.fedex.com',
      },
      {
        name: 'UPS',
        code: 'UPS',
        type: 'EXPRESS' as const,
        domestic: true,
        international: true,
        regions: ['US', 'CA', 'MX', 'EU', 'AS'],
        baseRate: 11.99,
        weightMultiplier: 2.3,
        fuelSurcharge: 0.14,
        phone: '1-800-742-5877',
        email: 'support@ups.com',
        website: 'https://www.ups.com',
      },
      {
        name: 'DHL',
        code: 'DHL',
        type: 'INTERNATIONAL' as const,
        domestic: false,
        international: true,
        regions: ['EU', 'AS', 'AF', 'AU', 'SA'],
        baseRate: 25.99,
        weightMultiplier: 4.2,
        fuelSurcharge: 0.18,
        phone: '1-800-225-5345',
        email: 'support@dhl.com',
        website: 'https://www.dhl.com',
      },
      {
        name: 'USPS',
        code: 'USPS',
        type: 'POSTAL' as const,
        domestic: true,
        international: true,
        regions: ['US'],
        baseRate: 8.95,
        weightMultiplier: 1.5,
        fuelSurcharge: 0.08,
        phone: '1-800-275-8777',
        email: 'support@usps.com',
        website: 'https://www.usps.com',
      },
    ];

    for (const carrier of carriers) {
      await this.client.carrier.upsert({
        where: { code: carrier.code },
        update: carrier,
        create: carrier,
      });
    }

    console.log('Carriers seeded successfully');
  }

  private async seedAdminUser(): Promise<void> {
    const adminUser = {
      email: 'admin@exodus.com',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/Hm', // 'admin123'
      role: 'ADMIN' as const,
      emailVerified: new Date(),
    };

    await this.client.user.upsert({
      where: { email: adminUser.email },
      update: adminUser,
      create: adminUser,
    });

    console.log('Admin user seeded successfully');
  }

  // Database migration utilities
  public async runMigrations(): Promise<void> {
    try {
      // This would typically be handled by Prisma CLI
      // but we can add custom migration logic here if needed
      console.log('Running database migrations...');
      // Add custom migration logic here
      console.log('Database migrations completed');
    } catch (error) {
      console.error('Database migrations failed:', error);
      throw error;
    }
  }

  // Backup utilities
  public async createBackup(): Promise<string> {
    // Implementation would depend on the database provider
    // This is a placeholder for backup functionality
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    
    console.log(`Creating database backup: ${backupName}`);
    // Add actual backup logic here
    
    return backupName;
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Export Prisma client for direct use
export default prisma;