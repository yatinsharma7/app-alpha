# Vertex AI Setup Guide

This guide will help you set up Google Cloud Platform (GCP) and Vertex AI to use your $300 free credit.

## Prerequisites
- A Google account
- Credit card (for verification - you won't be charged during free trial)

---

## Step 1: Create GCP Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a new project**
   - Click "Select a project" in the top bar
   - Click "New Project"
   - Project name: `app-alpha-vertex` (or your choice)
   - Click "Create"
   - **Copy your Project ID** - you'll need this later

3. **Activate Free Trial** (if not already done)
   - Click "Activate" in the banner at the top
   - Follow the steps to claim your $300 credit

---

## Step 2: Enable Vertex AI API

1. **Navigate to Vertex AI**
   - In the search bar, type "Vertex AI"
   - Click "Vertex AI API"

2. **Enable the API**
   - Click "Enable" button
   - Wait for activation (takes ~1 minute)

3. **Also enable these APIs** (search for each):
   - Cloud Resource Manager API
   - Service Usage API
   - IAM Service Account Credentials API

---

## Step 3: Create Service Account

1. **Go to IAM & Admin > Service Accounts**
   - Left menu: IAM & Admin → Service Accounts
   - Or visit: https://console.cloud.google.com/iam-admin/serviceaccounts

2. **Create Service Account**
   - Click "+ CREATE SERVICE ACCOUNT"
   - Service account name: `vertex-ai-service`
   - Service account ID: `vertex-ai-service` (auto-filled)
   - Click "Create and Continue"

3. **Grant Permissions**
   - Role: Select "Vertex AI User"
   - Click "Continue"
   - Click "Done"

4. **Create JSON Key**
   - Find your new service account in the list
   - Click the 3 dots (⋮) → "Manage keys"
   - Click "Add Key" → "Create new key"
   - Key type: JSON
   - Click "Create"
   - **Download and save the JSON file** - this is your credential!

⚠️ **IMPORTANT**: Keep this JSON file secure. Never commit it to Git!

---

## Step 4: Configure Your Project

1. **Move the service account key**
   ```bash
   # Create a secure location for credentials
   mkdir -p ~/.gcp
   mv ~/Downloads/app-alpha-vertex-*.json ~/.gcp/vertex-ai-key.json
   chmod 600 ~/.gcp/vertex-ai-key.json
   ```

2. **Update your `.env` file**
   ```bash
   # Add these to your .env file in the project root
   GCP_PROJECT_ID=your-project-id
   GCP_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=/Users/YOUR_USERNAME/.gcp/vertex-ai-key.json
   ```

   Replace:
   - `your-project-id` with your actual GCP project ID
   - `YOUR_USERNAME` with your Mac username

3. **Update `.gitignore`** (make sure credentials aren't committed)
   ```
   .env
   *.json
   !package.json
   !package-lock.json
   ```

---

## Step 5: Test Your Setup

1. **Start the backend server**
   ```bash
   npm run backend
   ```

   You should see:
   ```
   🚀 Vertex AI backend server running on http://localhost:3000
   ✅ Vertex AI service initialized successfully
   ```

2. **In another terminal, start the frontend**
   ```bash
   npm run dev
   ```

3. **Test the integration**
   - Open http://localhost:8080
   - Create an agent on Team Assembly
   - Go to Homepage and chat with the agent
   - You should see responses streaming from Vertex AI!

---

## Troubleshooting

### Error: "GCP_PROJECT_ID not configured"
- Check your `.env` file has `GCP_PROJECT_ID` set
- Restart the backend server after updating `.env`

### Error: "Could not load credentials"
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Check the JSON file exists and is readable
- Make sure path uses absolute path (starts with `/`)

### Error: "Permission denied" or "Vertex AI API not enabled"
- Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
- Make sure Vertex AI API is enabled for your project
- Check service account has "Vertex AI User" role

### Backend starts but frontend can't connect
- Make sure both servers are running
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- Check browser console for CORS errors

---

## Cost Monitoring

**Track your usage:**
1. Visit: https://console.cloud.google.com/billing
2. Click "Reports"
3. Monitor your free credit balance

**Vertex AI Pricing:**
- Gemini 1.5 Flash (what we're using): ~$0.075 per 1M input tokens
- Your $300 credit = ~4 billion tokens (plenty for learning!)

---

## Security Best Practices

✅ **DO:**
- Store credentials in `.env` and `.gitignore` them
- Use service accounts (not your personal account)
- Keep credentials outside project directory
- Enable billing alerts in GCP console

❌ **DON'T:**
- Commit `.env` or JSON keys to Git
- Share credentials publicly
- Use production credentials for development
- Leave unused resources running

---

## Next Steps

Now that Vertex AI is set up:
1. Explore different Gemini models in the backend
2. Adjust temperature and parameters
3. Monitor costs in GCP console
4. Learn about Vertex AI features: https://cloud.google.com/vertex-ai/docs

---

## Quick Reference

**Important URLs:**
- GCP Console: https://console.cloud.google.com/
- Vertex AI: https://console.cloud.google.com/vertex-ai
- Billing: https://console.cloud.google.com/billing
- Vertex AI Docs: https://cloud.google.com/vertex-ai/docs

**Commands:**
```bash
# Start backend
npm run backend

# Start frontend
npm run dev

# Check backend health
curl http://localhost:3000/health
```

**Environment Variables:**
```env
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```
