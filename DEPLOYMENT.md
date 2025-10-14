# Deployment Guide for CityServices App

## Environment Configuration

This app requires both frontend and backend deployment. The backend serves recommendations data on port 8000.

### Frontend Deployment

The frontend uses environment variables prefixed with `VITE_` for build-time configuration.



#### Platform-Specific Configuration:





### Backend Deployment

The backend server runs on port 8000 and requires PostgreSQL database.



#### Deployment Commands:
```bash
# Build frontend
npm run build

# Start backend (from backend directory)
cd backend
npm start
```

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

**Auth Issues:**
- Verify Supabase configuration
- Check environment variables are loaded correctly
- Ensure JWT_SECRET matches between frontend and backend
