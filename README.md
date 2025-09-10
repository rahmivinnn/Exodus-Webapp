# Exodus Logistix - Freight Management Platform

A comprehensive freight management and logistics platform built with Next.js 15, featuring real-time tracking, rate calculation, carrier integration, and advanced analytics.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exodus-logistix
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/exodus_logistix"
   
   # JWT Authentication
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   
   # Email Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   
   # File Upload
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=10485760
   
   # External APIs
   GREENSCREENS_API_KEY="your-greenscreens-api-key"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma db push
   
   # Seed the database (optional)
   pnpm prisma db seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏠 Home Page & Navigation

### Main Landing Page (`/`)
The home page (`app/page.tsx`) serves as the main landing page with:

- **Hero Section**: Eye-catching banner with call-to-action buttons
- **Services Overview**: 4 main service categories (Truck Load, Shared Truckload, Dry & Refrigerated, Freight Solutions)
- **Rate Calculator**: Interactive tool for instant freight quotes
- **Market Intelligence**: Real-time market insights and trends
- **Why Choose Us**: Key features and benefits
- **Industries Served**: Food & Beverage, Retail, Manufacturing
- **Contact Form**: Lead generation form
- **Testimonials**: Customer reviews and ratings

### Navigation Structure
The header (`components/header.tsx`) provides:

- **Main Navigation**: Home, About, Shipping, Services, Industries, Resources, Join us, Contact
- **Services Dropdown**: All Services, Freight Auditing
- **Industries Dropdown**: All Industries
- **Resources Dropdown**: Additional resources
- **Join us Dropdown**: Career opportunities
- **Request Quote Button**: Primary CTA

## 🔐 Authentication System

### Login Process

#### 1. Login Endpoint
- **URL**: `POST /api/auth/login`
- **Location**: `app/api/auth/login/route.ts`

#### 2. Login Flow
1. User submits email and password
2. System validates credentials against database
3. JWT token is generated and returned
4. Token is stored in HTTP-only cookie
5. User is redirected to dashboard

#### 3. Login Features
- **Rate Limiting**: 5 attempts per 15 minutes per IP
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration (configurable)
- **Remember Me**: 30-day token for persistent login
- **Audit Logging**: All login attempts are logged
- **Security**: HTTP-only cookies, secure flag in production

#### 4. User Roles
- **ADMIN**: Full system access
- **MANAGER**: Company-level management
- **USER**: Basic user access
- **API_USER**: API-only access

### Registration Process

#### 1. Registration Endpoint
- **URL**: `POST /api/auth/register`
- **Location**: `app/api/auth/register/route.ts`

#### 2. Registration Features
- Email verification required
- Company association
- Role assignment
- Password strength validation
- Duplicate email prevention

### Password Reset

#### 1. Reset Endpoint
- **URL**: `POST /api/auth/reset-password`
- **Location**: `app/api/auth/reset-password/route.ts`

#### 2. Reset Flow
1. User requests password reset
2. Reset token is generated (1-hour expiration)
3. Email is sent with reset link
4. User clicks link and sets new password
5. Token is invalidated

## 🏗️ Code Structure

### Directory Organization

```
exodus-logistix/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── services/                 # Services page
│   ├── shipping/                 # Shipping page
│   ├── industries/               # Industries page
│   ├── freight-auditing/         # Freight auditing page
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       ├── carriers/             # Carrier management
│       ├── shipments/            # Shipment management
│       ├── tracking/             # Tracking endpoints
│       ├── rates/                # Rate calculation
│       ├── payments/             # Payment processing
│       ├── notifications/        # Notification system
│       ├── files/                # File management
│       ├── users/                # User management
│       └── webhooks/             # Webhook handlers
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── header.tsx                # Navigation header
│   ├── footer.tsx                # Site footer
│   ├── rate-calculator.tsx       # Rate calculation tool
│   ├── shipment-tracker.tsx      # Shipment tracking
│   ├── analytics-dashboard.tsx   # Analytics dashboard
│   └── ...                       # Other components
├── hooks/                        # Custom React hooks
│   ├── use-analytics.ts          # Analytics hook
│   ├── use-shipment-tracking.ts  # Tracking hook
│   └── ...                       # Other hooks
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication service
│   ├── database.ts               # Database connection
│   ├── carriers.ts               # Carrier integration
│   ├── payment.ts                # Payment processing
│   └── ...                       # Other utilities
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema
├── public/                       # Static assets
└── styles/                       # Global styles
```

### Key Components

#### 1. Authentication (`lib/auth.ts`)
- JWT token management
- Password hashing/verification
- User session management
- Role-based access control
- Rate limiting
- Audit logging

