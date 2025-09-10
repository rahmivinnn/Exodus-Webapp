import crypto from 'crypto';
import { getCollection } from './mongodb';

// API Key interfaces
export interface ApiKey {
  _id?: string;
  id: string;
  name: string;
  key: string;
  permissions: string[];
  userId: string;
  lastUsed?: Date;
  usageCount: number;
  rateLimit?: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  userId: string;
  rateLimit?: number;
  expiresAt?: Date;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: ApiKey;
  error?: string;
}

// API Key permissions
export const API_KEY_PERMISSIONS = {
  // Shipment permissions
  SHIPMENTS_READ: 'shipments:read',
  SHIPMENTS_CREATE: 'shipments:create',
  SHIPMENTS_UPDATE: 'shipments:update',
  SHIPMENTS_DELETE: 'shipments:delete',
  
  // Tracking permissions
  TRACKING_READ: 'tracking:read',
  TRACKING_UPDATE: 'tracking:update',
  
  // Rate permissions
  RATES_READ: 'rates:read',
  RATES_CREATE: 'rates:create',
  
  // User permissions
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  
  // Admin permissions
  ADMIN_ALL: 'admin:all',
  
  // Analytics permissions
  ANALYTICS_READ: 'analytics:read',
} as const;

export type ApiKeyPermission = typeof API_KEY_PERMISSIONS[keyof typeof API_KEY_PERMISSIONS];

// Default permissions for different user roles
export const DEFAULT_PERMISSIONS = {
  USER: [
    API_KEY_PERMISSIONS.SHIPMENTS_READ,
    API_KEY_PERMISSIONS.SHIPMENTS_CREATE,
    API_KEY_PERMISSIONS.TRACKING_READ,
    API_KEY_PERMISSIONS.RATES_READ,
  ],
  MANAGER: [
    API_KEY_PERMISSIONS.SHIPMENTS_READ,
    API_KEY_PERMISSIONS.SHIPMENTS_CREATE,
    API_KEY_PERMISSIONS.SHIPMENTS_UPDATE,
    API_KEY_PERMISSIONS.TRACKING_READ,
    API_KEY_PERMISSIONS.TRACKING_UPDATE,
    API_KEY_PERMISSIONS.RATES_READ,
    API_KEY_PERMISSIONS.RATES_CREATE,
    API_KEY_PERMISSIONS.USERS_READ,
    API_KEY_PERMISSIONS.ANALYTICS_READ,
  ],
  ADMIN: [
    API_KEY_PERMISSIONS.ADMIN_ALL,
  ],
  API_USER: [
    API_KEY_PERMISSIONS.SHIPMENTS_READ,
    API_KEY_PERMISSIONS.TRACKING_READ,
    API_KEY_PERMISSIONS.RATES_READ,
  ],
};

// API Key service class
export class ApiKeyService {
  private static instance: ApiKeyService;

  private constructor() {}

  public static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  // Generate a secure API key
  private generateApiKey(): string {
    const prefix = 'exodus_';
    const randomBytes = crypto.randomBytes(32);
    const key = randomBytes.toString('hex');
    return `${prefix}${key}`;
  }

  // Create a new API key
  public async createApiKey(request: CreateApiKeyRequest): Promise<ApiKey> {
    const collection = await getCollection<ApiKey>('api_keys');
    
    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      name: request.name,
      key: this.generateApiKey(),
      permissions: request.permissions,
      userId: request.userId,
      usageCount: 0,
      rateLimit: request.rateLimit || 1000, // Default rate limit
      isActive: true,
      expiresAt: request.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(apiKey);
    apiKey._id = result.insertedId.toString();
    
    return apiKey;
  }

  // Validate API key
  public async validateApiKey(key: string): Promise<ApiKeyValidationResult> {
    try {
      const collection = await getCollection<ApiKey>('api_keys');
      
      const apiKey = await collection.findOne({
        key,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      if (!apiKey) {
        return {
          isValid: false,
          error: 'Invalid or expired API key'
        };
      }

      // Update usage count and last used timestamp
      await collection.updateOne(
        { _id: apiKey._id },
        {
          $inc: { usageCount: 1 },
          $set: { lastUsed: new Date(), updatedAt: new Date() }
        }
      );

      return {
        isValid: true,
        apiKey: {
          ...apiKey,
          usageCount: apiKey.usageCount + 1,
          lastUsed: new Date(),
        }
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return {
        isValid: false,
        error: 'Internal server error'
      };
    }
  }

  // Get API keys for a user
  public async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const collection = await getCollection<ApiKey>('api_keys');
    
    return await collection.find({
      userId,
      isActive: true
    }).sort({ createdAt: -1 }).toArray();
  }

  // Get API key by ID
  public async getApiKeyById(id: string, userId: string): Promise<ApiKey | null> {
    const collection = await getCollection<ApiKey>('api_keys');
    
    return await collection.findOne({
      id,
      userId,
      isActive: true
    });
  }

  // Update API key
  public async updateApiKey(
    id: string, 
    userId: string, 
    updates: Partial<Pick<ApiKey, 'name' | 'permissions' | 'rateLimit' | 'expiresAt'>>
  ): Promise<ApiKey | null> {
    const collection = await getCollection<ApiKey>('api_keys');
    
    const result = await collection.findOneAndUpdate(
      { id, userId, isActive: true },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  // Deactivate API key
  public async deactivateApiKey(id: string, userId: string): Promise<boolean> {
    const collection = await getCollection<ApiKey>('api_keys');
    
    const result = await collection.updateOne(
      { id, userId, isActive: true },
      {
        $set: {
          isActive: false,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  // Delete API key
  public async deleteApiKey(id: string, userId: string): Promise<boolean> {
    const collection = await getCollection<ApiKey>('api_keys');
    
    const result = await collection.deleteOne({
      id,
      userId
    });

    return result.deletedCount > 0;
  }

  // Check if user has permission
  public hasPermission(apiKey: ApiKey, permission: ApiKeyPermission): boolean {
    if (apiKey.permissions.includes(API_KEY_PERMISSIONS.ADMIN_ALL)) {
      return true;
    }
    
    return apiKey.permissions.includes(permission);
  }

  // Check rate limit
  public async checkRateLimit(apiKey: ApiKey): Promise<boolean> {
    if (!apiKey.rateLimit) {
      return true; // No rate limit set
    }

    // This is a simple implementation
    // In production, you might want to use Redis or similar for rate limiting
    return apiKey.usageCount < apiKey.rateLimit;
  }

  // Create temporary API key for testing
  public async createTemporaryApiKey(userId: string, durationHours: number = 24): Promise<ApiKey> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    return await this.createApiKey({
      name: `Temporary API Key - ${new Date().toISOString()}`,
      permissions: DEFAULT_PERMISSIONS.API_USER,
      userId,
      expiresAt,
      rateLimit: 100, // Lower rate limit for temporary keys
    });
  }

  // Clean up expired API keys
  public async cleanupExpiredKeys(): Promise<number> {
    const collection = await getCollection<ApiKey>('api_keys');
    
    const result = await collection.updateMany(
      {
        expiresAt: { $lt: new Date() },
        isActive: true
      },
      {
        $set: {
          isActive: false,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount;
  }
}

// Export singleton instance
export const apiKeyService = ApiKeyService.getInstance();

// Helper function to create temporary API key for deployment testing
export async function createTestApiKey(userId: string): Promise<ApiKey> {
  return await apiKeyService.createTemporaryApiKey(userId, 72); // 3 days
}

export default ApiKeyService;