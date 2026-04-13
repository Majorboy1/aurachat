# AuraChat Deployment Guide

## Frontend Deployment (Vercel)

1. Go to https://vercel.com/new
2. Import the `Majorboy1/aurachat` GitHub repository
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Add Environment Variables:
   - `NEXT_PUBLIC_SOCKET_URL`: Set to your backend URL (e.g., `https://aurachat-server.onrender.com`)
5. Deploy!
6. Your app will be available at `https://aurachat.vercel.app`

## Backend Deployment (Render.com)

### Option A: Using render.yaml (Recommended)

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New" → "Blueprint"
4. Select the `Majorboy1/aurachat` repository
5. Render will auto-detect the `render.yaml` configuration
6. Add required environment variables when prompted:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `REDIS_URL`: Your Upstash Redis URL (free Redis: https://upstash.com)
7. Deploy!
8. Your backend will be at `https://aurachat-server.onrender.com`

### Option B: Manual Setup on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `aurachat-server`
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Auto-deploy:** Enable
5. Add Environment Variables:
   - `PORT`: `4000`
   - `CLIENT_ORIGIN`: `https://aurachat.vercel.app`
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `REDIS_URL`: Your Upstash Redis URL
6. Deploy!

## Redis Setup (Required)

1. Go to https://upstash.com
2. Sign up for a free tier account
3. Create a new Redis database
4. Copy the connection URL
5. Add it as `REDIS_URL` in your Render environment variables

## Final Steps

1. Update Vercel environment variable:
   - Go to Vercel Project Settings → Environment Variables
   - Set `NEXT_PUBLIC_SOCKET_URL` to your deployed Render backend URL
   - Redeploy Vercel to apply the change

2. Test your deployment:
   - Visit https://aurachat.vercel.app
   - Create or join a room
   - Test real-time chat functionality

3. Monitor your deployment:
   - Vercel Logs: https://vercel.com/dashboard → Select project → Deployments
   - Render Logs: https://render.com/dashboard → Select service → Logs
