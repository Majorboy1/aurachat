# Deployment Checklist

## Prerequisites
- [ ] GitHub account
- [ ] Vercel account (sign up with GitHub)
- [ ] Render account (sign up with GitHub)
- [ ] OpenAI API key from https://platform.openai.com/account/api-keys

## Phase 1: Set Up Redis (Free Tier)
- [ ] Go to https://upstash.com
- [ ] Sign up with GitHub
- [ ] Create new Redis database (free tier)
- [ ] Copy connection string (starts with `redis://` or `rediss://`)
- [ ] Save as `REDIS_URL` for Render setup

## Phase 2: Deploy Backend to Render
- [ ] Go to https://render.com
- [ ] Sign in with GitHub
- [ ] Navigate to https://render.com/blueprints (or click New → Blueprint)
- [ ] Enter repository URL: `https://github.com/Majorboy1/aurachat`
- [ ] Render auto-detects `render.yaml` - click "Apply"
- [ ] Configure environment variables:
  - [ ] `OPENAI_API_KEY` = Your OpenAI API key
  - [ ] `REDIS_URL` = Your Upstash Redis URL
- [ ] Click "Create Blueprint"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Copy backend service URL (e.g., `https://aurachat-server.onrender.com`)
- [ ] Test health endpoint: Visit `{backend-url}/health` - should show `{"ok":true,"service":"AuraChat server"}`

## Phase 3: Deploy Frontend to Vercel
- [ ] Go to https://vercel.com/new
- [ ] Sign in with GitHub
- [ ] Find and import repository: `Majorboy1/aurachat`
- [ ] Configure project:
  - [ ] Framework: `Next.js` (auto-selected)
  - [ ] Root Directory: `client`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
- [ ] Add environment variable:
  - [ ] Key: `NEXT_PUBLIC_SOCKET_URL`
  - [ ] Value: Your Render backend URL (e.g., `https://aurachat-server.onrender.com`)
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Vercel will show deployment URL (should be `https://aurachat.vercel.app`)

## Phase 4: Enable Auto-Deployment (Optional)
- [ ] Both are already configured in GitHub Actions workflows
- [ ] Frontend will auto-deploy to Vercel on push to main
- [ ] Backend will auto-deploy to Render on push to main
- [ ] To enable this:
  1. Go to Vercel: Settings → Tokens → Create token → Copy
  2. Add to GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  3. Go to Render: Account → API Key → Copy
  4. Add to GitHub secrets: `RENDER_API_KEY`, `RENDER_BACKEND_SERVICE_ID`

## Phase 5: Verify Deployment
- [ ] Visit https://aurachat.vercel.app
- [ ] Create a new room (URL should show room ID)
- [ ] Test real-time chat
  - [ ] Send a message
  - [ ] Should appear immediately (no page refresh needed)
- [ ] Test other features:
  - [ ] Persona selector works
  - [ ] Model selector works
  - [ ] Message reactions work

## Troubleshooting

### Chat not working but app loads
1. Check browser console for errors (F12)
2. Check if `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
3. Verify Render backend is running: Visit `{backend-url}/health`
4. Check Render logs: Dashboard → Select service → Logs tab

### Backend errors
1. Check Render logs for error messages
2. Verify `OPENAI_API_KEY` is valid
3. Verify `REDIS_URL` is correct and Redis is running
4. Check `CLIENT_ORIGIN` matches your Vercel frontend URL

### Port/Connection issues
1. Render backend must accept connections on port from environment
2. Vercel frontend must use correct backend URL
3. CORS is configured to accept `CLIENT_ORIGIN` - verify it's set

## Post-Deployment

### Set Up Custom Domain (Optional)
- [ ] Go to Vercel: Project Settings → Domains
- [ ] Add domain: `aurachat.vercel.app` or custom domain
- [ ] Update DNS records if using custom domain

### Monitor Your App
- [ ] Vercel Logs: https://vercel.com/dashboard → Select project → Deployments
- [ ] Render Logs: https://render.com/dashboard → Select service → Logs
- [ ] Set up monitoring/alerts as needed

### Redeploy Process
To redeploy after making changes:
1. Push to `main` branch on GitHub
2. GitHub Actions automatically triggers tests
3. Once tests pass, auto-deploys to Vercel (frontend) and Render (backend)
4. Deployments complete in 2-3 minutes

## Emergency Rollback
If something breaks:
1. Go to Vercel/Render dashboard
2. Select "Deployments" tab
3. Click "Redeploy" on a previous working version

---

**Current Status:** ✅ All configuration files are ready
**Next Step:** Start with Phase 1 (Redis setup)
