# Freight Management System

A comprehensive freight management platform built with Next.js, featuring carrier integration, shipment tracking, and analytics.

## 🚀 Quick Deploy

**Your app is now auto-deployed!** Choose your preferred platform:

- **🌐 GitHub Pages**: `https://rahmivinnn.github.io/Exodus-Webapp` (Free, Static)
- **🌐 Netlify**: Connect your GitHub repo for full-stack deployment
- **🚂 Railway**: Connect your GitHub repo for full-stack with database

📚 **See [ALTERNATIVE_DEPLOYMENT.md](./ALTERNATIVE_DEPLOYMENT.md) for detailed setup instructions**

## Features

- 🚛 Carrier Management & Integration
- 📦 Shipment Tracking & Management
- 📊 Analytics Dashboard
- 💰 Rate Calculation & Optimization
- 📄 Document Management
- 🔔 Notification System
- 💳 Payment Processing
- 🔐 Authentication & Authorization

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Email**: Nodemailer
- **Payments**: Stripe
- **File Storage**: AWS S3

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your configuration:
   - Database URL
   - JWT secret
   - Email settings
   - API keys

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Run database migrations:
   ```bash
   npx prisma db push
   ```

7. Start development server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

### Prerequisites

1. Vercel account
2. PostgreSQL database (recommended: Vercel Postgres, Supabase, or PlanetScale)

### Steps

1. **Connect to Vercel**:
   - Push your code to GitHub
   - Import project in Vercel dashboard

2. **Configure Environment Variables**:
   In Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_secure_jwt_secret
   APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   GREENSCREENS_API_KEY=your_api_key
   SMTP_HOST=your_smtp_host
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

3. **Deploy**:
   - Vercel will automatically build and deploy
   - Check build logs for any issues

### Common Issues & Solutions

#### Build Errors

1. **Missing Dependencies**: Run `npm install --legacy-peer-deps` locally first
2. **TypeScript Errors**: Check for missing type definitions
3. **Environment Variables**: Ensure all required env vars are set in Vercel

#### Runtime Errors

1. **Database Connection**: Verify DATABASE_URL is correct
2. **API Keys**: Check all external service API keys
3. **CORS Issues**: Verify domain settings in external services

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `APP_URL` | Application URL | Yes |
| `GREENSCREENS_API_KEY` | Greenscreens.ai API key | No |
| `SMTP_HOST` | Email SMTP host | No |
| `SMTP_USER` | Email SMTP username | No |
| `SMTP_PASS` | Email SMTP password | No |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | No |
| `AWS_S3_BUCKET` | S3 bucket name | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── prisma/               # Database schema
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.