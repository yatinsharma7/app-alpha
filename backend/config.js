# Load environment variables from .env file
require('dotenv').config();

module.exports = {
  // GCP configuration
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpLocation: process.env.GCP_LOCATION || 'us-central1',
  
  // Server configuration
  port: process.env.PORT || 3000,
  
  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:8080', 'http://127.0.0.1:8080'],
};
