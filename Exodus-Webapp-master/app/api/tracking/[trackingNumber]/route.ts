import { NextRequest, NextResponse } from 'next/server';

// Mock tracking data - in production, integrate with carrier APIs
const trackingData: Record<string, any> = {
  'TRK123456789': {
    trackingNumber: 'TRK123456789',
    shipmentId: 'SHP001',
    status: 'in_transit',
    carrier: 'fedex',
    serviceType: 'overnight',
    estimatedDelivery: '2024-01-15T18:00:00Z',
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
      description: 'Electronics',
    },
    trackingHistory: [
      {
        timestamp: '2024-01-10T10:00:00Z',
        status: 'pending',
        location: 'Los Angeles, CA',
        description: 'Shipment information sent to carrier',
        details: 'Package details received by carrier',
      },
      {
        timestamp: '2024-01-10T14:30:00Z',
        status: 'confirmed',
        location: 'Los Angeles, CA',
        description: 'Shipment confirmed by carrier',
        details: 'Package ready for pickup',
      },
      {
        timestamp: '2024-01-11T08:30:00Z',
        status: 'picked_up',
        location: 'Los Angeles, CA',
        description: 'Package picked up by carrier',
        details: 'Collected from sender location',
      },
      {
        timestamp: '2024-01-11T12:15:00Z',
        status: 'in_transit',
        location: 'Los Angeles Distribution Center, CA',
        description: 'Departed from origin facility',
        details: 'Package sorted and loaded for transport',
      },
      {
        timestamp: '2024-01-12T06:45:00Z',
        status: 'in_transit',
        location: 'Phoenix, AZ',
        description: 'In transit',
        details: 'Package in transit to next facility',
      },
      {
        timestamp: '2024-01-12T14:30:00Z',
        status: 'in_transit',
        location: 'Denver, CO',
        description: 'Arrived at intermediate facility',
        details: 'Package processed at sorting facility',
      },
    ],
    currentLocation: {
      city: 'Denver',
      state: 'CO',
      country: 'US',
      coordinates: {
        latitude: 39.7392,
        longitude: -104.9903,
      },
    },
    deliveryAttempts: [],
    specialInstructions: [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
  },
  'TRK987654321': {
    trackingNumber: 'TRK987654321',
    shipmentId: 'SHP002',
    status: 'delivered',
    carrier: 'ups',
    serviceType: 'ground',
    estimatedDelivery: '2024-01-10T17:00:00Z',
    actualDelivery: '2024-01-10T16:45:00Z',
    origin: {
      address: '789 Business Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
    },
    destination: {
      address: '321 Home St',
      city: 'Milwaukee',
      state: 'WI',
      zipCode: '53202',
      country: 'US',
    },
    package: {
      weight: 2.3,
      dimensions: { length: 8, width: 6, height: 4 },
      description: 'Documents',
    },
    trackingHistory: [
      {
        timestamp: '2024-01-08T09:00:00Z',
        status: 'pending',
        location: 'Chicago, IL',
        description: 'Shipment created',
        details: 'Package information received',
      },
      {
        timestamp: '2024-01-08T15:30:00Z',
        status: 'picked_up',
        location: 'Chicago, IL',
        description: 'Package picked up',
        details: 'Collected from sender',
      },
      {
        timestamp: '2024-01-09T08:00:00Z',
        status: 'in_transit',
        location: 'Chicago Distribution Center, IL',
        description: 'Departed origin facility',
        details: 'Package sorted and loaded',
      },
      {
        timestamp: '2024-01-10T10:30:00Z',
        status: 'out_for_delivery',
        location: 'Milwaukee, WI',
        description: 'Out for delivery',
        details: 'Package loaded on delivery vehicle',
      },
      {
        timestamp: '2024-01-10T16:45:00Z',
        status: 'delivered',
        location: '321 Home St, Milwaukee, WI',
        description: 'Delivered',
        details: 'Package delivered to recipient',
        signedBy: 'J. Smith',
      },
    ],
    currentLocation: {
      city: 'Milwaukee',
      state: 'WI',
      country: 'US',
      coordinates: {
        latitude: 43.0389,
        longitude: -87.9065,
      },
    },
    deliveryAttempts: [
      {
        timestamp: '2024-01-10T16:45:00Z',
        status: 'successful',
        notes: 'Delivered to recipient',
        signedBy: 'J. Smith',
      },
    ],
    specialInstructions: ['Leave at front door if no answer'],
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-10T16:45:00Z',
  },
};

interface RouteParams {
  params: {
    trackingNumber: string;
  };
}

// GET /api/tracking/[trackingNumber] - Get tracking information
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { trackingNumber } = params;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') !== 'false';
    const includeLocation = searchParams.get('includeLocation') !== 'false';

    const tracking = trackingData[trackingNumber];

    if (!tracking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tracking number not found',
          trackingNumber 
        },
        { status: 404 }
      );
    }

    // Build response based on query parameters
    const response: any = {
      trackingNumber: tracking.trackingNumber,
      shipmentId: tracking.shipmentId,
      status: tracking.status,
      carrier: tracking.carrier,
      serviceType: tracking.serviceType,
      estimatedDelivery: tracking.estimatedDelivery,
      actualDelivery: tracking.actualDelivery,
      origin: tracking.origin,
      destination: tracking.destination,
      package: tracking.package,
      createdAt: tracking.createdAt,
      updatedAt: tracking.updatedAt,
    };

    if (includeHistory) {
      response.trackingHistory = tracking.trackingHistory;
      response.deliveryAttempts = tracking.deliveryAttempts;
      response.specialInstructions = tracking.specialInstructions;
    }

    if (includeLocation) {
      response.currentLocation = tracking.currentLocation;
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}

// POST /api/tracking/[trackingNumber] - Add tracking event (for carriers)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { trackingNumber } = params;
    const body = await request.json();
    
    const { status, location, description, details, coordinates, signedBy } = body;

    if (!status || !location || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: status, location, description' },
        { status: 400 }
      );
    }

    const tracking = trackingData[trackingNumber];

    if (!tracking) {
      return NextResponse.json(
        { success: false, error: 'Tracking number not found' },
        { status: 404 }
      );
    }

    // Create new tracking event
    const newEvent = {
      timestamp: new Date().toISOString(),
      status,
      location,
      description,
      details: details || '',
      ...(signedBy && { signedBy }),
    };

    // Update tracking data
    tracking.trackingHistory.push(newEvent);
    tracking.status = status;
    tracking.updatedAt = new Date().toISOString();

    // Update current location if coordinates provided
    if (coordinates) {
      tracking.currentLocation = {
        ...tracking.currentLocation,
        coordinates,
      };
    }

    // Handle delivery status
    if (status === 'delivered') {
      tracking.actualDelivery = newEvent.timestamp;
      tracking.deliveryAttempts.push({
        timestamp: newEvent.timestamp,
        status: 'successful',
        notes: description,
        ...(signedBy && { signedBy }),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber,
        event: newEvent,
        currentStatus: tracking.status,
      },
      message: 'Tracking event added successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add tracking event' },
      { status: 500 }
    );
  }
}

// PUT /api/tracking/[trackingNumber] - Update tracking information
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { trackingNumber } = params;
    const body = await request.json();
    
    const tracking = trackingData[trackingNumber];

    if (!tracking) {
      return NextResponse.json(
        { success: false, error: 'Tracking number not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'estimatedDelivery',
      'specialInstructions',
      'currentLocation',
    ];

    const updates: any = {};
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Apply updates
    Object.assign(tracking, updates, {
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: tracking,
      message: 'Tracking information updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update tracking information' },
      { status: 500 }
    );
  }
}