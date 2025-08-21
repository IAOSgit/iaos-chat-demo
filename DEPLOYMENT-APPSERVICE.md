# Azure App Service Deployment Guide

## Why Azure App Service?
- ✅ **Full Node.js support** - Run your Express.js server directly
- ✅ **Easy scaling** - Scale up/down as needed
- ✅ **Integrated with other Azure services**
- ✅ **Built-in monitoring** - Application Insights included
- ✅ **Deployment slots** - Blue/green deployments

## Prerequisites
1. Azure account
2. Azure CLI installed (optional but recommended)

## Step-by-Step Deployment

### Option A: Using Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Create App Service
   - **Resource Group**: Create new
   - **Name**: `iaos-chat-demo`
   - **Runtime**: Node.js 18 LTS
   - **Region**: Choose closest to you
   - **Plan**: Basic B1 (~$13/month) or Free F1

### Option B: Using Azure CLI (Faster)
```bash
# Login to Azure
az login

# Create resource group
az group create --name iaos-chat-demo-rg --location eastus

# Create App Service plan
az appservice plan create --name iaos-chat-plan --resource-group iaos-chat-demo-rg --sku B1 --is-linux

# Create web app
az webapp create --name iaos-chat-demo --resource-group iaos-chat-demo-rg --plan iaos-chat-plan --runtime "NODE|18-lts"

# Set environment variables
az webapp config appsettings set --name iaos-chat-demo --resource-group iaos-chat-demo-rg --settings \
  VITE_AZURE_OPENAI_ENDPOINT="https://leasalytics.cognitiveservices.azure.com/" \
  VITE_AZURE_OPENAI_API_KEY="your-key-here" \
  VITE_AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4-1-mini-iaos-2025-04-14-ft-469769a845524a7fa53e6412f3f9c279" \
  VITE_AZURE_OPENAI_API_VERSION="2025-01-01-preview" \
  NODE_ENV="production"
```

### Deployment Methods
1. **GitHub Actions** (Recommended)
2. **Azure DevOps**
3. **FTP/FTPS**
4. **Local Git**
5. **ZIP deploy**

## Cost: 
- **Free F1**: $0/month (limited)
- **Basic B1**: ~$13/month (recommended)
- **Standard S1**: ~$56/month (production)
