const { app } = require('@azure/functions');

app.http('testConnection', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'test-connection',
    handler: async (request, context) => {
        try {
            const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
            const AZURE_API_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
            const AZURE_DEPLOYMENT = process.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
            const AZURE_API_VERSION = process.env.VITE_AZURE_OPENAI_API_VERSION;

            if (!AZURE_ENDPOINT || !AZURE_API_KEY || !AZURE_DEPLOYMENT) {
                return {
                    status: 500,
                    jsonBody: {
                        error: 'Azure OpenAI not configured properly',
                        configured: false
                    }
                };
            }

            const baseUrl = AZURE_ENDPOINT.endsWith('/') ? AZURE_ENDPOINT.slice(0, -1) : AZURE_ENDPOINT;
            const url = `${baseUrl}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

            context.log('Testing connection to Azure OpenAI...');

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
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                context.log('Connection test successful');
                return {
                    status: 200,
                    jsonBody: { 
                        connected: true, 
                        timestamp: new Date().toISOString() 
                    }
                };
            } else {
                const errorText = await response.text();
                context.log.error('Connection test failed:', response.status, response.statusText);
                return {
                    status: response.status,
                    jsonBody: {
                        connected: false,
                        error: `${response.status}: ${response.statusText}`,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        } catch (error) {
            if (error.name === 'TimeoutError') {
                context.log.error('Connection test timeout');
                return {
                    status: 408,
                    jsonBody: {
                        connected: false,
                        error: 'Connection timeout'
                    }
                };
            }

            context.log.error('Connection test error:', error.message);
            return {
                status: 500,
                jsonBody: {
                    connected: false,
                    error: 'Connection test failed',
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
});
