# 🚛 Exodus Logistix - Complete Logistics Platform

A comprehensive freight management and logistics platform built with Next.js 14, featuring real-time tracking, carrier integration, and AI-powered analytics.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Login/Register** with JWT tokens and HTTP-only cookies
- **Role-based Access Control** (Admin, User, etc.)
- **Password Reset** functionality
- **User Profile Management**

### 📦 Shipment Management
- **Create & Track Shipments** with real-time updates
- **Multi-carrier Integration** (FedEx, UPS, DHL, USPS)
- **Document Management** (shipping labels, invoices, customs forms)
- **Route Optimization** with AI-powered suggestions

### 📊 Analytics & Reporting
- **Real-time Dashboard** with key metrics
- **Carrier Performance Analytics**
- **Cost Analysis & Savings Tracking**
- **Custom Reports** generation

### 🚚 Carrier Integration
- **Rate Comparison** across multiple carriers
- **Label Generation** in multiple formats (PDF, PNG, ZPL)
- **Tracking Integration** with real-time status updates
- **Shipment Creation** with automated carrier selection

### 📱 Modern UI/UX
- **Responsive Design** for all devices
- **Dark/Light Theme** support
- **Real-time Notifications**
- **Interactive Dashboards**

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with HTTP-only cookies
- **File Storage:** Local file system with compression
- **Email:** Nodemailer integration
- **Charts:** Recharts for analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rahmivinnn/Exodus-Webapp.git
   cd Exodus-Webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/exodus_logistix"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Email Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   
   # Carrier API Keys
   FEDEX_API_KEY="your-fedex-key"
   UPS_API_KEY="your-ups-key"
   DHL_API_KEY="your-dhl-key"
   USPS_API_KEY="your-usps-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
exodus-logistix/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── carriers/      # Carrier integration
│   │   ├── shipments/     # Shipment management
│   │   └── ...
│   ├── login/             # Login page
│   ├── dashboard/         # User dashboard
│   ├── register/          # Registration page
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── analytics-dashboard.tsx
│   ├── shipment-tracker.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Database connection
│   ├── carriers.ts       # Carrier integrations
│   └── ...
├── prisma/               # Database schema
│   └── schema.prisma
└── public/               # Static assets
```

## 🔑 Default Login Credentials

For testing purposes, use these credentials:

- **Email:** `admin@exodus.com`
- **Password:** `password123`

## 🚚 Supported Carriers

- **FedEx** - Express, Ground, Home Delivery
- **UPS** - Next Day Air, 2nd Day Air, Ground
- **DHL** - Express, International
- **USPS** - Priority Mail, First-Class, Ground Advantage

## 📊 API Endpoints

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

### Carriers
- `GET /api/carriers/rates` - Get shipping rates
- `POST /api/carriers/ship` - Create shipment with carrier
- `GET /api/carriers/track` - Track shipment

### Analytics
- `GET /api/greenscreens/analytics/dashboards` - Get dashboard data
- `GET /api/greenscreens/analytics/metrics` - Get performance metrics

## 🧪 Testing

Run the test suite:

```bash
npm run test
# or
pnpm test
```

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Docker

```bash
docker build -t exodus-logistix .
docker run -p 3000:3000 exodus-logistix
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@exoduslogistix.com or create an issue in this repository.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Charts from [Recharts](https://recharts.org/)

---

**Exodus Logistix** - Powering logistics with precision and trust. 🚛✨