# CORS Error Fix Guide

## Problem
After hosting your project, the project section is not loading and showing CORS errors in the console.

## Root Causes Fixed

1. **Hardcoded localhost URLs**: Several files had hardcoded `http://localhost:5000` URLs that don't work in production
2. **CORS Configuration**: Backend CORS was only allowing specific hardcoded origins
3. **Missing Environment Variables**: Frontend needs to know the backend URL in production

## Changes Made

### 1. Backend CORS Configuration (`backend/server.js`)
- Updated CORS to dynamically read `FRONTEND_URL` from environment variables
- Added better error logging for blocked origins
- Made it easier to configure for different hosting platforms

### 2. Frontend API Calls
Fixed hardcoded localhost URLs in:
- `frontend/src/components/auth/ResetPassword.js`
- `frontend/src/components/auth/ForgotPassword.js`
- `frontend/src/components/profile/Collaborations.js`
- `frontend/src/pages/Profile.js`

All now use relative URLs that work with the axios baseURL configuration.

### 3. Environment Variables
Updated documentation in:
- `frontend/env.example`
- `backend/env.example`

## Required Environment Variables

### Backend (Render/Your Hosting)
Set these in your backend hosting platform:

```env
FRONTEND_URL=https://your-frontend-url.netlify.app
# or your actual frontend URL
```

### Frontend (Netlify/Your Hosting)
Set these in your frontend hosting platform:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_SERVER_URL=https://your-backend-url.onrender.com
```

**IMPORTANT**: Replace with your actual URLs!

## Deployment Steps

1. **Deploy Backend First**
   - Set `FRONTEND_URL` to your frontend URL (even if not deployed yet)
   - Note your backend URL

2. **Deploy Frontend**
   - Set `REACT_APP_API_URL` to your backend URL
   - Set `REACT_APP_SERVER_URL` to your backend URL
   - Build and deploy

3. **Update Backend CORS (if needed)**
   - If your frontend URL changed, update `FRONTEND_URL` in backend
   - Redeploy backend

4. **Verify**
   - Check browser console for CORS errors
   - Test API calls (e.g., loading projects)
   - Check network tab to see if requests are going to the correct backend URL

## Testing

1. Open browser console (F12)
2. Go to Network tab
3. Try loading the projects page
4. Check if requests are going to:
   - ❌ `http://localhost:5000` (wrong - will cause CORS)
   - ✅ `https://your-backend-url.onrender.com` (correct)

## Common Issues

### Still seeing CORS errors?
1. **Check environment variables are set correctly**
   - Frontend: `REACT_APP_API_URL` must match your backend URL
   - Backend: `FRONTEND_URL` must match your frontend URL exactly

2. **Check for trailing slashes**
   - `https://your-app.netlify.app` ✅
   - `https://your-app.netlify.app/` ❌ (might cause issues)

3. **Rebuild frontend after setting env vars**
   - Environment variables are baked into the build
   - You must rebuild after changing them

4. **Check browser console**
   - Look for the exact CORS error message
   - It will tell you which origin is being blocked

### Projects still not loading?
1. Check if backend is running and accessible
2. Visit `https://your-backend-url.onrender.com/api/health`
3. Should return: `{"status":"OK","message":"SkillSync API is running",...}`

4. Check network tab in browser
   - Are requests being made?
   - What's the response status?
   - What's the error message?

## Need Help?

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Check the Network tab to see the actual request URLs
3. Verify all environment variables are set correctly
4. Make sure both frontend and backend are redeployed after changing env vars

