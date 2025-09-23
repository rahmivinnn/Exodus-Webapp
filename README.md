# Exodus Logistix

A comprehensive logistics management platform built with Next.js that streamlines shipping operations, provides real-time tracking, and offers powerful analytics for freight management.

## Overview

Exodus Logistix is designed to simplify complex logistics workflows. Whether you're managing a small business or enterprise-level shipping operations, this platform provides the tools you need to optimize your supply chain.

## Key Features

### Shipment Management
- Create and manage shipments with detailed tracking
- Real-time status updates and location tracking
- Multi-carrier integration for flexible shipping options
- Automated notifications for all stakeholders

### Analytics & Intelligence
- Comprehensive shipping analytics dashboard
- Performance metrics and KPI tracking
- Market intelligence and rate predictions
- Custom reporting and data export

### Route Optimization
- AI-powered route planning and optimization
- Multi-stop route management
- Fuel efficiency calculations
- Cost optimization recommendations

### Document Management
- Digital document storage and management
- Automated document generation
- Compliance tracking and validation
- Secure file sharing and access control

### Payment Integration
- Secure payment processing with Stripe
- Automated billing and invoicing
- Multi-currency support
- Financial reporting and analytics

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth with role management
- **Payments**: Stripe integration
- **File Storage**: AWS S3
- **Email**: Nodemailer with SMTP
- **API Integration**: Greenscreens.ai for freight intelligence

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket (for file storage)
- Stripe account (for payments)
- SMTP email service

### Installation

1. Clone the repository:
```bash
git clone https://github.com/username/exodus-logistix.git
cd exodus-logistix
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/exodus_logistix"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Greenscreens API
GREENSCREENS_API_KEY="your-greenscreens-api-key"
GREENSCREENS_API_URL="https://api.greenscreens.ai"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
exodus-logistix/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── shipping/          # Shipping management pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Database connection
│   ├── email.ts          # Email service
│   └── ...               # Other utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── prisma/               # Database schema and migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Shipments
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `GET /api/shipments/[id]` - Get shipment details
- `PUT /api/shipments/[id]` - Update shipment

### Tracking
- `GET /api/tracking/[trackingNumber]` - Track shipment

### Carriers
- `GET /api/carriers` - List carriers
- `GET /api/carriers/rates` - Get shipping rates
- `POST /api/carriers/ship` - Create shipment with carrier

### Analytics
- `GET /api/greenscreens/analytics/metrics` - Get shipping metrics
- `GET /api/greenscreens/analytics/carriers` - Get carrier performance
- `GET /api/greenscreens/analytics/routes` - Get route efficiency

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
# Build the image
docker build -t exodus-logistix .

# Run the container
docker run -p 3000:3000 exodus-logistix
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## Roadmap

- [ ] Mobile app development
- [ ] Advanced AI-powered route optimization
- [ ] Integration with more carriers
- [ ] Real-time collaboration features
- [ ] Advanced reporting and analytics
- [ ] Multi-language support

---

Built with ❤️ for the logistics industry