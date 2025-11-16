# CityServices - Complete Vercel Deployment Guide

## 🎯 Overview

This guide will help you deploy your CityServices app on Vercel with working recommendations.

## 📋 Architecture

- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: Python Flask AI service (deployed separately on Render/Railway)
- **API Proxy**: Vercel serverless function (`/api/*`) that proxies to Python backend

## 🚀 Deployment Steps

### Step 1: Deploy Python Backend to Render.com

1. **Go to [Render.com](https://render.com)** and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   ```
   Name: cityservices-ai-backend
   Root Directory: AI
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python server.py
   Plan: Free
   ```

5. **Add Environment Variables:**
   ```
   SUPABASE_URL=https://iecothmegflxbpvndnru.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY290aG1lZ2ZseGJwdm5kbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzQ1ODUsImV4cCI6MjA3NDU1MDU4NX0.I4zmPYXfyqNA3ajhyAJlJ5yCLekNWo491BPUDOfcUeI
   PORT=8000
   ```

6. Click **"Create Web Service"**
7. **Copy your backend URL** (e.g., `https://cityservices-ai-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel](https://vercel.com)** and import your repository
2. Configure build settings:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables in Vercel:**
   ```
   VITE_SUPABASE_URL=https://iecothmegflxbpvndnru.supabase.co
   
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY290aG1lZ2ZseGJwdm5kbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzQ1ODUsImV4cCI6MjA3NDU1MDU4NX0.I4zmPYXfyqNA3ajhyAJlJ5yCLekNWo491BPUDOfcUeI
   
   PYTHON_BACKEND_URL=https://cityservices-ai-backend.onrender.com
   ```
   
   **Important**: Replace the `PYTHON_BACKEND_URL` with your actual Render backend URL from Step 1!

4. Click **"Deploy"**

### Step 3: Verify Deployment

1. **Test the Vercel serverless API:**
   - Visit: `https://your-app.vercel.app/api/recommendations/test-user?n=3`
   - Should return recommendations (real or fallback data)

2. **Test the full app:**
   - Visit: `https://your-app.vercel.app`
   - Login and check the recommendations section
   - Should show personalized recommendations or fallback data

## 🔄 How It Works

```
User Browser → Vercel Frontend
                    ↓
            /api/* request
                    ↓
         Vercel Serverless Function
                    ↓
         Python Backend (Render)
                    ↓
              Supabase DB
```

### Fallback Strategy

The app has **automatic fallback** to sample data:

1. **First attempt**: Call Python backend through Vercel serverless function
2. **If backend unavailable**: Vercel function returns mock recommendations
3. **If Vercel function fails**: Frontend shows error with "Show Sample Data" button
4. **Sample data**: Always available as ultimate fallback

## 🛠️ Local Development

### Start Backend:
```powershell
.\start-backend.ps1
```

Or manually:
```powershell
cd AI
python server.py
```

### Start Frontend:
```powershell
npm run dev
```

The frontend will automatically connect to `http://localhost:8000` in development mode.

## 🔧 Troubleshooting

### Recommendations showing mock data in production

**Check:**
1. Is `PYTHON_BACKEND_URL` set correctly in Vercel environment variables?
2. Is your Render backend service running? (Check Render dashboard)
3. Test backend directly: `https://your-backend.onrender.com/`

### Render backend sleeping (Free tier)

Render free tier spins down after inactivity. First request may take 30-60 seconds.

**Solutions:**
- Upgrade to paid Render plan
- Use a service like UptimeRobot to ping your backend every 5 minutes
- Accept the cold start delay

### CORS errors

The app has CORS configured for all origins. If you see CORS errors:
1. Check Render backend logs
2. Verify `flask-cors` is installed: `pip list | grep flask-cors`

### Frontend shows "Unable to connect"

This means:
1. Vercel serverless function is working (✓)
2. But can't reach Python backend (✗)

**Fix**: Double-check `PYTHON_BACKEND_URL` in Vercel environment variables

## 📝 Environment Variables Reference

### Vercel (Frontend)
```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
PYTHON_BACKEND_URL=<your-render-backend-url>  # Optional but recommended
```

### Render (Backend)
```bash
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-key>
PORT=8000
```

## 🎉 Success Checklist

- [ ] Python backend deployed on Render
- [ ] Backend URL copied
- [ ] Vercel environment variables set (including `PYTHON_BACKEND_URL`)
- [ ] Frontend deployed on Vercel
- [ ] App loads and shows recommendations (real or fallback)
- [ ] No console errors related to CORS

## 🚨 Important Notes

1. **Without `PYTHON_BACKEND_URL`**: App will show sample/mock data (which is fine for demo)
2. **With `PYTHON_BACKEND_URL`**: App will show real personalized recommendations
3. **Fallback is automatic**: Even if backend fails, users see sample data
4. **Render free tier**: First request may be slow (cold start)

## 📚 Additional Resources

- [Render Python Deployment Guide](https://render.com/docs/deploy-flask)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
