import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const createShipmentSchema = z.object({
  origin: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  destination: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  package: z.object({
    weight: z.number().positive(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }),
    value: z.number().positive(),
    description: z.string(),
  }),
  service: z.object({
    carrier: z.enum(['fedex', 'ups', 'dhl', 'usps']),
    serviceType: z.string(),
    deliveryDate: z.string().optional(),
  }),
  sender: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
  recipient: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
});

// Mock database - in production, replace with actual database
let shipments: any[] = [
  {
    id: 'SHP001',
    trackingNumber: 'TRK123456789',
    status: 'in_transit',
    origin: {
      address: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
    },
    destination: {
      address: '456 Oak Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    package: {
      weight: 5.5,
      dimensions: { length: 12, width: 8, height: 6 },
      value: 150.00,
      description: 'Electronics',
    },
    service: {
      carrier: 'fedex',
      serviceType: 'overnight',
      estimatedDelivery: '2024-01-15',
    },
    cost: 45.99,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
  },
];

// GET /api/shipments - Get all shipments with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const carrier = searchParams.get('carrier');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    let filteredShipments = [...shipments];

    // Filter by status
    if (status) {
      filteredShipments = filteredShipments.filter(s => s.status === status);
    }

    // Filter by carrier
    if (carrier) {
      filteredShipments = filteredShipments.filter(s => s.service.carrier === carrier);
    }

    // Search functionality
    if (search) {
      filteredShipments = filteredShipments.filter(s => 
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.recipient.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedShipments = filteredShipments.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedShipments,
      pagination: {
        page,
        limit,
        total: filteredShipments.length,
        totalPages: Math.ceil(filteredShipments.length / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

// POST /api/shipments - Create new shipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createShipmentSchema.parse(body);

    // Generate unique IDs
    const shipmentId = `SHP${Date.now()}`;
    const trackingNumber = `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate shipping cost (mock calculation)
    const baseCost = 15.99;
    const weightCost = validatedData.package.weight * 2.5;
    const serviceCost = validatedData.service.serviceType === 'overnight' ? 25 : 0;
    const totalCost = baseCost + weightCost + serviceCost;

    const newShipment = {
      id: shipmentId,
      trackingNumber,
      status: 'pending',
      ...validatedData,
      cost: parseFloat(totalCost.toFixed(2)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    shipments.push(newShipment);

    return NextResponse.json(
      {
        success: true,
        data: newShipment,
        message: 'Shipment created successfully',
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
      { success: false, error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

// PUT /api/shipments - Bulk update shipments
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { shipmentIds, updates } = body;

    if (!Array.isArray(shipmentIds) || !updates) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const updatedShipments = [];
    
    for (const id of shipmentIds) {
      const shipmentIndex = shipments.findIndex(s => s.id === id);
      if (shipmentIndex !== -1) {
        shipments[shipmentIndex] = {
          ...shipments[shipmentIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        updatedShipments.push(shipments[shipmentIndex]);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedShipments,
      message: `Updated ${updatedShipments.length} shipments`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update shipments' },
      { status: 500 }
    );
  }
}

// DELETE /api/shipments - Bulk delete shipments
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { shipmentIds } = body;

    if (!Array.isArray(shipmentIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const deletedCount = shipmentIds.length;
    shipments = shipments.filter(s => !shipmentIds.includes(s.id));

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} shipments`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete shipments' },
      { status: 500 }
    );
  }
}