const { app } = require('@azure/functions');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        return {
            status: 200,
            jsonBody: {
                status: 'ok',
                azure_configured: !!(process.env.VITE_AZURE_OPENAI_ENDPOINT && 
                                   process.env.VITE_AZURE_OPENAI_API_KEY && 
                                   process.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME),
                timestamp: new Date().toISOString(),
                environment: 'production'
            }
        };
    }
});
