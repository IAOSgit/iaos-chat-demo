module.exports = async function (context, req) {
    context.log('Test function called');
    
    const responseData = {
        message: 'Hello from Azure Functions!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    };
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
    };
};
