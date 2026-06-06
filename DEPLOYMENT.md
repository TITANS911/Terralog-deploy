# Deployment Guide

## Deploy Backend (Spring Boot) to Railway

1. Go to [Railway](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your Terralog repo
4. Click "Add a Service" → Select "MySQL" (this sets up your database)
5. Go back to your project, select your backend service
6. Set these environment variables (Railway will automatically set the MySQL ones if you linked the database):
   - `PORT`: `8080` (Railway will override this with their own port)
7. Deploy the backend!
8. Copy the deployed backend URL (looks like `https://your-backend.railway.app`)

## Deploy Frontend (React) to Vercel

1. Go to your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. Add a new environment variable:
   - Name: `REACT_APP_API_URL`
   - Value: Your deployed backend URL (e.g., `https://your-backend.railway.app`)
   - Make sure it's set for all environments (Production, Preview, Development)
4. Redeploy your frontend!

That's it!
