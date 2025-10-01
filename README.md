# Creative Canvas IT - Bangla EdTech Homepage

A stunning, professional Bangla EdTech homepage built with Next.js 15, TypeScript, and Tailwind CSS featuring glassmorphism design elements and smooth animations.

## 🎨 Design Features

- **Glassmorphism Design**: Modern glass-like effects with backdrop blur
- **Brand Colors**: Custom CCIT color scheme (#110A4F, #070048, #595488)
- **Mobile-First**: Fully responsive design optimized for all devices
- **Smooth Animations**: Floating elements, hover effects, and transitions
- **Bengali Typography**: Optimized for Bengali text with proper font fallbacks

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **Fonts**: Inter + Noto Sans Bengali (recommended)

## 📱 Sections

1. **Hero Section**: Mission statement with animated course carousel
2. **Feature Grid**: 9 benefit cards with glassmorphism effects
3. **Course Sections**: Upcoming live courses and popular courses
4. **Testimonials**: Success stories with stats and CTAs
5. **Blog Preview**: Latest blog posts with tags and excerpts
6. **Footer**: Comprehensive sitemap, contact info, and social links

## 🎯 Key Features

- **Auto-rotating Course Carousel**: Features 3 courses with smooth transitions
- **Interactive Elements**: Hover effects, button animations, and micro-interactions
- **Accessibility**: Semantic HTML, keyboard navigation, alt text for images
- **SEO Optimized**: Proper meta tags, structured data ready, Bengali language support
- **Performance**: Optimized images, lazy loading, and efficient animations

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ccit_uploads

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the homepage.

## 📝 Content Management

All text content is managed through `homepage.content.json`. This includes:

- Hero section text
- Navigation items
- Feature descriptions
- Course information
- Testimonials
- Blog posts
- Footer content

### Adding New Content

1. Edit `homepage.content.json`
2. Update corresponding components to use new content
3. For images, replace placeholder URLs with Cloudinary URLs

## 🎨 Customization

### Brand Colors

The color scheme is defined in `tailwind.config.ts`:

```typescript
colors: {
  ccit: {
    primary: '#110A4F',
    'accent-1': '#070048',
    'muted-1': '#595488',
    'neutral-1': '#D8D8D8',
    white: '#FFFFFF',
  }
}
```

### Animations

Custom animations are defined in Tailwind config:
- `float`: Floating elements
- `glow`: Glowing effects
- `slide-up`: Slide up entrance
- `fade-in`: Fade in entrance
- `pulse-slow`: Slow pulsing

### Glassmorphism Effects

Glassmorphism is achieved using:
- `backdrop-blur-md`: Blur background
- `bg-white/10`: Semi-transparent background
- `border-white/20`: Semi-transparent borders

## 📱 Mobile Responsiveness

The design is mobile-first with breakpoints:
- **Mobile**: 320px - 767px (single column)
- **Tablet**: 768px - 1023px (two columns)
- **Desktop**: 1024px+ (three columns)

## 🔧 Cloudinary Integration

For production, replace placeholder images with Cloudinary URLs:

1. Upload images to Cloudinary
2. Replace placeholder URLs in components
3. Use responsive image transformations

Example Cloudinary URL:
```
https://res.cloudinary.com/your-cloud/image/upload/w_auto,f_auto,q_auto/your-image
```

## 📊 SEO & Accessibility

- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- **Language**: `lang="bn"` for Bengali content
- **Meta Tags**: Optimized for Bengali SEO
- **Alt Text**: All images have descriptive alt text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

**⚠️ Important:** After deploying to Vercel, you MUST set the `NEXT_PUBLIC_APP_URL` environment variable to your Vercel URL to ensure password reset emails and other features work correctly.

**For detailed deployment instructions, see [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**

### Quick Deployment Checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your Vercel/production URL
- [ ] Set all required environment variables (see env-setup.md)
- [ ] Test password reset flow after deployment
- [ ] Update `NEXT_PUBLIC_APP_URL` when adding custom domain

### Other Platforms

The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

**Note:** Regardless of platform, ensure `NEXT_PUBLIC_APP_URL` is set to your production URL.

## 📄 License

This project is proprietary to Creative Canvas IT.

## 🤝 Contributing

For internal development team only. Please follow the established code style and create pull requests for any changes.

## 📞 Support

For technical support or questions:
- Email: creativecanvasit@gmail.com
- Phone: 01603718379, 01845202101

---

**Built with ❤️ by Creative Canvas IT Team**# ccit
