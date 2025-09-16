# 🔧 Vercel Troubleshooting Guide

## ❌ Masalah Umum Vercel

### 1. **Client-Side Exception Error**
**Penyebab**: Konfigurasi Next.js yang tidak kompatibel
**Solusi**: 
- ✅ Sudah diperbaiki dengan konfigurasi yang lebih baik
- ✅ Menambahkan error boundary
- ✅ Menggunakan komponen yang lebih aman

### 2. **Build Failures**
**Penyebab**: Dependencies atau konfigurasi yang bermasalah
**Solusi**:
```bash
# Clear cache dan rebuild
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### 3. **Function Timeout**
**Penyebab**: API routes yang terlalu lama
**Solusi**: 
- ✅ Sudah dioptimasi dengan mock data
- ✅ Menambahkan error handling

### 4. **Memory Limit Exceeded**
**Penyebab**: Build process menggunakan terlalu banyak memory
**Solusi**:
- ✅ Menggunakan `output: 'standalone'`
- ✅ Mengoptimasi dependencies

## 🚀 **Solusi Cepat - Deploy ke Platform Lain**

### **Option 1: Netlify (Recommended)**
```bash
# 1. Go to netlify.com
# 2. New site from Git
# 3. Connect GitHub repo
# 4. Build settings:
#    - Build command: npm run build
#    - Publish directory: .next
# 5. Deploy!
```

### **Option 2: Railway**
```bash
# 1. Go to railway.app
# 2. New Project → Deploy from GitHub
# 3. Select repo
# 4. Auto-deploy!
```

### **Option 3: Render**
```bash
# 1. Go to render.com
# 2. New Web Service
# 3. Connect GitHub
# 4. Build: npm run build
# 5. Start: npm start
```

## 🔧 **Fix Vercel Issues**

### **Step 1: Update Vercel Settings**
1. Go to Vercel Dashboard
2. Project Settings → General
3. Update these settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

### **Step 2: Environment Variables**
Add these in Vercel Dashboard → Settings → Environment Variables:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### **Step 3: Redeploy**
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or push new commit to trigger rebuild

## 🆘 **Emergency Deploy**

Jika Vercel masih bermasalah, gunakan script ini:

```bash
# Run this script
./deploy-alternatives.sh
```

## 📊 **Platform Comparison**

| Platform | Free Tier | Reliability | Setup Time | Best For |
|----------|-----------|-------------|------------|----------|
| **Netlify** | ✅ 100GB | ⭐⭐⭐⭐⭐ | 2 min | Static + Functions |
| **Railway** | ✅ $5 credit | ⭐⭐⭐⭐ | 3 min | Full-stack |
| **Render** | ✅ 750 hours | ⭐⭐⭐⭐ | 5 min | Full-stack |
| **Vercel** | ❌ Limited | ⭐⭐⭐ | 1 min | Next.js (when working) |

## 🎯 **Recommended Action**

1. **Try Netlify first** - Most reliable
2. **Keep Vercel as backup** - Once fixed
3. **Use Railway for production** - If you need database

## 📞 **Need Help?**

- Check build logs in platform dashboard
- Look for specific error messages
- Try deploying to different platform
- Contact support if needed