#### 2. Database (`lib/database.ts`)
- Prisma client configuration
- Connection pooling
- Error handling
- Query optimization

#### 3. Carrier Integration (`lib/carriers.ts`)
- Multiple carrier support
- Rate comparison
- Service selection
- API integration

#### 4. Payment Processing (`lib/payment.ts`)
- Stripe integration
- Payment methods
- Subscription management
- Invoice generation

## 🚢 Core Features

### 1. Shipment Management
- **Create Shipments**: Full shipment creation with origin/destination
- **Track Shipments**: Real-time tracking with carrier APIs
- **Document Management**: Upload and manage shipping documents
- **Status Updates**: Automated status notifications

### 2. Rate Calculation
- **Multi-Carrier Rates**: Compare rates across carriers
- **Service Selection**: Choose optimal service level
- **Real-time Quotes**: Instant rate calculations
- **Historical Data**: Rate history and trends

### 3. Carrier Integration
- **Multiple Carriers**: Support for major freight carriers
- **API Integration**: Real-time carrier communication
- **Service Comparison**: Side-by-side service comparison
- **Performance Metrics**: Carrier performance tracking

### 4. Analytics Dashboard
- **Shipment Analytics**: Volume, cost, and performance metrics
- **Market Intelligence**: Industry trends and insights
- **Route Optimization**: Optimal route suggestions
- **Cost Analysis**: Detailed cost breakdowns

### 5. Notification System
- **Email Notifications**: Shipment status updates
- **SMS Alerts**: Critical notifications
- **Push Notifications**: Real-time updates
- **Customizable Settings**: User preference management

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/reset-password` - Password reset

### Shipments
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `GET /api/shipments/[id]` - Get shipment details
- `PUT /api/shipments/[id]` - Update shipment
- `DELETE /api/shipments/[id]` - Delete shipment

### Tracking
- `GET /api/tracking/[trackingNumber]` - Track shipment
- `POST /api/tracking/[trackingNumber]` - Update tracking

### Rates
- `POST /api/rates` - Get rate quotes
- `GET /api/rates` - List rate history

### Carriers
- `GET /api/carriers` - List carriers
- `GET /api/carriers/rates` - Get carrier rates
- `POST /api/carriers/ship` - Create shipment with carrier

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/[id]` - Get payment details

### Files
- `POST /api/files` - Upload file
- `GET /api/files/[id]` - Get file details
- `GET /api/files/[id]/download` - Download file

## 🗄️ Database Schema

### Key Models

#### Users
- User authentication and profile data
- Role-based access control
- Company associations
- Audit trail

#### Companies
- Company information
- Billing details
- User associations
- Settings

#### Shipments
- Shipment details
- Origin/destination addresses
- Carrier information
- Tracking data
- Documents and files

#### Carriers
- Carrier information
- Service offerings
- API configurations
- Performance metrics

#### Tracking Events
- Real-time tracking updates
- Location data
- Status changes
- Delivery confirmations

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database
pnpm prisma generate    # Generate Prisma client
pnpm prisma db push     # Push schema changes
pnpm prisma db seed     # Seed database
pnpm prisma studio      # Open Prisma Studio

# Testing
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage
```

### Environment Setup

1. **Development Environment**
   ```bash
   NODE_ENV=development
   DATABASE_URL="postgresql://localhost:5432/exodus_logistix_dev"
   JWT_SECRET="dev-secret-key"
   ```

2. **Production Environment**
   ```bash
   NODE_ENV=production
   DATABASE_URL="postgresql://prod-db-url"
   JWT_SECRET="production-secret-key"
   ```

### Database Migrations

```bash
# Create migration
pnpm prisma migrate dev --name migration-name

# Apply migrations
pnpm prisma migrate deploy

# Reset database
pnpm prisma migrate reset
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL="postgresql://prod-db-url"
JWT_SECRET="production-jwt-secret"
SMTP_HOST="smtp.provider.com"
SMTP_PORT=587
SMTP_USER="noreply@exoduslogistix.com"
SMTP_PASS="smtp-password"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GREENSCREENS_API_KEY="prod-api-key"
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API rate limiting
- **CORS Protection**: Cross-origin request protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: SameSite cookie attributes

## 📊 Monitoring & Analytics

- **Audit Logging**: All user actions logged
- **Performance Metrics**: API response times
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: User behavior tracking
- **Carrier Performance**: Delivery metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: loads@exoduslogistix.com
- Phone: (916) 303-5777
- Address: 915 Highland Pointe Drive, Roseville, California 95678

## 🔄 Updates & Maintenance

- Regular security updates
- Feature enhancements
- Performance optimizations
- Bug fixes
- Database maintenance

---

**Exodus Logistix** - Powering logistics with precision and trust.