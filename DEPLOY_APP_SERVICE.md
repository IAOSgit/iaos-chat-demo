# Azure App Service Deployment Guide

## Why Azure App Service?
- ✅ Full control over server environment
- ✅ Easy scaling options
- ✅ Built-in monitoring
- ✅ Multiple deployment slots
- ✅ Custom domains and SSL

## Step-by-Step Deployment

### 1. Prepare for Production
Create a start script that serves both frontend and backend:

```javascript
// Add to package.json scripts:
"start:prod": "node server.js && serve -s dist -l 3000"
```

### 2. Create Azure App Service

```bash
# Install Azure CLI
az login
az group create --name iaos-chat-rg --location "East US"
az appservice plan create --name iaos-chat-plan --resource-group iaos-chat-rg --sku B1 --is-linux
az webapp create --resource-group iaos-chat-rg --plan iaos-chat-plan --name iaos-chat-demo --runtime "NODE|18-lts"
```

### 3. Configure App Settings
```bash
az webapp config appsettings set --resource-group iaos-chat-rg --name iaos-chat-demo --settings \
  VITE_AZURE_OPENAI_ENDPOINT="https://leasalytics.cognitiveservices.azure.com/" \
  VITE_AZURE_OPENAI_API_KEY="your-key" \
  VITE_AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment" \
  VITE_AZURE_OPENAI_API_VERSION="2025-01-01-preview" \
  NODE_ENV="production"
```

### 4. Deploy
```bash
# Build and deploy
npm run build
az webapp deployment source config-zip --resource-group iaos-chat-rg --name iaos-chat-demo --src deploy.zip
```

## Estimated Cost: ~$13/month
- B1 Basic plan includes:
  - 1.75GB RAM
  - 10GB storage
  - Custom domains
  - SSL certificates
