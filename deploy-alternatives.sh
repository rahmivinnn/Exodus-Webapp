#!/bin/bash

echo "🚀 Deploying to Alternative Platforms (Vercel Alternative)"
echo "=================================================="

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

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo ""
    echo "🌐 Choose your deployment platform:"
    echo "1) Netlify (Recommended - Free, Reliable)"
    echo "2) Railway (Full-stack with database)"
    echo "3) Render (Free tier available)"
    echo "4) GitHub Pages (Static only)"
    echo "5) Deploy to all platforms"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            echo "🌐 Deploying to Netlify..."
            echo "📝 Steps:"
            echo "1. Go to https://netlify.com"
            echo "2. Click 'New site from Git'"
            echo "3. Connect your GitHub repository"
            echo "4. Build settings:"
            echo "   - Build command: npm run build"
            echo "   - Publish directory: .next"
            echo "5. Add environment variables if needed"
            echo ""
            echo "🔗 Your app will be available at: https://your-site-name.netlify.app"
            ;;
        2)
            echo "🚂 Deploying to Railway..."
            echo "📝 Steps:"
            echo "1. Go to https://railway.app"
            echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
            echo "3. Select your repository"
            echo "4. Railway will auto-detect Next.js"
            echo "5. Add environment variables in Railway dashboard"
            echo ""
            echo "🔗 Your app will be available at: https://your-app.railway.app"
            ;;
        3)
            echo "🎨 Deploying to Render..."
            echo "📝 Steps:"
            echo "1. Go to https://render.com"
            echo "2. Click 'New' → 'Web Service'"
            echo "3. Connect your GitHub repository"
            echo "4. Build settings:"
            echo "   - Build command: npm run build"
            echo "   - Start command: npm start"
            echo "5. Add environment variables if needed"
            echo ""
            echo "🔗 Your app will be available at: https://your-app.onrender.com"
            ;;
        4)
            echo "📄 Deploying to GitHub Pages..."
            echo "📝 Steps:"
            echo "1. Go to your repo settings"
            echo "2. Scroll to 'Pages' section"
            echo "3. Source: GitHub Actions"
            echo "4. The workflow will auto-deploy"
            echo ""
            echo "🔗 Your app will be available at: https://rahmivinnn.github.io/Exodus-Webapp"
            ;;
        5)
            echo "🚀 Deploying to ALL platforms..."
            echo "📝 Follow the steps for each platform above"
            echo ""
            echo "✅ All platforms configured!"
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
echo "🎉 Deployment setup completed!"
echo "📚 For detailed instructions, check ALTERNATIVE_DEPLOYMENT.md"