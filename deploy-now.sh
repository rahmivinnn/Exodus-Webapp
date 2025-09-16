#!/bin/bash

echo "🚀 EXODUS LOGISTIX - Quick Deploy"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Your app is ready to deploy!"
    echo ""
    echo "📋 WORKING URLs:"
    echo "=================="
    echo "✅ Vercel: https://web-ten-dusky-22.vercel.app/"
    echo "✅ GitHub Pages: https://rahmivinnn.github.io/Exodus-Webapp"
    echo ""
    echo "🚀 DEPLOY TO OTHER PLATFORMS:"
    echo "============================="
    echo ""
    echo "1️⃣ NETLIFY (Recommended):"
    echo "   • Go to: https://netlify.com"
    echo "   • New site from Git"
    echo "   • Connect: rahmivinnn/Exodus-Webapp"
    echo "   • Build: npm run build"
    echo "   • Publish: .next"
    echo ""
    echo "2️⃣ RAILWAY:"
    echo "   • Go to: https://railway.app"
    echo "   • New Project → Deploy from GitHub"
    echo "   • Select: rahmivinnn/Exodus-Webapp"
    echo ""
    echo "3️⃣ RENDER:"
    echo "   • Go to: https://render.com"
    echo "   • New Web Service"
    echo "   • Connect: rahmivinnn/Exodus-Webapp"
    echo "   • Build: npm run build"
    echo "   • Start: npm start"
    echo ""
    echo "❌ DON'T USE:"
    echo "   • https://exodus-alpha.vercel.app/ (404 Not Found)"
    echo ""
    echo "🎯 RECOMMENDED: Use GitHub Pages - Most reliable!"
    echo "   https://rahmivinnn.github.io/Exodus-Webapp"
    echo ""
    echo "📱 Test your app now!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi