# Azure Static Web Apps Deployment Guide

## Why Azure Static Web Apps?
- ✅ **Free tier available** - Perfect for demos and small apps
- ✅ **Built-in CI/CD** - Automatic deployments from GitHub
- ✅ **API support** - Your Express.js backend runs as Azure Functions
- ✅ **Custom domains** - Easy SSL and domain setup
- ✅ **Global CDN** - Fast worldwide performance
- ✅ **Authentication** - Built-in auth providers

## Prerequisites
1. GitHub account
2. Azure account (free tier works)
3. Push your code to GitHub repository

## Step-by-Step Deployment

### Step 1: Prepare Your Code
Your project structure is already perfect:
```
iaos-chat-demo/
├── src/           # React frontend
├── server.js      # Express backend
├── package.json
└── .env.example
```

### Step 2: Create Azure Static Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web Apps"
4. Click "Create"

### Step 3: Configuration
- **Resource Group**: Create new or use existing
- **Name**: `iaos-chat-demo`
- **Plan**: Free (0 USD/month)
- **Source**: GitHub
- **Repository**: Select your GitHub repo
- **Branch**: main
- **Build Presets**: Custom
- **App location**: `/`
- **API location**: `/api`
- **Output location**: `dist`

### Step 4: Environment Variables
In Azure Portal → Static Web App → Configuration:
```
VITE_AZURE_OPENAI_ENDPOINT=https://leasalytics.cognitiveservices.azure.com/
VITE_AZURE_OPENAI_API_KEY=your-key-here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-1-mini-iaos-2025-04-14-ft-469769a845524a7fa53e6412f3f9c279
VITE_AZURE_OPENAI_API_VERSION=2025-01-01-preview
NODE_ENV=production
```

### Step 5: Custom Domain (Optional)
- Add your domain in Static Web App settings
- Azure provides free SSL certificates

## Cost: FREE for most use cases!
- Free tier: 100GB bandwidth/month
- Free custom domain and SSL
- Only pay if you exceed limits
