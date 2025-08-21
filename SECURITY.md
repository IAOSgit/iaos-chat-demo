# Security Guide for IAOS Chat Demo

## 🔒 Security Features Implemented

### Backend Security
- **Helmet.js**: Provides security headers (CSRF, XSS protection, etc.)
- **Rate Limiting**: Prevents API abuse (100 requests per 15 minutes per IP)
- **CORS Protection**: Restricts cross-origin requests to allowed domains
- **Input Validation**: Validates all incoming chat messages and parameters
- **Request Timeouts**: Prevents hanging requests (10s for connection test, 30s for chat)
- **Error Handling**: Prevents information leakage in error responses
- **Environment Variables**: Sensitive data stored in .env files

### Frontend Security
- **No Direct API Key Exposure**: All Azure OpenAI calls go through backend proxy
- **Input Sanitization**: User inputs are validated before sending
- **CSP Ready**: Content Security Policy headers for production

### Data Security
- **API Key Protection**: Azure OpenAI API key never exposed to frontend
- **Request Logging**: Sensitive information filtered from logs
- **No Data Storage**: Messages are not stored on the server

## 🛡️ Security Best Practices

### Development Environment
1. Keep `.env` files local and never commit them
2. Use different API keys for development and production
3. Regularly rotate API keys
4. Monitor API usage for unusual patterns

### Production Deployment
1. Set `NODE_ENV=production`
2. Use proper HTTPS certificates
3. Configure proper CORS origins
4. Set up monitoring and alerting
5. Use environment-specific API keys
6. Consider implementing authentication

### API Key Management
- Store API keys in secure environment variables
- Use Azure Key Vault for production
- Implement key rotation policies
- Monitor API usage and costs

## 🚨 Security Vulnerabilities Fixed

1. **CVE-2024-XXXX**: Updated esbuild to fix development server vulnerability
2. **CORS Bypass**: Implemented strict CORS policy
3. **Rate Limiting**: Added to prevent abuse
4. **Input Validation**: Prevents injection attacks
5. **Error Information Leakage**: Sanitized error responses

## 📋 Security Checklist

- [x] Environment variables secured
- [x] API keys not exposed to frontend
- [x] Rate limiting implemented
- [x] Input validation added
- [x] CORS policy configured
- [x] Security headers added
- [x] Error handling improved
- [x] Request timeouts set
- [x] Dependencies updated
- [x] Vulnerability scan clean

## 🔧 Security Configuration

### Rate Limiting
- Window: 15 minutes
- Max requests: 100 per IP
- Applies to: `/api/*` endpoints

### CORS Policy
- Development: `localhost:3000`, `localhost:5173`, `localhost:5174`
- Production: Configure with your actual domain

### Request Limits
- Body size: 1MB max
- Message length: 4000 characters max
- Message history: 50 messages max
- Timeout: 30 seconds max

## 🚀 Deployment Security

For production deployment:

1. **Update CORS origins**:
   ```javascript
   origin: ['https://yourdomain.com']
   ```

2. **Set environment variables**:
   ```bash
   NODE_ENV=production
   PORT=3001
   ```

3. **Use process manager**:
   ```bash
   pm2 start server.js --name iaos-chat
   ```

4. **Set up reverse proxy** (nginx/Apache)
5. **Configure SSL/TLS certificates**
6. **Set up monitoring and logging**
