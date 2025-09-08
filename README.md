# 🚛 Exodus Logistix - Complete Logistics Management System

A modern, full-featured logistics management platform built with Next.js 15, featuring real-time tracking, analytics, payments, and a beautiful UI.

## ✨ Features

### 🚚 Core Logistics
- **Shipment Management** - Create, track, and manage shipments
- **Real-time Tracking** - Live updates on shipment status and location
- **Carrier Integration** - Connect with multiple shipping carriers
- **Route Optimization** - AI-powered route planning and optimization
- **Document Management** - Upload and manage shipping documents

### 📊 Analytics & Intelligence
- **Market Intelligence** - Real-time freight market insights
- **Analytics Dashboard** - Comprehensive shipping analytics
- **Performance Metrics** - Track KPIs and shipping performance
- **Custom Reports** - Generate detailed shipping reports

### 💳 Payments & Billing
- **Stripe Integration** - Secure payment processing
- **Invoice Management** - Automated billing and invoicing
- **Rate Calculator** - AI-powered freight rate calculation
- **Payment Tracking** - Monitor payment status and history

### 🔐 Security & Authentication
- **JWT Authentication** - Secure user authentication
- **Role-based Access** - Different access levels for users
- **Rate Limiting** - API protection against abuse
- **Data Encryption** - Secure data handling

### 📱 Modern UI/UX
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Theme switching support
- **Modern Components** - Built with Radix UI and Tailwind CSS
- **Accessibility** - WCAG compliant interface

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: Radix UI, Lucide React
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Payments**: Stripe
- **File Storage**: AWS S3
- **Email**: Nodemailer
- **Deployment**: Vercel Ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket (for file storage)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rahmivinnn/Exodus-Webapp.git
   cd Exodus-Webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
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

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
exodus-logistix/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── carriers/      # Carrier management
│   │   ├── shipments/     # Shipment operations
│   │   ├── payments/      # Payment processing
│   │   └── webhooks/      # Webhook handlers
│   ├── (pages)/           # Application pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Database connection
│   ├── email.ts          # Email service
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🌐 API Endpoints

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
- `DELETE /api/shipments/[id]` - Delete shipment

### Carriers
- `GET /api/carriers` - List carriers
- `POST /api/carriers` - Add carrier
- `GET /api/carriers/rates` - Get shipping rates
- `POST /api/carriers/ship` - Create shipment with carrier

### Payments
- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/rahmivinnn/Exodus-Webapp/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with more carriers
- [ ] Real-time notifications
- [ ] Advanced route optimization

---

**Built with ❤️ by the Exodus Logistix Team**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)