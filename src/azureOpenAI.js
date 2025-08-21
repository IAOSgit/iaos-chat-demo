class AzureOpenAIService {
  constructor() {
    // Use different endpoints for development vs production
    this.backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : window.location.hostname === 'purple-ground-06def9f0f.2.azurestaticapps.net'
        ? '/api'
        : '/api';
    
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    // Backend handles the Azure configuration
    this.isConfigured = true;
    console.log('Azure OpenAI service initialized (using backend proxy)');
    console.log('Backend URL:', this.backendUrl);
  }

  async testConnection() {
    try {
      console.log('Testing backend connection...');
      
      const response = await fetch(`${this.backendUrl}/test-connection`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend connection test successful:', data);
        return data.connected;
      } else {
        const errorData = await response.json();
        console.error('Backend connection test failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  async sendMessage(messages) {
    try {
      console.log('Sending message via backend:', messages);
      
      const response = await fetch(`${this.backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          options: {
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backend chat response:', data);
        
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content;
        } else {
          throw new Error('No response from Azure OpenAI');
        }
      } else {
        const errorData = await response.json();
        throw new Error(`Backend error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error sending message via backend:', error);
      throw error;
    }
  }

  isReady() {
    return this.isConfigured;
  }
}

export default new AzureOpenAIService();
