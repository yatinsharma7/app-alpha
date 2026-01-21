// Vertex AI service for AI-powered agent conversations
const { VertexAI } = require('@google-cloud/vertexai');
const { getPromptByRole } = require('./agentPrompts');

class VertexAIService {
  constructor() {
    this.vertexAI = null;
    this.models = new Map(); // Cache model instances per agent
    this.isInitialized = false;
    
    // GCP configuration from environment variables
    this.projectId = process.env.GCP_PROJECT_ID;
    this.location = process.env.GCP_LOCATION || 'us-central1';
  }

  /**
   * Initialize the Vertex AI client
   * @returns {boolean} Success status
   */
  initialize() {
    try {
      if (!this.projectId) {
        console.error('GCP_PROJECT_ID not configured. Please add it to .env file.');
        return false;
      }

      // Initialize Vertex AI
      // This uses Application Default Credentials (ADC) or GOOGLE_APPLICATION_CREDENTIALS
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location,
      });

      this.isInitialized = true;
      console.log(`Vertex AI initialized - Project: ${this.projectId}, Location: ${this.location}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize Vertex AI:', error);
      return false;
    }
  }

  /**
   * Get or create a generative model for an agent
   * @param {string} agentId - Unique agent identifier
   * @param {string} role - Agent role for system prompt
   * @param {number} temperature - Response randomness (0-1)
   * @returns {Object} Vertex AI generative model
   */
  getModel(agentId, role, temperature = 0.7) {
    if (!this.isInitialized && !this.initialize()) {
      throw new Error('Vertex AI not initialized');
    }

    // Return cached model if exists
    if (this.models.has(agentId)) {
      return this.models.get(agentId);
    }

    // Get role-specific system instruction
    const systemInstruction = getPromptByRole(role);

    // Create generative model instance
    const model = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Using Gemini 1.5 Flash via Vertex AI
      generationConfig: {
        temperature: temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      systemInstruction: systemInstruction,
    });

    // Cache the model
    this.models.set(agentId, model);
    return model;
  }

  /**
   * Send a message and stream the response
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
      const model = this.getModel(agentId, role, temperature);

      // Build chat history in Gemini format
      const history = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      // Start chat session with history
      const chat = model.startChat({
        history: history,
      });

      // Send message and stream response
      const result = await chat.sendMessageStream(message);
      
      let fullResponse = '';

      // Process streamed chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        if (onChunk) {
          onChunk(chunkText);
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('Vertex AI streaming error:', error);
      throw new Error(`Vertex AI request failed: ${error.message}`);
    }
  }

  /**
   * Clear cached model for an agent
   * @param {string} agentId - Agent identifier to clear
   */
  clearModel(agentId) {
    this.models.delete(agentId);
  }

  /**
   * Clear all cached models
   */
  clearAllModels() {
    this.models.clear();
  }
}

// Export singleton instance
module.exports = new VertexAIService();
