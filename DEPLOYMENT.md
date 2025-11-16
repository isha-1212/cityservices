# Deployment Guide for CityServices App

## Environment Configuration

This app requires both frontend and backend deployment:
- **Frontend**: React + Vite application
- **Backend (AI/Recommendations)**: Python Flask server running on port 8000

### Frontend Deployment

The frontend uses environment variables prefixed with `VITE_` for build-time configuration.



#### Platform-Specific Configuration:


<<<<<<< HEAD


=======
**Example with deployed backend:**
```bash
VITE_API_BASE_URL=https://your-app.onrender.com
# or
VITE_API_BASE_URL=https://your-app.up.railway.app
```

**Same-Domain Deployment:**
If backend is served from `/api` path:
```bash
VITE_API_BASE_URL=/api
```
>>>>>>> 1363ac7e340820ea08840696b6947f21036cd610

### Backend Deployment (Python Flask AI Service)

The recommendation backend is a Python Flask server (`AI/server.py`) running on port 8000.

<<<<<<< HEAD

=======
#### Required Environment Variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service key or anon key
- `PORT`: Server port (defaults to 8000)
>>>>>>> 1363ac7e340820ea08840696b6947f21036cd610

#### Required Python Packages:
```bash
pip install flask flask-cors pandas supabase
```

#### Deployment Commands:
```bash
# Build frontend
npm run build

# Start Python AI backend
cd AI
python server.py
```

#### Backend Deployment Options:
1. **Render.com** (Recommended for Python):
   - Service: Web Service
   - Build Command: `cd AI && pip install -r requirements.txt`
   - Start Command: `cd AI && python server.py`
   - Add environment variables in Render dashboard

2. **Railway.app**:
   - Deploy from GitHub
   - Set root directory to `AI`
   - Add environment variables

3. **PythonAnywhere** or **Heroku**:
   - Follow platform-specific Python deployment guides

## Common Deployment Issues

### 1. CORS Configuration
If frontend and backend are on different domains, ensure CORS is configured in the backend server.

### 2. Environment Variables
- Development: Uses `.env` file with `VITE_API_BASE_URL=http://localhost:8000`
- Production: Uses `.env.production` or platform environment variables

### 3. Build Process
The frontend build process includes the environment variables at build time. Ensure production environment variables are set during build.

## Quick Deploy Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview

# Backend (separate terminal)
cd backend
npm install
npm start
```

## Troubleshooting

**Connection Refused Error:**
- Ensure backend is running and accessible
- Check `VITE_API_BASE_URL` points to correct backend URL
- Verify network connectivity between frontend and backend

**Mobile-Specific Issues:**
- **Recommendations not showing on mobile**: 
  - Check if backend URL is accessible from mobile network
  - Ensure HTTPS is used for production (mobile browsers require secure connections)
  - Test with "Show Sample Data" button if network fails
  - Check mobile browser developer tools for CORS errors
- **Slower loading on mobile**:
  - App includes longer timeout for mobile devices (15s vs 10s)
  - Fallback to mock data when network fails
  - Consider implementing offline support

**Network Issues:**
- App automatically detects mobile devices and provides fallbacks
- Mock data available when backend is unreachable
- Retry mechanism with mobile-friendly UI
- Different timeout settings for desktop vs mobile

**Auth Issues:**
- Verify Supabase configuration
- Check environment variables are loaded correctly
- Ensure JWT_SECRET matches between frontend and backend
<<<<<<< HEAD
=======

**CORS Issues (Mobile Browsers):**
- Ensure backend CORS configuration allows mobile origins
- Check if backend accepts requests from your deployment domain
- Mobile browsers may have stricter CORS policies
>>>>>>> 1363ac7e340820ea08840696b6947f21036cd610
