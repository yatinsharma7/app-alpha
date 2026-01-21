// Express server for Vertex AI integration
// This server acts as a secure proxy between the frontend and Vertex AI
const express = require('express');
const cors = require('cors');
const config = require('./config');
const vertexAIService = require('./vertexAIService');

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({ origin: config.corsOrigins })); // Allow frontend to call this server
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vertex-ai-backend' });
});

// Stream chat endpoint
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { agentId, role, message, conversationHistory, temperature } = req.body;

    // Validate required fields
    if (!agentId || !role || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: agentId, role, and message are required' 
      });
    }

    // Set up Server-Sent Events (SSE) for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream response from Vertex AI
    let fullResponse = '';
    
    await vertexAIService.sendMessageStream(
      agentId,
      role,
      message,
      conversationHistory || [],
      (chunk) => {
        // Send each chunk as SSE
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk, fullResponse })}\n\n`);
      },
      temperature || 0.7
    );

    // Signal completion
    res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Chat stream error:', error);
    
    // Send error via SSE
    res.write(`data: ${JSON.stringify({ 
      error: error.message || 'Failed to process chat request' 
    })}\n\n`);
    res.end();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vertex AI backend server running on http://localhost:${PORT}`);
  console.log(`📡 Frontend should connect to: http://localhost:${PORT}/api/chat/stream`);
  
  // Initialize Vertex AI service
  const initialized = vertexAIService.initialize();
  if (initialized) {
    console.log('✅ Vertex AI service initialized successfully');
  } else {
    console.warn('⚠️  Vertex AI service initialization failed - check credentials');
  }
});
