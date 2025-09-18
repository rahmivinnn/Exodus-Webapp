import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const createCarrierSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2).max(10),
  type: z.enum(['express', 'ground', 'freight', 'international']),
  services: z.array(z.object({
    name: z.string(),
    code: z.string(),
    description: z.string(),
    transitTime: z.string(),
    features: z.array(z.string()),
  })),
  coverage: z.object({
    domestic: z.boolean(),
    international: z.boolean(),
    regions: z.array(z.string()),
  }),
  pricing: z.object({
    baseRate: z.number().positive(),
    weightMultiplier: z.number().positive(),
    fuelSurcharge: z.number().min(0).max(1),
    dimensionalWeight: z.boolean(),
  }),
  apiConfig: z.object({
    endpoint: z.string().url(),
    authType: z.enum(['api_key', 'oauth', 'basic']),
    credentials: z.record(z.string()),
    rateLimit: z.number().positive(),
  }),
  contact: z.object({
    phone: z.string(),
    email: z.string().email(),
    website: z.string().url(),
    support: z.string().url().optional(),
  }),
  isActive: z.boolean().default(true),
});

// Mock database - in production, replace with actual database
let carriers: any[] = [
  {
    id: 'CAR001',
    name: 'FedEx',
    code: 'FEDEX',
    type: 'express',
    logo: '/carriers/fedex-logo.png',
    services: [
      {
        name: 'FedEx Overnight',
        code: 'OVERNIGHT',
        description: 'Next business day delivery',
        transitTime: '1 business day',
        features: ['tracking', 'signature_required', 'insurance'],
      },
      {
        name: 'FedEx 2Day',
        code: '2DAY',
        description: 'Delivery in 2 business days',
        transitTime: '2 business days',
        features: ['tracking', 'insurance'],
      },
      {
        name: 'FedEx Ground',
        code: 'GROUND',
        description: 'Cost-effective ground delivery',
        transitTime: '1-5 business days',
        features: ['tracking'],
      },
    ],
    coverage: {
      domestic: true,
      international: true,
      regions: ['US', 'CA', 'MX', 'EU', 'AS', 'AU'],
    },
    pricing: {
      baseRate: 12.99,
      weightMultiplier: 2.5,
      fuelSurcharge: 0.15,
      dimensionalWeight: true,
    },
    apiConfig: {
      endpoint: 'https://api.fedex.com/v1',
      authType: 'api_key',
      credentials: {
        apiKey: 'fedex_api_key_placeholder',
        secretKey: 'fedex_secret_key_placeholder',
      },
      rateLimit: 1000,
    },
    contact: {
      phone: '1-800-463-3339',
      email: 'support@fedex.com',
      website: 'https://www.fedex.com',
      support: 'https://www.fedex.com/en-us/support.html',
    },
    metrics: {
      onTimeDelivery: 0.96,
      customerSatisfaction: 4.2,
      averageTransitTime: 2.1,
      damageRate: 0.002,
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
  },
  {
    id: 'CAR002',
    name: 'UPS',
    code: 'UPS',
    type: 'express',
    logo: '/carriers/ups-logo.png',
    services: [
      {
        name: 'UPS Next Day Air',
        code: 'NEXT_DAY',
        description: 'Next business day delivery',
        transitTime: '1 business day',
        features: ['tracking', 'signature_required', 'insurance'],
      },
      {
        name: 'UPS 2nd Day Air',
        code: '2ND_DAY',
        description: 'Delivery in 2 business days',
        transitTime: '2 business days',
        features: ['tracking', 'insurance'],
      },
      {
        name: 'UPS Ground',
        code: 'GROUND',
        description: 'Reliable ground delivery',
        transitTime: '1-5 business days',
        features: ['tracking'],
      },
    ],
    coverage: {
      domestic: true,
      international: true,
      regions: ['US', 'CA', 'MX', 'EU', 'AS'],
    },
    pricing: {
      baseRate: 11.99,
      weightMultiplier: 2.3,
      fuelSurcharge: 0.14,
      dimensionalWeight: true,
    },
    apiConfig: {
      endpoint: 'https://api.ups.com/v1',
      authType: 'oauth',
      credentials: {
        clientId: 'ups_client_id_placeholder',
        clientSecret: 'ups_client_secret_placeholder',
      },
      rateLimit: 800,
    },
    contact: {
      phone: '1-800-742-5877',
      email: 'support@ups.com',
      website: 'https://www.ups.com',
      support: 'https://www.ups.com/us/en/support.page',
    },
    metrics: {
      onTimeDelivery: 0.94,
      customerSatisfaction: 4.1,
      averageTransitTime: 2.3,
      damageRate: 0.003,
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-08T15:30:00Z',
  },
  {
    id: 'CAR003',
    name: 'DHL',
    code: 'DHL',
    type: 'international',
    logo: '/carriers/dhl-logo.png',
    services: [
      {
        name: 'DHL Express Worldwide',
        code: 'EXPRESS_WW',
        description: 'International express delivery',
        transitTime: '1-3 business days',
        features: ['tracking', 'signature_required', 'insurance', 'customs_clearance'],
      },
      {
        name: 'DHL Express 12:00',
        code: 'EXPRESS_12',
        description: 'Delivery by 12:00 noon',
        transitTime: '1-2 business days',
        features: ['tracking', 'signature_required', 'insurance', 'time_definite'],
      },
    ],
    coverage: {
      domestic: false,
      international: true,
      regions: ['EU', 'AS', 'AF', 'AU', 'SA'],
    },
    pricing: {
      baseRate: 25.99,
      weightMultiplier: 4.2,
      fuelSurcharge: 0.18,
      dimensionalWeight: true,
    },
    apiConfig: {
      endpoint: 'https://api.dhl.com/v1',
      authType: 'api_key',
      credentials: {
        apiKey: 'dhl_api_key_placeholder',
      },
      rateLimit: 500,
    },
    contact: {
      phone: '1-800-225-5345',
      email: 'support@dhl.com',
      website: 'https://www.dhl.com',
      support: 'https://www.dhl.com/us-en/home/support.html',
    },
    metrics: {
      onTimeDelivery: 0.98,
      customerSatisfaction: 4.4,
      averageTransitTime: 1.8,
      damageRate: 0.001,
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
  },
];

// GET /api/carriers - Get all carriers with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const domestic = searchParams.get('domestic');
    const international = searchParams.get('international');
    const region = searchParams.get('region');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';
    const includeApiConfig = searchParams.get('includeApiConfig') === 'true';

    let filteredCarriers = [...carriers];

    // Filter by type
    if (type) {
      filteredCarriers = filteredCarriers.filter(c => c.type === type);
    }

    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      filteredCarriers = filteredCarriers.filter(c => c.isActive === isActive);
    }

    // Filter by coverage
    if (domestic !== null) {
      const isDomestic = domestic === 'true';
      filteredCarriers = filteredCarriers.filter(c => c.coverage.domestic === isDomestic);
    }

    if (international !== null) {
      const isInternational = international === 'true';
      filteredCarriers = filteredCarriers.filter(c => c.coverage.international === isInternational);
    }

    // Filter by region
    if (region) {
      filteredCarriers = filteredCarriers.filter(c => 
        c.coverage.regions.includes(region.toUpperCase())
      );
    }

    // Remove sensitive data unless explicitly requested
    const responseCarriers = filteredCarriers.map(carrier => {
      const { apiConfig, ...carrierData } = carrier;
      
      const response: any = {
        ...carrierData,
      };

      if (includeMetrics) {
        response.metrics = carrier.metrics;
      }

      if (includeApiConfig) {
        // Remove sensitive credentials
        response.apiConfig = {
          endpoint: apiConfig.endpoint,
          authType: apiConfig.authType,
          rateLimit: apiConfig.rateLimit,
        };
      }

      return response;
    });

    return NextResponse.json({
      success: true,
      data: responseCarriers,
      count: responseCarriers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carriers' },
      { status: 500 }
    );
  }
}

// POST /api/carriers - Create new carrier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCarrierSchema.parse(body);

    // Check if carrier code already exists
    const existingCarrier = carriers.find(c => c.code === validatedData.code);
    if (existingCarrier) {
      return NextResponse.json(
        { success: false, error: 'Carrier code already exists' },
        { status: 409 }
      );
    }

    // Generate unique ID
    const carrierId = `CAR${String(carriers.length + 1).padStart(3, '0')}`;

    const newCarrier = {
      id: carrierId,
      ...validatedData,
      logo: `/carriers/${validatedData.code.toLowerCase()}-logo.png`,
      metrics: {
        onTimeDelivery: 0,
        customerSatisfaction: 0,
        averageTransitTime: 0,
        damageRate: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    carriers.push(newCarrier);

    // Remove sensitive data from response
    const { apiConfig, ...responseData } = newCarrier;
    const sanitizedApiConfig = {
      endpoint: apiConfig.endpoint,
      authType: apiConfig.authType,
      rateLimit: apiConfig.rateLimit,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          ...responseData,
          apiConfig: sanitizedApiConfig,
        },
        message: 'Carrier created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create carrier' },
      { status: 500 }
    );
  }
}