import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateFreightRate, validateFreightRateInput } from "@/lib/freight-calculator";
import { rateLimiter } from "@/lib/rate-limit";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const rateCalculationSchema = z.object({
  origin: z.string().min(1, "Origin city is required"),
  destination: z.string().min(1, "Destination city is required"),
  equipmentType: z.string().min(1, "Equipment type is required"),
  weight: z.number().optional(),
  distance: z.number().optional(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  surcharge: z.number().optional(),
  fuelSurcharge: z.number().optional(),
});

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.info.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.info.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rateLimitResult.info.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.info.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.info.reset).toISOString(),
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = rateCalculationSchema.parse(body);

    // Additional validation using our custom validator
    const validation = validateFreightRateInput(validatedData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Calculate freight rate
    const result = calculateFreightRate(validatedData);

    // Log successful calculation for monitoring
    console.log("Rate calculation successful:", {
      origin: validatedData.origin,
      destination: validatedData.destination,
      equipmentType: validatedData.equipmentType,
      totalCost: result.totalCost,
      timestamp: new Date().toISOString()
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      data: result,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    // Log error for debugging
    console.error("Rate calculation API error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: "Internal server error. Please try again later.",
        requestId: crypto.randomUUID()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET METHOD - API INFO
// ============================================================================

export async function GET() {
  return NextResponse.json({
    name: "Freight Rate Calculator API",
    version: "1.0.0",
    description: "Calculate freight rates for shipments",
    endpoints: {
      "POST /api/rates/calculate": {
        description: "Calculate freight rate for given parameters",
        requiredFields: ["origin", "destination", "equipmentType"],
        optionalFields: ["weight", "distance", "pickupDate", "pickupTime", "surcharge", "fuelSurcharge"],
        example: {
          origin: "New York, NY",
          destination: "Los Angeles, CA",
          equipmentType: "van",
          weight: 40000,
          pickupDate: "2024-01-15",
          pickupTime: "08:00"
        }
      }
    },
    rateLimit: {
      windowMs: 900000, // 15 minutes
      maxRequests: 100
    }
  });
}
