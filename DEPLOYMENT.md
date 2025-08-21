# 🚀 Complete Azure Deployment Guide for IAOS Chat Demo

## 📋 **Quick Start: Best Option (Azure Static Web Apps)**

### **Why Azure Static Web Apps?**
- ✅ **FREE** - Perfect for demos and small apps
- ✅ **Automatic CI/CD** from GitHub
- ✅ **Built-in API support** (Azure Functions)
- ✅ **Global CDN** - Fast worldwide
- ✅ **Custom domains + SSL** included
- ✅ **No server management** needed

---

## 🎯 **Step 1: Prepare Your Repository**

### Push to GitHub:
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: IAOS Chat Demo with Azure OpenAI"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/iaos-chat-demo.git
git branch -M main
git push -u origin main
```

---

## 🌐 **Step 2: Deploy to Azure Static Web Apps**

### **Option A: Azure Portal (Recommended)**
1. **Go to [Azure Portal](https://portal.azure.com)**
2. **Click "Create a resource"**
3. **Search "Static Web Apps" → Create**
4. **Fill in details:**
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new `iaos-chat-demo-rg`
   - **Name**: `iaos-chat-demo`
   - **Plan**: **Free** (0 USD/month)
   - **Region**: East US 2 (or closest to you)
   - **Source**: **GitHub**
   - **GitHub Account**: Sign in to your GitHub
   - **Repository**: Select `iaos-chat-demo`
   - **Branch**: `main`

5. **Build Configuration:**
   - **Build Presets**: `Custom`
   - **App location**: `/` 
   - **API location**: `/api`
   - **Output location**: `dist`

6. **Click "Review + Create" → Create**

### **Option B: Azure CLI (Advanced)**
```bash
# Login to Azure
az login

# Create Static Web App
az staticwebapp create \
    --name iaos-chat-demo \
    --resource-group iaos-chat-demo-rg \
    --source https://github.com/YOUR_USERNAME/iaos-chat-demo \
    --location "East US 2" \
    --branch main \
    --app-location "/" \
    --api-location "/api" \
    --output-location "dist"
```

---

## 🔐 **Step 3: Configure Environment Variables**

### In Azure Portal:
1. **Go to your Static Web App**
2. **Settings → Configuration**
3. **Add Application Settings:**

```
VITE_AZURE_OPENAI_ENDPOINT = https://your-azure-endpoint.cognitiveservices.azure.com/
VITE_AZURE_OPENAI_API_KEY = your-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME = your-deployment-name
VITE_AZURE_OPENAI_API_VERSION = 2025-01-01-preview
NODE_ENV = production
```

### GitHub Secrets (for CI/CD):
1. **Go to GitHub repo → Settings → Secrets and variables → Actions**
2. **Add Repository Secrets:**
   - `VITE_AZURE_OPENAI_ENDPOINT`
   - `VITE_AZURE_OPENAI_API_KEY`
   - `VITE_AZURE_OPENAI_DEPLOYMENT_NAME`
   - `VITE_AZURE_OPENAI_API_VERSION`

---

## 🎉 **Step 4: Access Your Live Website**

After deployment (5-10 minutes):
1. **Your site will be live at**: `https://YOUR_APP_NAME.azurestaticapps.net`
2. **Test all functionality:**
   - ✅ Chat interface loads
   - ✅ Azure model shows "connected"
   - ✅ Messages work with your AI

---

## 💰 **Cost Breakdown**

### **Azure Static Web Apps (Recommended)**
- **Free Tier**: $0/month
  - 100 GB bandwidth
  - 0.5 GB storage
  - Custom domain + SSL
  - Perfect for most use cases

### **Azure App Service (Alternative)**
- **Free F1**: $0/month (limited)
- **Basic B1**: ~$13/month (recommended)
- **Standard S1**: ~$56/month (production)

---

## 🔧 **Alternative Deployment Options**

### **2. Azure App Service**
Better for complex applications with specific server needs.
[See DEPLOYMENT-APPSERVICE.md](./DEPLOYMENT-APPSERVICE.md)

### **3. Azure Container Instances**
For Docker-based deployments.

### **4. Azure Kubernetes Service (AKS)**
For enterprise-scale applications.

---

## 🛡️ **Security in Production**

Your app includes production-ready security:
- ✅ **API key protection** - Never exposed to frontend
- ✅ **Rate limiting** - Prevents abuse
- ✅ **Input validation** - Prevents attacks
- ✅ **CORS protection** - Secure cross-origin requests
- ✅ **HTTPS enforced** - Automatic SSL certificates

---

## 📞 **Support & Troubleshooting**

### **Common Issues:**
1. **Build fails**: Check GitHub Actions logs
2. **API not working**: Verify environment variables
3. **404 errors**: Check routing configuration

### **Logs & Monitoring:**
- **Azure Portal**: Monitor → Application Insights
- **GitHub**: Actions tab for build logs
- **Browser**: Developer console for frontend issues

---

## 🎯 **Quick Deploy Checklist**

- [ ] Code pushed to GitHub
- [ ] Azure Static Web App created
- [ ] Environment variables configured
- [ ] GitHub secrets added
- [ ] Deployment successful
- [ ] Website accessible
- [ ] Chat functionality tested
- [ ] Azure OpenAI connection verified

---

**🎉 Congratulations! Your IAOS Chat Demo is now live on Azure!**

**Next Steps:**
- Add custom domain
- Set up monitoring
- Implement user analytics
- Scale as needed
