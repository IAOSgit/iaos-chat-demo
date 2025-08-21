const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://gentle-hill-0c1d8a903.5.azurestaticapps.net']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        azure_configured: !!(process.env.AZURE_OPENAI_ENDPOINT && 
                           process.env.AZURE_OPENAI_API_KEY && 
                           process.env.AZURE_OPENAI_DEPLOYMENT_NAME),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test Azure OpenAI connection
app.get('/api/test-connection', async (req, res) => {
    try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01';

        if (!endpoint || !apiKey || !deploymentName) {
            return res.status(500).json({
                success: false,
                error: 'Azure OpenAI not configured properly'
            });
        }

        const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
        const url = `${baseUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            })
        });

        if (response.ok) {
            res.json({ success: true, message: 'Azure OpenAI connection successful' });
        } else {
            const errorText = await response.text();
            res.status(500).json({
                success: false,
                error: `Azure OpenAI error: ${response.status}`,
                details: errorText
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, options = {} } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01';

        if (!endpoint || !apiKey || !deploymentName) {
            return res.status(500).json({ error: 'Azure OpenAI not configured properly' });
        }

        const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
        const url = `${baseUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant from IAOS Solutions. Be concise and helpful.' },
                    ...messages
                ],
                max_tokens: options.max_tokens || 1000,
                temperature: options.temperature || 0.7
            })
        });

        if (response.ok) {
            const data = await response.json();
            res.json(data);
        } else {
            const errorText = await response.text();
            res.status(500).json({
                error: `Azure OpenAI error: ${response.status}`
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
