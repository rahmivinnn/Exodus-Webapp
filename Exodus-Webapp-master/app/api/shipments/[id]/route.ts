import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Update shipment schema
const updateShipmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
  origin: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  destination: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  package: z.object({
    weight: z.number().positive(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }),
    value: z.number().positive(),
    description: z.string(),
  }).optional(),
  service: z.object({
    carrier: z.enum(['fedex', 'ups', 'dhl', 'usps']),
    serviceType: z.string(),
    deliveryDate: z.string().optional(),
  }).optional(),
  sender: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).optional(),
  recipient: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).optional(),
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
    sender: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
    },
    recipient: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-0456',
    },
    cost: 45.99,
    trackingHistory: [
      {
        timestamp: '2024-01-10T10:00:00Z',
        status: 'pending',
        location: 'Los Angeles, CA',
        description: 'Shipment created',
      },
      {
        timestamp: '2024-01-11T08:30:00Z',
        status: 'picked_up',
        location: 'Los Angeles, CA',
        description: 'Package picked up by carrier',
      },
      {
        timestamp: '2024-01-12T14:30:00Z',
        status: 'in_transit',
        location: 'Phoenix, AZ',
        description: 'In transit to destination',
      },
    ],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
  },
];

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/shipments/[id] - Get specific shipment
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const shipment = shipments.find(s => s.id === id);

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipment' },
      { status: 500 }
    );
  }
}

// PUT /api/shipments/[id] - Update specific shipment
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = updateShipmentSchema.parse(body);

    const shipmentIndex = shipments.findIndex(s => s.id === id);
    
    if (shipmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Update shipment
    const updatedShipment = {
      ...shipments[shipmentIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    // Add tracking history entry if status changed
    if (validatedData.status && validatedData.status !== shipments[shipmentIndex].status) {
      const newTrackingEntry = {
        timestamp: new Date().toISOString(),
        status: validatedData.status,
        location: 'System Update',
        description: `Status updated to ${validatedData.status}`,
      };
      
      updatedShipment.trackingHistory = [
        ...(shipments[shipmentIndex].trackingHistory || []),
        newTrackingEntry,
      ];
    }

    shipments[shipmentIndex] = updatedShipment;

    return NextResponse.json({
      success: true,
      data: updatedShipment,
      message: 'Shipment updated successfully',
    });
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
      { success: false, error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}

// DELETE /api/shipments/[id] - Delete specific shipment
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const shipmentIndex = shipments.findIndex(s => s.id === id);
    
    if (shipmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Remove shipment
    const deletedShipment = shipments.splice(shipmentIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedShipment,
      message: 'Shipment deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}