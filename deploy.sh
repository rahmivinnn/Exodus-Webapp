#!/bin/bash

# Exodus Webapp Deployment Script
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Ask user which platform to deploy to
    echo ""
    echo "Choose deployment platform:"
    echo "1) GitHub Pages (Free, Static)"
    echo "2) Netlify (Free, Full-stack)"
    echo "3) Railway (Free tier, Full-stack)"
    echo "4) Just build (no deploy)"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo "🌐 Deploying to GitHub Pages..."
            npm run deploy:github
            echo "✅ Deployed to GitHub Pages!"
            echo "🔗 Your app will be available at: https://rahmivinnn.github.io/Exodus-Webapp"
            ;;
        2)
            echo "🌐 Deploying to Netlify..."
            npm run deploy:netlify
            echo "✅ Ready for Netlify deployment!"
            echo "📝 Upload the .next folder to Netlify or connect your GitHub repo"
            ;;
        3)
            echo "🚂 Deploying to Railway..."
            npm run deploy:railway
            echo "✅ Ready for Railway deployment!"
            echo "📝 Connect your GitHub repo to Railway for auto-deployment"
            ;;
        4)
            echo "✅ Build completed successfully!"
            ;;
        *)
            echo "❌ Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Deployment process completed!"
echo "📚 For more options, check ALTERNATIVE_DEPLOYMENT.md"