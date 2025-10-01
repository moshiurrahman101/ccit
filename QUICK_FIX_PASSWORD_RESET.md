# Quick Fix: Password Reset Email Links

## The Problem
Password reset emails are sending links with `localhost:3000` instead of your Vercel domain.

## The Solution (5 Minutes)

### Step 1: Get Your Vercel URL
Your Vercel URL looks like: `https://your-project-name.vercel.app`

You can find it in:
- Vercel Dashboard > Your Project > Domains section
- Or in the deployment success message

### Step 2: Set Environment Variable in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add new variable:
   - **Key:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://your-project-name.vercel.app` (replace with your actual URL)
   - **Environments:** Check all (Production, Preview, Development)
6. Click **Save**

### Step 3: Redeploy

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Option B: Via Git**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Step 4: Test

1. Go to `https://your-project-name.vercel.app/forgot-password`
2. Enter an email address
3. Check your email
4. Verify the reset link now shows your Vercel URL (not localhost)

## When You Add Your Custom Domain

Later, when you add your custom domain (e.g., `yourdomain.com`):

1. Add domain in Vercel: **Settings** > **Domains** > **Add**
2. Configure DNS as instructed
3. Update environment variable:
   - Go to **Settings** > **Environment Variables**
   - Edit `NEXT_PUBLIC_APP_URL`
   - Change to: `https://yourdomain.com`
4. Also update `NEXTAUTH_URL` to: `https://yourdomain.com`
5. Redeploy

## Why This Happens

The code uses `process.env.NEXT_PUBLIC_APP_URL` for email links:

```typescript
// app/api/auth/forgot-password/route.ts (line 43)
const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken.token}`;
```

If `NEXT_PUBLIC_APP_URL` is not set, it defaults to `localhost:3000`.

## Other Variables You Should Set

While you're in Environment Variables, also set:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
NEXTAUTH_SECRET=your_secure_random_string
NEXTAUTH_URL=https://your-project-name.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
NODE_ENV=production
```

**For complete setup, see:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

## Need Help?

If it still doesn't work:
1. Check Vercel logs: Project > Deployments > Click deployment > **Function Logs**
2. Verify the variable is set: Settings > Environment Variables
3. Make sure you redeployed after setting the variable
4. Clear your browser cache

---

**Quick Reference Complete** ✓

