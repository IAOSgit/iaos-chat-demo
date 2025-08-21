import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' ? 
    ['https://yourdomain.com'] : // Replace with your production domain
    ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files in production
if (NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Handle client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

// Azure OpenAI configuration with validation
const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_API_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
const AZURE_DEPLOYMENT = process.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
const AZURE_API_VERSION = process.env.VITE_AZURE_OPENAI_API_VERSION;

// Validate required environment variables
const requiredEnvVars = {
  VITE_AZURE_OPENAI_ENDPOINT: AZURE_ENDPOINT,
  VITE_AZURE_OPENAI_API_KEY: AZURE_API_KEY,
  VITE_AZURE_OPENAI_DEPLOYMENT_NAME: AZURE_DEPLOYMENT,
  VITE_AZURE_OPENAI_API_VERSION: AZURE_API_VERSION
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please check your .env file');
} else {
  console.log('✅ All Azure OpenAI environment variables configured');
}

console.log('🔧 Server starting with Azure config:', {
  endpoint: AZURE_ENDPOINT ? '***configured***' : 'missing',
  deployment: AZURE_DEPLOYMENT ? '***configured***' : 'missing',
  apiVersion: AZURE_API_VERSION,
  hasApiKey: !!AZURE_API_KEY,
  environment: NODE_ENV
});

// Input validation middleware
const validateChatInput = (req, res, next) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }
  
  if (messages.length === 0) {
    return res.status(400).json({ error: 'At least one message is required' });
  }
  
  if (messages.length > 50) {
    return res.status(400).json({ error: 'Too many messages (max 50)' });
  }
  
  // Validate each message
  for (const message of messages) {
    if (!message.role || !message.content) {
      return res.status(400).json({ error: 'Each message must have role and content' });
    }
    
    if (!['user', 'assistant', 'system'].includes(message.role)) {
      return res.status(400).json({ error: 'Invalid message role' });
    }
    
    if (typeof message.content !== 'string' || message.content.length > 4000) {
      return res.status(400).json({ error: 'Message content must be a string under 4000 characters' });
    }
  }
  
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    azure_configured: !!(AZURE_ENDPOINT && AZURE_API_KEY && AZURE_DEPLOYMENT),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Test Azure OpenAI connection
app.get('/api/test-connection', async (req, res) => {
  try {
    if (!AZURE_ENDPOINT || !AZURE_API_KEY || !AZURE_DEPLOYMENT) {
      return res.status(500).json({ 
        error: 'Azure OpenAI not configured properly',
        configured: false
      });
    }

    const baseUrl = AZURE_ENDPOINT.endsWith('/') ? AZURE_ENDPOINT.slice(0, -1) : AZURE_ENDPOINT;
    const url = `${baseUrl}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
    
    console.log('🔍 Testing connection to Azure OpenAI...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection test successful');
      res.json({ connected: true, timestamp: new Date().toISOString() });
    } else {
      const errorText = await response.text();
      console.error('❌ Connection test failed:', response.status, response.statusText);
      res.status(response.status).json({ 
        connected: false, 
        error: `${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Connection test timeout');
      return res.status(408).json({ 
        connected: false, 
        error: 'Connection timeout' 
      });
    }
    
    console.error('❌ Connection test error:', error.message);
    res.status(500).json({ 
      connected: false, 
      error: 'Connection test failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Chat completions endpoint with enhanced security
app.post('/api/chat', validateChatInput, async (req, res) => {
  try {
    const { messages, options = {} } = req.body;

    if (!AZURE_ENDPOINT || !AZURE_API_KEY || !AZURE_DEPLOYMENT) {
      return res.status(500).json({ 
        error: 'Azure OpenAI not configured properly' 
      });
    }

    // Sanitize and validate options
    const sanitizedOptions = {
      max_tokens: Math.min(Math.max(parseInt(options.max_tokens) || 1000, 1), 4000),
      temperature: Math.min(Math.max(parseFloat(options.temperature) || 0.7, 0), 2),
      top_p: Math.min(Math.max(parseFloat(options.top_p) || 0.9, 0), 1)
    };

    const baseUrl = AZURE_ENDPOINT.endsWith('/') ? AZURE_ENDPOINT.slice(0, -1) : AZURE_ENDPOINT;
    const url = `${baseUrl}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
    
    console.log('💬 Sending chat request to Azure OpenAI...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY,
        'User-Agent': 'IAOS-Chat-Demo/1.0'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant from IAOS Solutions. Be concise and helpful.' },
          ...messages
        ],
        ...sanitizedOptions
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat response received successfully');
      
      // Remove sensitive information from logs
      const logData = {
        id: data.id,
        model: data.model,
        usage: data.usage,
        created: data.created
      };
      console.log('📊 Response metadata:', logData);
      
      res.json(data);
    } else {
      const errorText = await response.text();
      console.error('❌ Chat request failed:', response.status, response.statusText);
      res.status(response.status).json({ 
        error: `Azure OpenAI error: ${response.status} ${response.statusText}` 
      });
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Chat request timeout');
      return res.status(408).json({ 
        error: 'Request timeout' 
      });
    }
    
    console.error('❌ Chat request error:', error.message);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test connection: http://localhost:${PORT}/api/test-connection`);
  console.log(`🔒 Security features enabled: Helmet, Rate Limiting, CORS, Input Validation`);
});
