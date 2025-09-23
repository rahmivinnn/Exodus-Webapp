#!/bin/bash

# EXODUS LOGISTIX - DEVELOPMENT SETUP SCRIPT
# This script sets up the development environment for new developers

echo " Setting up Exodus Logistix Development Environment..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo " Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=
if [ "" -lt 18 ]; then
    echo " Node.js version 18+ is required. Current version: v24.1.0"
    echo "   Please upgrade Node.js from: https://nodejs.org/"
    exit 1
fi

echo " Node.js v24.1.0 detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo " npm is not installed. Please install npm first."
    exit 1
fi

echo " npm 11.3.0 detected"

# Install dependencies
echo ""
echo " Installing dependencies..."
npm install

if [ True -ne 0 ]; then
    echo " Failed to install dependencies"
    exit 1
fi

echo " Dependencies installed successfully"

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo " Creating environment file..."
    cp .env.example .env.local
    echo " Created .env.local file"
    echo "   Please edit .env.local with your configuration"
else
    echo " .env.local already exists"
fi

# Install VS Code extensions (if VS Code is available)
if command -v code &> /dev/null; then
    echo ""
    echo " Installing recommended VS Code extensions..."
    
    # Essential extensions for this project
    code --install-extension ms-vscode.vscode-typescript-next
    code --install-extension bradlc.vscode-tailwindcss
    code --install-extension esbenp.prettier-vscode
    code --install-extension ms-vscode.vscode-eslint
    code --install-extension prisma.prisma
    code --install-extension ms-vscode.vscode-json
    
    echo " VS Code extensions installed"
else
    echo "ℹ  VS Code not found. Consider installing these extensions manually:"
    echo "   - TypeScript and JavaScript Language Features"
    echo "   - Tailwind CSS IntelliSense"
    echo "   - Prettier - Code formatter"
    echo "   - ESLint"
    echo "   - Prisma"
fi

# Run type checking
echo ""
echo " Running TypeScript type checking..."
npm run type-check

if [ True -ne 0 ]; then
    echo "  TypeScript errors found. Please fix them before continuing."
else
    echo " TypeScript type checking passed"
fi

# Run linting
echo ""
echo " Running ESLint..."
npm run lint

if [ True -ne 0 ]; then
    echo "  ESLint issues found. Run 'npm run lint:fix' to fix them."
else
    echo " ESLint checks passed"
fi

# Format code
echo ""
echo " Formatting code..."
npm run format

echo " Code formatted"

# Create development database (if Prisma is configured)
if [ -f "prisma/schema.prisma" ]; then
    echo ""
    echo "  Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Check if database is accessible
    if npx prisma db push --accept-data-loss 2>/dev/null; then
        echo " Database setup completed"
    else
        echo "  Database setup failed. Please check your DATABASE_URL in .env.local"
    fi
fi

echo ""
echo " Setup completed successfully!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Read the documentation:"
echo "   - README.md - Quick start guide"
echo "   - FULLSTACK_DEVELOPER_GUIDE.md - Complete development guide"
echo "   - FREIGHT_CALCULATOR_README.md - Component documentation"
echo ""
echo "Happy coding! "
