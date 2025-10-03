# Cloudinary Setup for SEO Image Uploads

This guide will help you set up Cloudinary for automatic OG image uploads in the SEO management system.

## 1. Create Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com) and create a free account
2. Verify your email address
3. Access your dashboard

## 2. Get Your Cloudinary Credentials

In your Cloudinary dashboard, you'll find:

- **Cloud Name**: Found in the dashboard overview
- **API Key**: Found in the dashboard overview  
- **API Secret**: Found in the dashboard overview (keep this secure!)

## 3. Create Upload Preset

1. Go to **Settings** → **Upload** in your Cloudinary dashboard
2. Click **Add upload preset**
3. Configure the preset:
   - **Preset name**: `ccit_seo_images`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `seo-images`
   - **Upload**: `Authenticated` (recommended for security)
4. Save the preset

## 4. Environment Variables

Add these variables to your `.env.local` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ccit_seo_images
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 5. Security Considerations

### Recommended Setup (More Secure)
For production, use **Signed** upload presets:

1. Create a signed upload preset in Cloudinary
2. Use server-side uploads via the API endpoint `/api/upload/cloudinary`
3. Keep API credentials secure on the server

### Current Setup (Development)
The current implementation uses:
- Unsigned upload preset for easy development
- Client-side uploads with API key exposure
- Suitable for development and testing

## 6. Image Optimization

The system automatically optimizes uploaded images for:
- **OG Images**: 1200×630 pixels (perfect for social media)
- **Thumbnails**: 300×300 pixels
- **Medium**: 600×600 pixels

## 7. File Restrictions

- **Supported formats**: JPG, PNG, GIF, WebP
- **Maximum file size**: 10MB
- **Automatic optimization**: Enabled
- **Storage folder**: `seo-images/`

## 8. Usage

Once configured, users can:

1. **Upload custom images** via the "Upload to Cloudinary" button
2. **Generate automatic images** using the "Auto Generate" button
3. **Enter manual URLs** for external images
4. **Preview images** before saving

## 9. Troubleshooting

### Common Issues:

1. **"Cloudinary not configured" error**
   - Check your environment variables
   - Ensure the upload preset exists

2. **Upload fails**
   - Verify file size is under 10MB
   - Check file format is supported
   - Ensure upload preset is unsigned

3. **Images not displaying**
   - Check CORS settings in Cloudinary
   - Verify the image URL is accessible

### Support:

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)

## 10. Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

This is sufficient for most small to medium websites.
