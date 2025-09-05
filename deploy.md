# Deployment Guide - SkillSync

This guide will help you deploy SkillSync to production using Netlify (frontend) and Render (backend).

## 🚀 Deployment Overview

- **Frontend**: Netlify (Static Site Hosting)
- **Backend**: Render (Web Service)
- **Database**: MongoDB Atlas (Cloud Database)
- **File Storage**: Cloudinary (Cloud File Storage)

## 📋 Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository**: Your code pushed to GitHub
2. **MongoDB Atlas Account**: For production database
3. **Cloudinary Account**: For file storage
4. **Netlify Account**: For frontend hosting
5. **Render Account**: For backend hosting
6. **Email Service**: Gmail or similar for password reset

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account

2. **Create a Cluster**
   - Choose the free tier (M0)
   - Select a region close to your users
   - Create cluster

3. **Set Up Database Access**
   - Go to "Database Access"
   - Add a new database user
   - Create a strong password
   - Give "Read and write to any database" permissions

4. **Set Up Network Access**
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allows access from anywhere)
   - Or add specific IP addresses for better security

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## ☁️ File Storage Setup (Cloudinary)

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get API Credentials**
   - Go to Dashboard
   - Copy the following values:
     - Cloud Name
     - API Key
     - API Secret

## 🔧 Backend Deployment (Render)

### Step 1: Connect Repository

1. **Sign up for Render**
   - Go to [Render](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

### Step 2: Configure Service

1. **Basic Settings**
   ```
   Name: skillsync-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main (or your default branch)
   Root Directory: backend
   ```

2. **Build & Deploy Settings**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**
   Add the following environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=https://your-netlify-app.netlify.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://skillsync-backend.onrender.com`)

### Step 3: Update Backend Package.json

Ensure your `backend/package.json` has the correct start script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 🎨 Frontend Deployment (Netlify)

### Step 1: Connect Repository

1. **Sign up for Netlify**
   - Go to [Netlify](https://netlify.com)
   - Sign up with your GitHub account

2. **Create New Site**
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository

### Step 2: Configure Build Settings

1. **Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

2. **Environment Variables**
   Add the following environment variables in Netlify dashboard:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_SERVER_URL=https://your-backend-url.onrender.com
   ```

3. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete
   - Note the site URL (e.g., `https://skillsync.netlify.app`)

### Step 3: Update Backend CORS

After getting your Netlify URL, update the `FRONTEND_URL` environment variable in Render with your actual Netlify URL.

## 🔄 Post-Deployment Steps

### 1. Update Environment Variables

After both deployments are complete:

1. **Update Render Environment Variables**
   - Go to your Render service dashboard
   - Update `FRONTEND_URL` with your actual Netlify URL
   - Redeploy the service

2. **Update Netlify Environment Variables**
   - Go to your Netlify site dashboard
   - Update `REACT_APP_API_URL` and `REACT_APP_SERVER_URL` with your actual Render URL
   - Trigger a new deploy

### 2. Test the Application

1. **Test Frontend**
   - Visit your Netlify URL
   - Try registering a new user
   - Test all major features

2. **Test Backend**
   - Visit `https://your-backend-url.onrender.com/api/health`
   - Should return a health check response

3. **Test File Uploads**
   - Try uploading a profile picture
   - Test portfolio file uploads

### 3. Set Up Custom Domain (Optional)

1. **Netlify Custom Domain**
   - Go to Site settings → Domain management
   - Add your custom domain
   - Configure DNS settings

2. **Render Custom Domain**
   - Go to your service settings
   - Add custom domain
   - Configure DNS settings

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in Render matches your Netlify URL exactly
   - Check for trailing slashes

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper CORS configuration

4. **Build Failures**
   - Check build logs in Netlify
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

### Debugging Tips

1. **Check Logs**
   - Render: Go to service dashboard → Logs
   - Netlify: Go to site dashboard → Deploys → View logs

2. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names

3. **Network Issues**
   - Test API endpoints directly
   - Check browser network tab for errors

## 📊 Monitoring & Maintenance

### Health Checks

1. **Backend Health Check**
   - Endpoint: `GET /api/health`
   - Monitor this endpoint for service availability

2. **Frontend Monitoring**
   - Monitor Netlify analytics
   - Check for build failures

### Regular Maintenance

1. **Database**
   - Monitor MongoDB Atlas usage
   - Set up alerts for storage limits

2. **File Storage**
   - Monitor Cloudinary usage
   - Clean up unused files periodically

3. **Security**
   - Regularly rotate JWT secrets
   - Monitor for security vulnerabilities
   - Keep dependencies updated

## 🚀 Scaling Considerations

### Free Tier Limits

1. **Render Free Tier**
   - 750 hours/month
   - Service sleeps after 15 minutes of inactivity
   - Consider upgrading for production use

2. **Netlify Free Tier**
   - 100GB bandwidth/month
   - 300 build minutes/month
   - Usually sufficient for small to medium apps

3. **MongoDB Atlas Free Tier**
   - 512MB storage
   - Shared clusters
   - Consider upgrading for production

### Performance Optimization

1. **Backend**
   - Implement caching
   - Optimize database queries
   - Use CDN for static assets

2. **Frontend**
   - Optimize bundle size
   - Implement lazy loading
   - Use service workers for caching

## 📞 Support

If you encounter issues:

1. **Check Documentation**
   - [Render Docs](https://render.com/docs)
   - [Netlify Docs](https://docs.netlify.com)
   - [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

2. **Community Support**
   - GitHub Issues
   - Stack Overflow
   - Discord/Slack communities

3. **Professional Support**
   - Consider paid support for production applications

---

**Congratulations!** 🎉 Your SkillSync application should now be live and accessible to users worldwide!
