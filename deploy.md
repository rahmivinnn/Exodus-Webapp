# Deployment Guide

## Prerequisites

1. **MongoDB**: Set up a MongoDB instance (local or cloud)
2. **PostgreSQL**: Set up a PostgreSQL database (existing)
3. **Environment Variables**: Configure all required environment variables

## Environment Setup

### 1. Copy Environment File
```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

#### Required Variables:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/exodus_logistics"

# MongoDB Configuration
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DB="exodus_logistics"

# API Configuration
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Temporary API Key for Testing
TEST_API_KEY="exodus_test_key_1234567890abcdef"
TEST_USER_ID="test-user-id"
```

#### Optional Variables:
```env
# Greenscreens.ai API (if using)
GREENSCREENS_API_KEY="your-greenscreens-api-key-here"

# Rate Limiting
API_RATE_LIMIT="1000"
API_RATE_WINDOW="900000"

# CORS
CORS_ORIGIN="http://localhost:3000,https://yourdomain.com"
```

## Installation

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Database Setup

#### PostgreSQL (Prisma)
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

#### MongoDB
```bash
# MongoDB will be automatically connected when the app starts
# No additional setup required
```

### 3. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

## API Key Testing

### 1. Create a Temporary API Key
```bash
curl -X POST http://localhost:3000/api/api-keys/temporary \
  -H "Content-Type: application/json" \
  -H "x-api-key: exodus_test_key_1234567890abcdef" \
  -d '{"durationHours": 72}'
```

### 2. Test API Authentication
```bash
curl -X GET http://localhost:3000/api/test \
  -H "x-api-key: YOUR_GENERATED_API_KEY"
```

### 3. Test API Key Management
```bash
# List API keys
curl -X GET http://localhost:3000/api/api-keys \
  -H "x-api-key: YOUR_GENERATED_API_KEY"

# Create new API key
curl -X POST http://localhost:3000/api/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_GENERATED_API_KEY" \
  -d '{
    "name": "My API Key",
    "permissions": ["shipments:read", "tracking:read"],
    "rateLimit": 500
  }'
```

## Production Deployment

### 1. Environment Variables for Production
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@prod-host:5432/exodus_logistics"
MONGODB_URI="mongodb://user:pass@prod-host:27017/exodus_logistics"
NEXTAUTH_URL="https://yourdomain.com"
```

### 2. Build and Start
```bash
npm run build
npm start
```

### 3. Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Considerations

1. **API Keys**: Store API keys securely and rotate them regularly
2. **Environment Variables**: Never commit `.env` files to version control
3. **Rate Limiting**: Configure appropriate rate limits for your use case
4. **CORS**: Configure CORS origins properly for production
5. **MongoDB**: Use authentication and SSL in production
6. **PostgreSQL**: Use SSL connections in production

## Monitoring

### Health Checks
- Database: `GET /api/health/database`
- MongoDB: `GET /api/health/mongodb`
- API Keys: `GET /api/health/api-keys`

### Logs
- API key usage is logged in MongoDB
- Rate limiting violations are logged
- Authentication failures are logged

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI environment variable
   - Ensure MongoDB is running
   - Check network connectivity

2. **API Key Authentication Failed**
   - Verify API key format
   - Check if API key is active and not expired
   - Ensure proper headers are sent

3. **Rate Limit Exceeded**
   - Check rate limit configuration
   - Implement proper retry logic
   - Consider increasing rate limits if needed

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.