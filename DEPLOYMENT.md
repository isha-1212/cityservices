# Deployment Guide for CityServices App

## Environment Configuration

This app requires both frontend and backend deployment. The backend serves recommendations data on port 8000.

### Frontend Deployment

The frontend uses environment variables prefixed with `VITE_` for build-time configuration.

#### Key Environment Variables:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

#### Platform-Specific Configuration:

**Vercel/Netlify:**
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_SUPABASE_URL=https://iecothmegflxbpvndnru.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Same-Domain Deployment:**
If backend is served from `/api` path:
```bash
VITE_API_BASE_URL=/api
```

### Backend Deployment

The backend server runs on port 8000 and requires PostgreSQL database.

#### Required Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (defaults to 8000)

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