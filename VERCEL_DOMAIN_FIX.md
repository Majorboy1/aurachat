# Fix Vercel Domain - Move from aurachat-beta.vercel.app to aurachat.vercel.app

## Problem
Your app is currently deployed to `aurachat-beta.vercel.app` instead of `aurachat.vercel.app`

## Solution

### Option 1: Rename Vercel Project (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your "aurachat-beta" project
3. Click **Settings** → **General**
4. Find **Project Name** and change it from `aurachat-beta` to `aurachat`
5. Vercel will automatically update the domain to `aurachat.vercel.app`
6. Wait 2-3 minutes for DNS propagation

### Option 2: Add Custom Domain
If you already have a domain or want to keep the project name as-is:
1. Go to Vercel Dashboard → Your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter `aurachat.vercel.app` or your custom domain
4. Follow the DNS configuration steps

## Verify It Works
After making changes:
1. Visit your new domain (e.g., `https://aurachat.vercel.app`)
2. Create a test room
3. Try joining and sending messages
4. Check that real-time updates work

## If DNS Takes Too Long
- Vercel domains (.vercel.app) don't require external DNS changes
- Maximum wait: 5 minutes
- Try hard-refreshing your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache if needed

## Troubleshooting
**Domain not updating?**
- Make sure you renamed the project correctly
- Check that you're logged into the right Vercel account
- Try in an incognito/private window

**Old domain still works?**
- Both domains may work temporarily during propagation
- This is normal and will resolve itself

---

✅ **Changes deployed and ready!**
Frontend auto-deployment is enabled, so your latest code is already live.
