#  EXODUS LOGISTIX - FREIGHT MANAGEMENT SYSTEM

> **Professional freight management and rate calculation system built with Next.js, TypeScript, and modern web technologies.**

##  QUICK START

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git

### Installation
`ash
# Clone the repository
git clone https://github.com/rahmivinnn/Exodus-Webapp.git
cd Exodus-Webapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
`

Open [http://localhost:3000](http://localhost:3000) in your browser.

##  PROJECT STRUCTURE

`
exodus-webapp/
 app/                    # Next.js App Router (Pages & API)
 components/             # React Components
    ui/                # Reusable UI components
    FreightRateCalculator.tsx  # Main calculator
 lib/                   # Shared utilities & business logic
    freight-calculator.ts      # Core calculation logic
    carriers.ts               # Carrier integrations
    database.ts               # Database utilities
 hooks/                 # Custom React hooks
 types/                 # TypeScript definitions
 public/                # Static assets
`

##  KEY FEATURES

###  Freight Rate Calculator
- Real-time rate calculations
- Multiple equipment types (Van, Reefer, Flatbed, etc.)
- Distance calculation between US cities
- Weight-based pricing adjustments
- Fuel surcharge calculations
- Confidence scoring

###  Carrier Integrations
- FedEx API integration
- UPS API integration  
- DHL API integration
- Rate comparison across carriers

###  User Management
- JWT authentication
- User registration/login
- Rate calculation history
- Shipment tracking

###  Modern Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Payments**: Stripe integration
- **Deployment**: Vercel

##  DEVELOPMENT

### Available Scripts
`ash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
`

### Code Quality
- **TypeScript Strict Mode** - Catches errors early
- **ESLint** - Code quality and consistency
- **Prettier** - Automatic code formatting
- **JSDoc** - Comprehensive documentation

##  DOCUMENTATION

### For Developers
- **[Fullstack Developer Guide](./FULLSTACK_DEVELOPER_GUIDE.md)** - Complete development guide
- **[Freight Calculator README](./FREIGHT_CALCULATOR_README.md)** - Detailed component documentation
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute

### Key Components

#### FreightRateCalculator
`	sx
import { FreightRateCalculator } from "@/components/FreightRateCalculator";

<FreightRateCalculator 
  onRateCalculated={(result) => console.log(result)}
  onError={(error) => console.error(error)}
/>
`

#### Rate Calculation
`	ypescript
import { calculateFreightRate } from "@/lib/freight-calculator";

const result = calculateFreightRate({
  origin: "New York, NY",
  destination: "Los Angeles, CA", 
  equipmentType: "van",
  weight: 40000
});
`

##  CONFIGURATION

### Environment Variables
`ash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AWS
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# External APIs
GREENSCREENS_API_KEY="..."
FEDEX_API_KEY="..."
UPS_API_KEY="..."
DHL_API_KEY="..."
`

### Database Setup
`ash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
`

##  DEPLOYMENT

### Vercel (Recommended)
`ash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
`

### Manual Deployment
`ash
# Build the application
npm run build

# Start production server
npm run start
`

##  TESTING

`ash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
`

##  MONITORING

### Error Tracking
- Console logging for development
- Error boundaries for React components
- API error handling with proper status codes

### Performance
- Next.js built-in performance monitoring
- Bundle analysis with @next/bundle-analyzer
- Database query optimization with Prisma

##  CONTRIBUTING

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

##  SUPPORT

- **Documentation**: Check the guides above
- **Issues**: [GitHub Issues](https://github.com/rahmivinnn/Exodus-Webapp/issues)
- **Email**: dev@exoduslogistix.com

##  LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with  by the Exodus Logistix Development Team**
