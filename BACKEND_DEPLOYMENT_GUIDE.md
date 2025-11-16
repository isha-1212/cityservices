# Backend Deployment Quick Guide

## Problem
- **Local**: Frontend expects backend at `localhost:4000` but Flask runs on `8000`
- **Production**: Backend URL not configured (still showing placeholder)

## Solution

### 1. Local Development (FIXED ✅)
The frontend now correctly points to `http://localhost:8000`

**To run locally:**
```powershell
# Terminal 1: Start Python backend
cd "c:\Documents\isha's 5th august latest\cityservices\AI"
pip install -r requirements.txt
python server.py

# Terminal 2: Start frontend (from project root)
npm run dev
```

**Verify backend is running:**
Open browser to http://localhost:8000/ - should show: `{"status":"ok","message":"Flask server is running"}`

### 2. Production Deployment

#### Step A: Deploy Python Backend

**Option 1: Render.com (Recommended)**
1. Go to https://render.com
2. Create New → Web Service
3. Connect your GitHub repository
4. Configure:
   - **Name**: cityservices-ai-backend
   - **Root Directory**: `AI`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   SUPABASE_URL=https://iecothmegflxbpvndnru.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY290aG1lZ2ZseGJwdm5kbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzQ1ODUsImV4cCI6MjA3NDU1MDU4NX0.I4zmPYXfyqNA3ajhyAJlJ5yCLekNWo491BPUDOfcUeI
   PORT=8000
   ```

6. Deploy! You'll get a URL like: `https://cityservices-ai-backend.onrender.com`

**Option 2: Railway.app**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Add `AI` folder as service
5. Add same environment variables
6. Deploy! You'll get a URL like: `https://cityservices-ai-backend.up.railway.app`

**Option 3: Python-specific platforms**
- PythonAnywhere: https://www.pythonanywhere.com/
- Heroku: https://heroku.com/

#### Step B: Update Frontend Environment Variables

After deploying the backend, update `.env.production`:

```bash
# Replace this line:
VITE_API_BASE_URL=https://your-backend-domain.com

# With your actual backend URL, for example:
VITE_API_BASE_URL=https://cityservices-ai-backend.onrender.com
# or
VITE_API_BASE_URL=https://cityservices-ai-backend.up.railway.app
```

#### Step C: Rebuild and Redeploy Frontend

If you're using Vercel/Netlify:
1. Update the environment variable in your deployment platform dashboard:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   
2. Add: `VITE_API_BASE_URL` = `https://your-actual-backend-url.com`

3. Trigger a new deployment or redeploy

### 3. Testing

**Local:**
```bash
# Test backend is running
curl http://localhost:8000/

# Should return: {"status":"ok","message":"Flask server is running"}
```

**Production:**
```bash
# Test your deployed backend
curl https://your-backend-url.com/

# Should return: {"status":"ok","message":"Flask server is running"}
```

### 4. Troubleshooting

**CORS Errors in Production:**
- Flask server already has CORS enabled in `server.py`
- Ensure your backend URL is correct in `.env.production`

**Backend Won't Start:**
- Check all dependencies are installed (`pip install -r requirements.txt`)
- Verify Supabase credentials are correct
- Check deployment platform logs

**Frontend Still Shows Error:**
- Clear browser cache
- Rebuild frontend with new environment variables
- Check browser console for exact error URL being called
