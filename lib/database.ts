import { PrismaClient, User, RateCalculation, Shipment, ShipmentStatus } from "@prisma/client";

// ============================================================================
// DATABASE SERVICE CLASS
// ============================================================================

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }

  // ========================================================================
  // USER MANAGEMENT
  // ========================================================================

  async createUser(data: {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company,
        phone: data.phone,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // ========================================================================
  // RATE CALCULATIONS
  // ========================================================================

  async saveRateCalculation(data: {
    userId?: string;
    origin: string;
    destination: string;
    equipmentType: string;
    weight?: number;
    distance?: number;
    totalCost: number;
    baseRate: number;
    weightCost: number;
    distanceCost: number;
    fuelSurcharge: number;
    additionalSurcharges: number;
    estimatedDays: number;
    confidence: number;
  }): Promise<RateCalculation> {
    return await this.prisma.rateCalculation.create({
      data: {
        userId: data.userId,
        origin: data.origin,
        destination: data.destination,
        equipmentType: data.equipmentType,
        weight: data.weight,
        distance: data.distance,
        totalCost: data.totalCost,
        baseRate: data.baseRate,
        weightCost: data.weightCost,
        distanceCost: data.distanceCost,
        fuelSurcharge: data.fuelSurcharge,
        additionalSurcharges: data.additionalSurcharges,
        estimatedDays: data.estimatedDays,
        confidence: data.confidence,
      },
    });
  }

  async getUserRateHistory(userId: string, limit: number = 50): Promise<RateCalculation[]> {
    return await this.prisma.rateCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getRateCalculationById(id: string): Promise<RateCalculation | null> {
    return await this.prisma.rateCalculation.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async markRateAsBooked(id: string): Promise<RateCalculation> {
    return await this.prisma.rateCalculation.update({
      where: { id },
      data: { isBooked: true },
    });
  }

  // ========================================================================
  // SHIPMENTS
  // ========================================================================

  async createShipment(data: {
    userId: string;
    trackingNumber: string;
    carrier: string;
    serviceType?: string;
    origin: string;
    destination: string;
    equipmentType: string;
    weight?: number;
    distance?: number;
    totalCost?: number;
    pickupDate?: Date;
    deliveryDate?: Date;
    notes?: string;
  }): Promise<Shipment> {
    return await this.prisma.shipment.create({
      data: {
        userId: data.userId,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        serviceType: data.serviceType,
        origin: data.origin,
        destination: data.destination,
        equipmentType: data.equipmentType,
        weight: data.weight,
        distance: data.distance,
        totalCost: data.totalCost,
        pickupDate: data.pickupDate,
        deliveryDate: data.deliveryDate,
        notes: data.notes,
      },
    });
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    return await this.prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        user: true,
        documents: true,
        trackingEvents: {
          orderBy: { timestamp: "desc" },
        },
      },
    });
  }

  async getUserShipments(userId: string, limit: number = 50): Promise<Shipment[]> {
    return await this.prisma.shipment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        documents: true,
        trackingEvents: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    });
  }

  async updateShipmentStatus(
    trackingNumber: string, 
    status: ShipmentStatus
  ): Promise<Shipment> {
    return await this.prisma.shipment.update({
      where: { trackingNumber },
      data: { status },
    });
  }

  async addTrackingEvent(data: {
    shipmentId: string;
    status: string;
    location?: string;
    description?: string;
    timestamp: Date;
  }) {
    return await this.prisma.trackingEvent.create({
      data: {
        shipmentId: data.shipmentId,
        status: data.status,
        location: data.location,
        description: data.description,
        timestamp: data.timestamp,
      },
    });
  }

  // ========================================================================
  // ANALYTICS AND REPORTING
  // ========================================================================

  async getRateCalculationStats(userId?: string) {
    const whereClause = userId ? { userId } : {};

    const [totalCalculations, averageCost, mostPopularRoute] = await Promise.all([
      this.prisma.rateCalculation.count({
        where: whereClause,
      }),
      this.prisma.rateCalculation.aggregate({
        where: whereClause,
        _avg: { totalCost: true },
      }),
      this.prisma.rateCalculation.groupBy({
        by: ["origin", "destination"],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
    ]);

    return {
      totalCalculations,
      averageCost: averageCost._avg.totalCost || 0,
      mostPopularRoute: mostPopularRoute[0] || null,
    };
  }

  async getShipmentStats(userId?: string) {
    const whereClause = userId ? { userId } : {};

    const [totalShipments, statusBreakdown] = await Promise.all([
      this.prisma.shipment.count({
        where: whereClause,
      }),
      this.prisma.shipment.groupBy({
        by: ["status"],
        where: whereClause,
        _count: { id: true },
      }),
    ]);

    return {
      totalShipments,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ========================================================================
  // CARRIER RATES CACHING
  // ========================================================================

  async cacheCarrierRate(data: {
    carrier: string;
    origin: string;
    destination: string;
    equipmentType: string;
    serviceType: string;
    baseRate: number;
    fuelSurcharge: number;
    totalRate: number;
    transitDays: number;
    validFrom: Date;
    validTo?: Date;
  }) {
    return await this.prisma.carrierRate.upsert({
      where: {
        carrier_origin_destination_equipmentType_serviceType_validFrom: {
          carrier: data.carrier,
          origin: data.origin,
          destination: data.destination,
          equipmentType: data.equipmentType,
          serviceType: data.serviceType,
          validFrom: data.validFrom,
        },
      },
      update: {
        baseRate: data.baseRate,
        fuelSurcharge: data.fuelSurcharge,
        totalRate: data.totalRate,
        transitDays: data.transitDays,
        validTo: data.validTo,
      },
      create: data,
    });
  }

  async getCachedCarrierRates(params: {
    carrier?: string;
    origin?: string;
    destination?: string;
    equipmentType?: string;
  }) {
    return await this.prisma.carrierRate.findMany({
      where: {
        carrier: params.carrier,
        origin: params.origin,
        destination: params.destination,
        equipmentType: params.equipmentType,
        validFrom: { lte: new Date() },
        OR: [
          { validTo: null },
          { validTo: { gte: new Date() } },
        ],
      },
      orderBy: { validFrom: "desc" },
    });
  }

  // ========================================================================
  // SYSTEM SETTINGS
  // ========================================================================

  async getSystemSetting(key: string): Promise<string | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async setSystemSetting(key: string, value: string, description?: string) {
    return await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  // ========================================================================
  // CLEANUP AND MAINTENANCE
  // ========================================================================

  async cleanupExpiredRates() {
    return await this.prisma.carrierRate.deleteMany({
      where: {
        validTo: { lt: new Date() },
      },
    });
  }

  async cleanupOldTrackingEvents(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await this.prisma.trackingEvent.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });
  }

  // ========================================================================
  // CONNECTION MANAGEMENT
  // ========================================================================

  async disconnect() {
    await this.prisma.();
  }

  async connect() {
    await this.prisma.();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const db = new DatabaseService();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function withDatabase<T>(
  operation: (db: DatabaseService) => Promise<T>
): Promise<T> {
  try {
    return await operation(db);
  } catch (error) {
    console.error("Database operation failed:", error);
    throw error;
  }
}

export function handleDatabaseError(error: unknown): never {
  console.error("Database error:", error);
  
  if (error instanceof Error) {
    throw new Error(Database operation failed: );
  }
  
  throw new Error("Database operation failed: Unknown error");
}
