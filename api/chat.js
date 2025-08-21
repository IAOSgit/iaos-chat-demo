const { app } = require('@azure/functions');

// Input validation function
function validateChatInput(messages) {
    if (!messages || !Array.isArray(messages)) {
        return 'Messages array is required';
    }
    
    if (messages.length === 0) {
        return 'At least one message is required';
    }
    
    if (messages.length > 50) {
        return 'Too many messages (max 50)';
    }
    
    for (const message of messages) {
        if (!message.role || !message.content) {
            return 'Each message must have role and content';
        }
        
        if (!['user', 'assistant', 'system'].includes(message.role)) {
            return 'Invalid message role';
        }
        
        if (typeof message.content !== 'string' || message.content.length > 4000) {
            return 'Message content must be a string under 4000 characters';
        }
    }
    
    return null;
}

app.http('chat', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { messages, options = {} } = body;

            // Validate input
            const validationError = validateChatInput(messages);
            if (validationError) {
                return {
                    status: 400,
                    jsonBody: { error: validationError }
                };
            }

            const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
            const AZURE_API_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
            const AZURE_DEPLOYMENT = process.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
            const AZURE_API_VERSION = process.env.VITE_AZURE_OPENAI_API_VERSION;

            if (!AZURE_ENDPOINT || !AZURE_API_KEY || !AZURE_DEPLOYMENT) {
                return {
                    status: 500,
                    jsonBody: { error: 'Azure OpenAI not configured properly' }
                };
            }

            // Sanitize options
            const sanitizedOptions = {
                max_tokens: Math.min(Math.max(parseInt(options.max_tokens) || 1000, 1), 4000),
                temperature: Math.min(Math.max(parseFloat(options.temperature) || 0.7, 0), 2),
                top_p: Math.min(Math.max(parseFloat(options.top_p) || 0.9, 0), 1)
            };

            const baseUrl = AZURE_ENDPOINT.endsWith('/') ? AZURE_ENDPOINT.slice(0, -1) : AZURE_ENDPOINT;
            const url = `${baseUrl}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

            context.log('Sending chat request to Azure OpenAI...');

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
                signal: AbortSignal.timeout(30000)
            });

            if (response.ok) {
                const data = await response.json();
                context.log('Chat response received successfully');
                
                // Log metadata (without content)
                const logData = {
                    id: data.id,
                    model: data.model,
                    usage: data.usage,
                    created: data.created
                };
                context.log('Response metadata:', logData);
                
                return {
                    status: 200,
                    jsonBody: data
                };
            } else {
                const errorText = await response.text();
                context.log.error('Chat request failed:', response.status, response.statusText);
                return {
                    status: response.status,
                    jsonBody: {
                        error: `Azure OpenAI error: ${response.status} ${response.statusText}`
                    }
                };
            }
        } catch (error) {
            if (error.name === 'TimeoutError') {
                context.log.error('Chat request timeout');
                return {
                    status: 408,
                    jsonBody: { error: 'Request timeout' }
                };
            }

            context.log.error('Chat request error:', error.message);
            return {
                status: 500,
                jsonBody: { error: 'Internal server error' }
            };
        }
    }
});
