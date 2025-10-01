# Vercel Deployment Guide

## Environment Variables Setup for Vercel

When deploying to Vercel, you need to set up environment variables to ensure the application works correctly, especially for features like password reset emails that require the correct domain URL.

### Critical Environment Variables

#### 1. Application URL (Required for Email Links)
```
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```
**Important:** 
- For your current Vercel deployment, use: `https://your-vercel-app.vercel.app`
- When you add your custom domain later, update it to: `https://yourdomain.com`
- This variable is used in:
  - Password reset email links
  - Welcome email dashboard links
  - Blog canonical URLs

#### 2. Database Connection
```
MONGODB_URI=your_production_mongodb_connection_string
```

#### 3. JWT Authentication
```
JWT_SECRET=your_production_jwt_secret
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

#### 4. Email Configuration (Required for Password Reset)
```
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
```

#### 5. Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ccit_uploads
```

#### 6. Node Environment
```
NODE_ENV=production
```

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to your project in Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Select your project

2. **Navigate to Environment Variables**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the sidebar

3. **Add Variables**
   - For each environment variable:
     - Enter the **Key** (e.g., `NEXT_PUBLIC_APP_URL`)
     - Enter the **Value** (e.g., `https://your-app.vercel.app`)
     - Select environments: `Production`, `Preview`, `Development`
     - Click "Save"

4. **Redeploy**
   - After adding all variables, redeploy your application
   - Go to "Deployments" tab
   - Click the three dots menu on the latest deployment
   - Select "Redeploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_APP_URL production
# Enter value when prompted: https://your-app.vercel.app

# Repeat for each variable
vercel env add MONGODB_URI production
vercel env add EMAIL_USER production
# ... etc

# Redeploy
vercel --prod
```

### Method 3: Using .env File with Vercel CLI

```bash
# Create a production env file (don't commit this!)
# .env.production.local

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
MONGODB_URI=your_mongodb_uri
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
# ... all other variables

# Pull and push env variables
vercel env pull .env.local
vercel env add < .env.production.local
```

## Updating Domain When Adding Custom Domain

When you add your custom domain to Vercel:

1. **Add Custom Domain in Vercel**
   - Go to "Settings" > "Domains"
   - Add your domain (e.g., `yourdomain.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Go to "Settings" > "Environment Variables"
   - Find `NEXT_PUBLIC_APP_URL`
   - Update value to: `https://yourdomain.com`
   - Find `NEXTAUTH_URL`
   - Update value to: `https://yourdomain.com`

3. **Redeploy**
   - Trigger a new deployment for changes to take effect

## Testing Password Reset After Deployment

1. **Test the forgot password flow:**
   - Go to `https://your-app.vercel.app/forgot-password`
   - Enter your email
   - Check your email inbox

2. **Verify the reset link:**
   - The email should contain a link like:
   - `https://your-app.vercel.app/reset-password?token=...`
   - NOT `http://localhost:3000/reset-password?token=...`

3. **Click the link and reset password:**
   - Should redirect to your Vercel domain
   - Should work properly

## Common Issues and Solutions

### Issue: Email links still showing localhost
**Solution:** 
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
- Redeploy the application after setting the variable
- Clear your browser cache

### Issue: NEXT_PUBLIC_APP_URL not working
**Solution:**
- Environment variables starting with `NEXT_PUBLIC_` are built into the client bundle
- You MUST redeploy after changing them
- They are replaced at build time, not runtime

### Issue: Different URLs for preview and production
**Solution:**
- Set different values for Preview and Production environments
- Production: `https://yourdomain.com`
- Preview: `https://your-app-git-branch.vercel.app`

## Quick Setup Checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
- [ ] Set `MONGODB_URI` to production database
- [ ] Set `EMAIL_USER` and `EMAIL_APP_PASSWORD`
- [ ] Set `JWT_SECRET` and `NEXTAUTH_SECRET` (use strong random values)
- [ ] Set `NEXTAUTH_URL` to your Vercel URL
- [ ] Set Cloudinary credentials
- [ ] Set `NODE_ENV=production`
- [ ] Redeploy the application
- [ ] Test password reset flow
- [ ] Verify email links use correct domain

## Security Notes

- ⚠️ Never commit production environment variables to Git
- ⚠️ Use different secrets for development and production
- ⚠️ Rotate secrets regularly
- ⚠️ Use strong random values for JWT secrets (32+ characters)
- ⚠️ Keep your MongoDB connection string secure

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs: Project > Deployments > Click deployment > View Function Logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure you've redeployed after setting variables

---

**Last Updated:** October 2025

