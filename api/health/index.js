module.exports = async function (context, req) {
    context.log('Health check request received');
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            status: 'ok',
            azure_configured: !!(process.env.AZURE_OPENAI_ENDPOINT && 
                               process.env.AZURE_OPENAI_API_KEY && 
                               process.env.AZURE_OPENAI_DEPLOYMENT_NAME),
            timestamp: new Date().toISOString(),
            environment: 'production'
        }
    };
};
