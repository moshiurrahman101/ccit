# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

## Required Variables

### Database Configuration
```
MONGODB_URI=mongodb://localhost:27017/creative-canvas-it
```

### JWT Authentication
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

### Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ccit_uploads
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**⚠️ Important for Production/Vercel Deployment:**
When deploying to Vercel or any production environment, you MUST update `NEXT_PUBLIC_APP_URL` to your actual domain:
- Vercel: `https://your-app.vercel.app`
- Custom Domain: `https://yourdomain.com`

This is critical for:
- Password reset email links
- Welcome email links
- Blog canonical URLs

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Optional Variables (for future features)

### Email Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Payment Gateway Configuration (Bkash)
```
BKASH_APP_KEY=your-bkash-app-key
BKASH_APP_SECRET=your-bkash-app-secret
BKASH_USERNAME=your-bkash-username
BKASH_PASSWORD=your-bkash-password
BKASH_SANDBOX=true
```

### Payment Gateway Configuration (Nagad)
```
NAGAD_MERCHANT_ID=your-nagad-merchant-id
NAGAD_MERCHANT_PRIVATE_KEY=your-nagad-private-key
NAGAD_SANDBOX=true
```

## Setup Instructions

1. Copy the above content to a new file named `.env.local` in your project root
2. Replace the placeholder values with your actual credentials:

### MongoDB Setup
- **MONGODB_URI**: Your MongoDB connection string
  - Local: `mongodb://localhost:27017/creative-canvas-it`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/creative-canvas-it`

### Cloudinary Setup
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Create a new account or login
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### JWT Secrets
- Generate strong random strings for JWT_SECRET and NEXTAUTH_SECRET
- You can use: `openssl rand -base64 32` or any random string generator

### Payment Gateway (Optional)
- **Bkash**: Get credentials from Bkash Developer Portal
- **Nagad**: Get credentials from Nagad Developer Portal

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Keep your API keys secure and rotate them regularly
- Use environment-specific values for different deployments
