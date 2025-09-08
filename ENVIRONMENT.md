# Environment Setup Guide

This guide explains how to set up the environment variables for Exodus Logistix.

## Quick Setup

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. The `.env.local` file is already configured with development keys and ready to use!

## Environment Variables Explained

### Database Configuration
```env
DATABASE_URL="postgresql://exodus_user:exodus_pass123@localhost:5432/exodus_logistix"
```
- **Purpose**: PostgreSQL database connection string
- **Default**: Local PostgreSQL with exodus database
- **Note**: Make sure PostgreSQL is running on your system

### Authentication & Security
```env
JWT_SECRET="exodus_jwt_super_secret_key_2024_development_only"
JWT_EXPIRES_IN="7d"
```
- **Purpose**: JWT token signing and expiration
- **Security**: Change in production environment
- **Expiration**: Tokens valid for 7 days

### Email Service
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="exodus.logistix@gmail.com"
SMTP_PASS="exodus_smtp_password_123"
```
- **Purpose**: Email notifications and communications
- **Provider**: Gmail SMTP (configured for development)
- **Note**: Update with your actual email credentials

### AWS S3 Storage
```env
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="exodus-logistix-files"
```
- **Purpose**: File storage for documents and uploads
- **Note**: These are example keys - replace with your AWS credentials

### Payment Processing (Stripe)
```env
STRIPE_SECRET_KEY="sk_test_51H1234567890abcdefghijklmnopqrstuvwxyz"
STRIPE_PUBLISHABLE_KEY="pk_test_51H1234567890abcdefghijklmnopqrstuvwxyz"
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdefghijklmnopqrstuvwxyz"
```
- **Purpose**: Payment processing and billing
- **Mode**: Test mode (safe for development)
- **Note**: Replace with your Stripe test keys

### Greenscreens API
```env
GREENSCREENS_API_KEY="gs_live_1234567890abcdefghijklmnopqrstuvwxyz"
GREENSCREENS_API_URL="https://api.greenscreens.ai"
GREENSCREENS_TIMEOUT="10000"
```
- **Purpose**: Freight intelligence and market data
- **Features**: Rate predictions, carrier data, analytics
- **Note**: Replace with your Greenscreens API key

### Application Configuration
```env
APP_NAME="Exodus Logistix"
APP_URL="http://localhost:3000"
NODE_ENV="development"
```
- **Purpose**: Application metadata and environment settings
- **URL**: Development server URL
- **Environment**: Set to 'production' for live deployment

### Security Settings
```env
BCRYPT_ROUNDS="12"
SESSION_TIMEOUT="3600000"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"
```
- **BCRYPT_ROUNDS**: Password hashing strength
- **SESSION_TIMEOUT**: User session duration (1 hour)
- **RATE_LIMIT**: API request limits (100 requests per 15 minutes)

### File Upload Configuration
```env
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="pdf,doc,docx,jpg,jpeg,png"
```
- **MAX_FILE_SIZE**: Maximum file size (10MB)
- **ALLOWED_FILE_TYPES**: Permitted file extensions

## Development vs Production

### Development Environment
- All keys are pre-configured for immediate use
- Test/demo credentials included
- Debug mode enabled
- Local database and services

### Production Environment
- Replace all example keys with real credentials
- Use production database
- Enable security features
- Set NODE_ENV="production"
- Use HTTPS URLs

## Service Dependencies

### Required Services
1. **PostgreSQL Database** - For data storage
2. **SMTP Email Service** - For notifications
3. **AWS S3** - For file storage
4. **Stripe Account** - For payments
5. **Greenscreens API** - For freight intelligence

### Optional Services
- Redis (for caching)
- Elasticsearch (for search)
- Monitoring services

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify database exists

2. **Email Service Not Working**
   - Check SMTP credentials
   - Verify Gmail app password
   - Test SMTP connection

3. **File Upload Issues**
   - Verify AWS S3 credentials
   - Check bucket permissions
   - Ensure bucket exists

4. **Payment Processing Error**
   - Verify Stripe test keys
   - Check webhook configuration
   - Test with Stripe test cards

### Getting Help

If you encounter issues:
1. Check the application logs
2. Verify all environment variables
3. Test each service individually
4. Check service documentation

## Security Notes

- Never commit real credentials to version control
- Use different keys for development and production
- Regularly rotate API keys and secrets
- Monitor API usage and costs
- Enable two-factor authentication where possible

---

**Ready to start development!** 🚀