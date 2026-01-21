// Vertex AI service proxy - calls backend server instead of direct API
// Backend server handles Vertex AI authentication and streaming

class VertexAIProxy {
  constructor() {
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    this.isInitialized = false;
  }

  /**
   * Initialize the service (check backend health)
   * @returns {boolean} Success status
   */
  async initialize() {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      if (response.ok) {
        this.isInitialized = true;
        console.log('Backend connection established');
        return true;
      }
      console.error('Backend server not responding');
      return false;
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      console.warn('Make sure backend is running: npm run backend');
      return false;
    }
  }

  /**
   * Send a message and stream the response from backend
   * @param {string} agentId - Agent identifier
   * @param {string} role - Agent role
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages for context
   * @param {Function} onChunk - Callback for each streamed text chunk
   * @param {number} temperature - Response randomness
   * @returns {Promise<string>} Full response text
   */
  async sendMessageStream(agentId, role, message, conversationHistory = [], onChunk = null, temperature = 0.7) {
    try {
      // Ensure backend is available
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Call backend streaming endpoint
      const response = await fetch(`${this.backendUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          role,
          message,
          conversationHistory,
          temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      // Read Server-Sent Events (SSE) stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.done) {
                fullResponse = data.fullResponse;
              } else if (data.chunk) {
                // Call chunk callback
                if (onChunk && typeof onChunk === 'function') {
                  onChunk(data.chunk);
                }
              }
            } catch (parseError) {
              console.warn('Error parsing SSE data:', parseError);
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error streaming from Vertex AI backend:', error);
      throw error;
    }
  }

  /**
   * Send a message without streaming (batch response)
   * Note: Still uses streaming under the hood but returns full response
   * @param {string} agentId - Agent identifier
   * @param {string} role - Agent role
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages for context
   * @param {number} temperature - Response randomness
   * @returns {Promise<string>} Response text
   */
  async sendMessage(agentId, role, message, conversationHistory = [], temperature = 0.7) {
    return this.sendMessageStream(agentId, role, message, conversationHistory, null, temperature);
  }
}

// Export singleton instance
export const geminiService = new VertexAIProxy();
