# EXODUS LOGISTIX - DEVELOPMENT SETUP SCRIPT (PowerShell)
# This script sets up the development environment for new developers

Write-Host " Setting up Exodus Logistix Development Environment..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Node.js is installed
try {
     = node -v
    Write-Host " Node.js  detected" -ForegroundColor Green
} catch {
    Write-Host " Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
     = npm -v
    Write-Host " npm  detected" -ForegroundColor Green
} catch {
    Write-Host " npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host " Installing dependencies..." -ForegroundColor Cyan
npm install

if (0 -ne 0) {
    Write-Host " Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host " Dependencies installed successfully" -ForegroundColor Green

# Create environment file if it doesn't exist
if (!(Test-Path ".env.local")) {
    Write-Host ""
    Write-Host " Creating environment file..." -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host " Created .env.local file" -ForegroundColor Green
        Write-Host "   Please edit .env.local with your configuration" -ForegroundColor Yellow
    } else {
        Write-Host "  .env.example not found. Please create .env.local manually" -ForegroundColor Yellow
    }
} else {
    Write-Host " .env.local already exists" -ForegroundColor Green
}

# Install VS Code extensions (if VS Code is available)
if (Get-Command code -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host " Installing recommended VS Code extensions..." -ForegroundColor Cyan
    
    # Essential extensions for this project
     = @(
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "prisma.prisma",
        "ms-vscode.vscode-json"
    )
    
    foreach ( in ) {
        code --install-extension 
    }
    
    Write-Host " VS Code extensions installed" -ForegroundColor Green
} else {
    Write-Host "ℹ  VS Code not found. Consider installing these extensions manually:" -ForegroundColor Yellow
    Write-Host "   - TypeScript and JavaScript Language Features" -ForegroundColor Yellow
    Write-Host "   - Tailwind CSS IntelliSense" -ForegroundColor Yellow
    Write-Host "   - Prettier - Code formatter" -ForegroundColor Yellow
    Write-Host "   - ESLint" -ForegroundColor Yellow
    Write-Host "   - Prisma" -ForegroundColor Yellow
}

# Run type checking
Write-Host ""
Write-Host " Running TypeScript type checking..." -ForegroundColor Cyan
npm run type-check

if (0 -ne 0) {
    Write-Host "  TypeScript errors found. Please fix them before continuing." -ForegroundColor Yellow
} else {
    Write-Host " TypeScript type checking passed" -ForegroundColor Green
}

# Run linting
Write-Host ""
Write-Host " Running ESLint..." -ForegroundColor Cyan
npm run lint

if (0 -ne 0) {
    Write-Host "  ESLint issues found. Run 'npm run lint:fix' to fix them." -ForegroundColor Yellow
} else {
    Write-Host " ESLint checks passed" -ForegroundColor Green
}

# Format code
Write-Host ""
Write-Host " Formatting code..." -ForegroundColor Cyan
npm run format

Write-Host " Code formatted" -ForegroundColor Green

# Create development database (if Prisma is configured)
if (Test-Path "prisma/schema.prisma") {
    Write-Host ""
    Write-Host "  Setting up database..." -ForegroundColor Cyan
    
    # Generate Prisma client
    npx prisma generate
    
    # Check if database is accessible
    try {
        npx prisma db push --accept-data-loss
        Write-Host " Database setup completed" -ForegroundColor Green
    } catch {
        Write-Host "  Database setup failed. Please check your DATABASE_URL in .env.local" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host " Setup completed successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your configuration" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "4. Read the documentation:" -ForegroundColor White
Write-Host "   - README.md - Quick start guide" -ForegroundColor Gray
Write-Host "   - FULLSTACK_DEVELOPER_GUIDE.md - Complete development guide" -ForegroundColor Gray
Write-Host "   - FREIGHT_CALCULATOR_README.md - Component documentation" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! " -ForegroundColor Green
