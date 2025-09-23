# EXODUS LOGISTIX - FULLSTACK DEVELOPER GUIDE

##  OVERVIEW

This is a comprehensive guide for fullstack developers working on the Exodus Logistix freight management system. It covers both frontend (React/Next.js) and backend (API/Server) components.

##  SYSTEM ARCHITECTURE

### Frontend Stack
- **Framework**: Next.js 15.2.4 (React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **State Management**: React Hooks + Context API
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod Validation

### Backend Stack
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: Prisma ORM
- **Authentication**: Custom JWT + Session Management
- **File Storage**: AWS S3
- **Payment**: Stripe Integration
- **Rate Limiting**: Custom Implementation

### External Services
- **Greenscreens.ai**: Market intelligence and rate predictions
- **Carrier APIs**: FedEx, UPS, DHL integrations
- **Maps**: Distance calculations and geocoding
- **Email**: Transactional email service

##  PROJECT STRUCTURE

`
exodus-webapp/
 app/                          # Next.js App Router
    api/                      # Backend API Routes
       auth/                 # Authentication endpoints
       carriers/             # Carrier management
       rates/                # Rate calculation
       shipments/            # Shipment management
       webhooks/             # External webhooks
    (auth)/                   # Auth pages group
    dashboard/                # Main dashboard
    shipping/                 # Shipping pages
    page.tsx                  # Homepage
 components/                   # React Components
    ui/                       # Reusable UI components
    FreightRateCalculator.tsx # Main calculator component
    header.tsx                # Site header
    footer.tsx                # Site footer
    ...                       # Other components
 lib/                          # Shared utilities
    freight-calculator.ts     # Core calculation logic
    carriers.ts               # Carrier integrations
    database.ts               # Database utilities
    auth.ts                   # Authentication logic
    payment.ts                # Payment processing
    rate-limit.ts             # API rate limiting
 hooks/                        # Custom React hooks
 types/                        # TypeScript type definitions
 utils/                        # Utility functions
 public/                       # Static assets
`

##  FRONTEND DEVELOPMENT

### Component Architecture

#### 1. FreightRateCalculator Component
**Location**: components/FreightRateCalculator.tsx

**Purpose**: Main freight rate calculation interface

**Key Features**:
- Real-time rate calculations
- Form validation with error handling
- Responsive design with animations
- Integration with backend APIs

**Props Interface**:
`	ypescript
interface FreightRateCalculatorProps {
  onRateCalculated?: (result: FreightRateResult) => void;
  onError?: (error: string) => void;
  initialData?: Partial<FreightRateInput>;
}
`

**Usage Example**:
`	sx
import { FreightRateCalculator } from "@/components/FreightRateCalculator";

// Basic usage
<FreightRateCalculator />

// With callbacks for integration
<FreightRateCalculator 
  onRateCalculated={(result) => {
    // Save to database
    saveRateToDatabase(result);
    // Update parent state
    setCalculatedRate(result);
  }}
  onError={(error) => {
    // Handle errors
    showNotification(error);
  }}
/>
`

#### 2. UI Components
**Location**: components/ui/

**Purpose**: Reusable UI components following design system

**Key Components**:
- Button - Styled button component
- Input - Form input with validation
- Select - Dropdown selection
- Card - Content containers
- Dialog - Modal dialogs
- Alert - Error/success messages

**Usage Pattern**:
`	sx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Rate Calculator</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter origin city" />
    <Button>Calculate Rate</Button>
  </CardContent>
</Card>
`

### State Management

#### Local State (React Hooks)
`	ypescript
// Component-level state
const [formData, setFormData] = useState<FreightRateInput>({
  origin: "",
  destination: "",
  equipmentType: "",
  // ... other fields
});

// Loading and error states
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [result, setResult] = useState<FreightRateResult | null>(null);
`

#### Global State (Context API)
`	ypescript
// For user authentication
const { user, login, logout } = useAuth();

// For application settings
const { theme, setTheme } = useTheme();

// For notifications
const { showNotification } = useNotifications();
`

### Form Handling

#### React Hook Form + Zod Validation
`	ypescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define validation schema
const freightRateSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  equipmentType: z.string().min(1, "Equipment type is required"),
  weight: z.number().optional(),
  pickupDate: z.string().min(1, "Pickup date is required"),
});

// Use in component
const form = useForm<FreightRateInput>({
  resolver: zodResolver(freightRateSchema),
  defaultValues: {
    origin: "",
    destination: "",
    equipmentType: "",
  }
});
`

##  BACKEND DEVELOPMENT

### API Routes Structure

#### 1. Authentication APIs
**Location**: pp/api/auth/

`	ypescript
// POST /api/auth/login
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Validate credentials
  const user = await validateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  
  // Create JWT token
  const token = createJWT(user);
  
  // Set HTTP-only cookie
  const response = NextResponse.json({ user });
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return response;
}
`

#### 2. Rate Calculation APIs
**Location**: pp/api/rates/

`	ypescript
// POST /api/rates/calculate
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    
    // Validate input
    const input = rateCalculationSchema.parse(await request.json());
    
    // Calculate rate
    const result = calculateFreightRate(input);
    
    // Save to database (optional)
    await saveRateCalculation(input, result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Rate calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate rate" },
      { status: 500 }
    );
  }
}
`

#### 3. Carrier Integration APIs
**Location**: pp/api/carriers/

`	ypescript
// GET /api/carriers/rates
export async function GET(request: NextRequest) {
  const { origin, destination, weight } = request.nextUrl.searchParams;
  
  try {
    // Get rates from multiple carriers
    const [fedexRates, upsRates, dhlRates] = await Promise.all([
      getFedExRates({ origin, destination, weight }),
      getUPSRates({ origin, destination, weight }),
      getDHLRates({ origin, destination, weight })
    ]);
    
    return NextResponse.json({
      carriers: {
        fedex: fedexRates,
        ups: upsRates,
        dhl: dhlRates
      }
    });
  } catch (error) {
    console.error("Carrier rates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch carrier rates" },
      { status: 500 }
    );
  }
}
`

### Database Integration

#### Prisma Schema
`prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  shipments Shipment[]
  rateCalculations RateCalculation[]
}

model RateCalculation {
  id          String   @id @default(cuid())
  userId      String?
  origin      String
  destination String
  equipmentType String
  weight      Float?
  distance    Float?
  totalCost   Float
  estimatedDays Int
  confidence  Float
  createdAt   DateTime @default(now())
  
  // Relations
  user User? @relation(fields: [userId], references: [id])
}

model Shipment {
  id          String   @id @default(cuid())
  userId      String
  trackingNumber String @unique
  status      String
  carrier     String
  origin      String
  destination String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user User @relation(fields: [userId], references: [id])
}
`

#### Database Operations
`	ypescript
// lib/database.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DatabaseService {
  // Save rate calculation
  async saveRateCalculation(input: FreightRateInput, result: FreightRateResult) {
    return await prisma.rateCalculation.create({
      data: {
        origin: input.origin,
        destination: input.destination,
        equipmentType: input.equipmentType,
        weight: input.weight,
        distance: input.distance,
        totalCost: result.totalCost,
        estimatedDays: result.estimatedDays,
        confidence: result.confidence,
      }
    });
  }
  
  // Get user's rate history
  async getUserRateHistory(userId: string) {
    return await prisma.rateCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }
  
  // Create shipment
  async createShipment(data: CreateShipmentData) {
    return await prisma.shipment.create({
      data: {
        userId: data.userId,
        trackingNumber: data.trackingNumber,
        status: "pending",
        carrier: data.carrier,
        origin: data.origin,
        destination: data.destination,
      }
    });
  }
}
`

##  FRONTEND-BACKEND INTEGRATION

### API Client Setup
`	ypescript
// lib/api-client.ts
class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = ${this.baseURL};
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }
    
    return response.json();
  }
  
  // Rate calculation
  async calculateRate(input: FreightRateInput): Promise<FreightRateResult> {
    return this.request<FreightRateResult>("/rates/calculate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  
  // Get carrier rates
  async getCarrierRates(params: CarrierRateParams): Promise<CarrierRates> {
    const searchParams = new URLSearchParams(params);
    return this.request<CarrierRates>(/carriers/rates?);
  }
  
  // Create shipment
  async createShipment(data: CreateShipmentData): Promise<Shipment> {
    return this.request<Shipment>("/shipments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
`

### Custom Hooks for API Integration
`	ypescript
// hooks/use-rate-calculation.ts
import { useState } from "react";
import { apiClient } from "@/lib/api-client";

export function useRateCalculation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreightRateResult | null>(null);
  
  const calculateRate = async (input: FreightRateInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.calculateRate(input);
      setResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    result,
    calculateRate,
  };
}
`

##  DEVELOPMENT WORKFLOW

### 1. Frontend Development
`ash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
`

### 2. Backend Development
`ash
# Database operations
npx prisma generate
npx prisma db push
npx prisma studio

# API testing
curl -X POST http://localhost:3000/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{"origin":"New York, NY","destination":"Los Angeles, CA","equipmentType":"van"}'
`

### 3. Full Stack Testing
`ash
# Run all tests
npm run test

# E2E testing
npm run test:e2e

# Build for production
npm run build
npm run start
`

##  SECURITY CONSIDERATIONS

### Frontend Security
- Input validation with Zod schemas
- XSS protection with proper escaping
- CSRF protection with same-site cookies
- Secure API communication (HTTPS)

### Backend Security
- Rate limiting on all API endpoints
- Input validation and sanitization
- JWT token authentication
- SQL injection prevention with Prisma
- CORS configuration

### Environment Variables
`ash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
`

##  MONITORING & LOGGING

### Error Tracking
`	ypescript
// lib/error-tracking.ts
export function logError(error: Error, context: Record<string, any>) {
  console.error("Error:", error.message, context);
  
  // Send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === "production") {
    // Sentry.captureException(error, { extra: context });
  }
}
`

### Performance Monitoring
`	ypescript
// lib/performance.ts
export function trackPerformance(name: string, fn: () => Promise<any>) {
  return async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      console.log(${name} took ms);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(${name} failed after ms:, error);
      throw error;
    }
  };
}
`

##  DEPLOYMENT

### Frontend Deployment (Vercel)
`ash
# Build and deploy
vercel --prod

# Environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
`

### Backend Deployment
`ash
# Database migration
npx prisma migrate deploy

# Start production server
npm run start
`

##  USEFUL RESOURCES

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Postman](https://www.postman.com/) - API testing
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Frontend debugging

---

**This guide provides everything a fullstack developer needs to work effectively on the Exodus Logistix project! **
