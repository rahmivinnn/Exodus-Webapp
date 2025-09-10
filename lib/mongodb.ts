import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'exodus_logistics';

// Global variable to store the MongoDB client and database instances
const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
  mongoDb: Db | undefined;
};

// MongoDB client instance
let mongoClient: MongoClient;
let mongoDb: Db;

// Initialize MongoDB connection
export async function connectToMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  if (globalForMongo.mongoClient && globalForMongo.mongoDb) {
    return {
      client: globalForMongo.mongoClient,
      db: globalForMongo.mongoDb,
    };
  }

  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await mongoClient.connect();
    mongoDb = mongoClient.db(MONGODB_DB);

    // Store in global for reuse in development
    if (process.env.NODE_ENV !== 'production') {
      globalForMongo.mongoClient = mongoClient;
      globalForMongo.mongoDb = mongoDb;
    }

    console.log('Connected to MongoDB successfully');
    return { client: mongoClient, db: mongoDb };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Get MongoDB database instance
export async function getMongoDB(): Promise<Db> {
  if (mongoDb) {
    return mongoDb;
  }

  const { db } = await connectToMongoDB();
  return db;
}

// Get MongoDB collection
export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  const db = await getMongoDB();
  return db.collection<T>(collectionName);
}

// MongoDB service class
export class MongoDBService {
  private static instance: MongoDBService;
  private client: MongoClient;
  private db: Db;

  private constructor(client: MongoClient, db: Db) {
    this.client = client;
    this.db = db;
  }

  public static async getInstance(): Promise<MongoDBService> {
    if (!MongoDBService.instance) {
      const { client, db } = await connectToMongoDB();
      MongoDBService.instance = new MongoDBService(client, db);
    }
    return MongoDBService.instance;
  }

  public getClient(): MongoClient {
    return this.client;
  }

  public getDb(): Db {
    return this.db;
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.db.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
      return false;
    }
  }

  // Create indexes for better performance
  public async createIndexes(): Promise<void> {
    try {
      // API Keys collection indexes
      const apiKeysCollection = this.db.collection('api_keys');
      await apiKeysCollection.createIndex({ key: 1 }, { unique: true });
      await apiKeysCollection.createIndex({ userId: 1 });
      await apiKeysCollection.createIndex({ isActive: 1 });
      await apiKeysCollection.createIndex({ expiresAt: 1 });

      // Users collection indexes
      const usersCollection = this.db.collection('users');
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      await usersCollection.createIndex({ username: 1 }, { unique: true, sparse: true });
      await usersCollection.createIndex({ role: 1 });

      // Shipments collection indexes
      const shipmentsCollection = this.db.collection('shipments');
      await shipmentsCollection.createIndex({ trackingNumber: 1 }, { unique: true });
      await shipmentsCollection.createIndex({ userId: 1 });
      await shipmentsCollection.createIndex({ status: 1 });
      await shipmentsCollection.createIndex({ createdAt: -1 });

      // Audit logs collection indexes
      const auditLogsCollection = this.db.collection('audit_logs');
      await auditLogsCollection.createIndex({ userId: 1 });
      await auditLogsCollection.createIndex({ action: 1 });
      await auditLogsCollection.createIndex({ resource: 1 });
      await auditLogsCollection.createIndex({ createdAt: -1 });

      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.error('Failed to create MongoDB indexes:', error);
      throw error;
    }
  }

  // Close connection
  public async close(): Promise<void> {
    try {
      await this.client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Failed to close MongoDB connection:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mongoDB = MongoDBService.getInstance();

// Export connection function
export default connectToMongoDB;