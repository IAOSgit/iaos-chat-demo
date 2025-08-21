module.exports = async function (context, req) {
    try {
        const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
        const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY;
        const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;

        if (!AZURE_ENDPOINT || !AZURE_API_KEY || !AZURE_DEPLOYMENT) {
            context.res = {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    error: 'Azure OpenAI not configured properly',
                    configured: false
                }
            };
            return;
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
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { 
                    connected: true, 
                    timestamp: new Date().toISOString() 
                }
            };
        } else {
            const errorText = await response.text();
            context.log.error('Connection test failed:', response.status, response.statusText);
            context.res = {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    connected: false,
                    error: `${response.status}: ${response.statusText}`,
                    timestamp: new Date().toISOString()
                }
            };
        }
    } catch (error) {
        if (error.name === 'TimeoutError') {
            context.log.error('Connection test timeout');
            context.res = {
                status: 408,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    connected: false,
                    error: 'Connection timeout'
                }
            };
        } else {
            context.log.error('Connection test error:', error.message);
            context.res = {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    connected: false,
                    error: 'Connection test failed',
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
};
