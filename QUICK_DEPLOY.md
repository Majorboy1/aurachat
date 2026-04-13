# Quick Deployment (5-10 minutes)

## Step 1: Deploy Backend to Render (3 minutes)

1. Open: https://render.com/blueprints
2. Sign in with Gmail
3. Paste this URL in the search: `https://github.com/Majorboy1/aurachat`
4. Click the result, then "Apply" 
5. Fill in environment variables:
   - `OPENAI_API_KEY` = Your key from `server/.env` file (find it in your project)
   - `REDIS_URL` = See Step 2 below
   - `CLIENT_ORIGIN` = `https://aurachat.vercel.app`
6. Click "Create Blueprint"
7. Wait 2-3 minutes
8. **Copy your backend URL** (looks like `https://aurachat-backend.onrender.com`)

## Step 2: Get Redis URL from Upstash (1 minute)

1. Open: https://console.upstash.com
2. Sign in with Gmail
3. Click on your database
4. Go to "Connect" tab → "Redis CLI"
5. **Copy the full connection string** (starts with `redis://`)
6. Use this for `REDIS_URL` in Step 1

## Step 3: Deploy Frontend to Vercel (3 minutes)

1. Open: https://vercel.com/new
2. Sign in with Gmail
3. Find `Majorboy1/aurachat` and click import
4. Set this environment variable:
   - `NEXT_PUBLIC_SOCKET_URL` = Your Render URL from Step 1 (e.g., `https://aurachat-backend.onrender.com`)
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your app is live at `https://aurachat.vercel.app`

---

**That's it!** All done. Your app should be working.
