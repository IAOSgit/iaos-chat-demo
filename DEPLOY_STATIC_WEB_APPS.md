# Azure Static Web Apps Deployment Guide

## Why Azure Static Web Apps?
- ✅ Automatic CI/CD from GitHub
- ✅ Built-in API support (your Express backend)
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Easy custom domains
- ✅ Integrated authentication
- ✅ Perfect for React + Express apps

## Step-by-Step Deployment

### 1. Prepare Your Code
```bash
# Create production build configuration
npm run build
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/iaos-chat-demo.git
git push -u origin main
```

### 3. Deploy to Azure Static Web Apps

1. **Go to Azure Portal** → Create Resource → Static Web Apps
2. **Connect to GitHub** → Select your repository
3. **Build Configuration**:
   - App location: `/`
   - API location: `/server.js`
   - Output location: `dist`
   - Build command: `npm run build`

### 4. Configure Environment Variables in Azure
In Azure Portal → Static Web Apps → Configuration:
```
VITE_AZURE_OPENAI_ENDPOINT=https://leasalytics.cognitiveservices.azure.com/
VITE_AZURE_OPENAI_API_KEY=your-key
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment
VITE_AZURE_OPENAI_API_VERSION=2025-01-01-preview
NODE_ENV=production
```

### 5. Update CORS for Production
Your server.js already has production CORS configuration!

## Estimated Cost: FREE
- Static Web Apps free tier includes:
  - 100GB bandwidth/month
  - 0.5GB storage
  - Custom domains
  - SSL certificates
