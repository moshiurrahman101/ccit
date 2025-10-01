# Open Graph Image Setup Guide

## Problem Fixed
আমরা batches, mentor profiles, blogs, এবং home page এর জন্য proper Open Graph (OG) images সেটআপ করেছি যাতে social media তে share করলে সুন্দর preview দেখায়।

## What's Been Done

### 1. Root Layout Updated (app/layout.tsx)
- Added default OG image: `/og-image.jpg`
- Added Twitter card metadata
- Image dimensions: 1200x630 (recommended for social media)

### 2. Blog Pages ✓ (Already Working)
- Blog pages already have proper metadata with OG images
- Uses `featuredImage` or `seo.ogImage` from blog data
- Falls back to `/default-og-image.jpg`

### 3. Batch Pages (Needs Metadata Structure)
Since batch pages are client-side rendered, they need restructuring for proper SEO.

**Current Issue:** Client components can't use `generateMetadata()` function.

### 4. Mentor Pages (Same as Batches)
Same issue as batch pages - client-side rendered.

## Required Actions

### Step 1: Create OG Images

আপনাকে নিম্নলিখিত images create করতে হবে এবং `/public` folder এ রাখতে হবে:

#### 1. **Default/Home Page OG Image** (`/public/og-image.jpg`)
- **Dimensions:** 1200 x 630 pixels
- **Content:** 
  - Creative Canvas IT logo
  - Tagline: "শিখুন, তৈরি করুন, সফল হন"
  - Background: Brand colors (#110A4F, #070048)
  - Text: Bengali + English
- **Design Tips:**
  - Keep important content in center (safe zone)
  - Use high contrast colors
  - Make text large and readable

#### 2. **Fallback OG Image** (`/public/default-og-image.jpg`)
- Similar to og-image.jpg but more generic
- Can be used when specific images aren't available

#### 3. **Optional: Course/Batch Placeholder** (`/public/batch-placeholder.jpg`)
- Use for batches that don't have cover photos
- Include "Creative Canvas IT" branding
- Educational/learning theme

### Step 2: Update Cloudinary Images

For batches and mentors, ensure uploaded images are optimized:

```javascript
// Cloudinary transformation for OG images
const ogImageUrl = batch.coverPhoto
  ? `${batch.coverPhoto}?w=1200&h=630&c=fill&q=auto&f=auto`
  : '/og-image.jpg';
```

### Step 3: Fix Client-Side Pages

You have two options:

#### Option A: Keep Client Pages, Accept Limitations
- Client pages won't have dynamic metadata
- Use default OG image for all batch/mentor pages
- Simplest but less optimal for SEO

#### Option B: Convert to Server Components (Recommended)
Convert batch and mentor detail pages to server components with client components for interactive parts.

**Example Structure:**
```typescript
// app/batches/[slug]/page.tsx
import { Metadata } from 'next';
import BatchDetailClient from './BatchDetailClient'; // Your current component

export async function generateMetadata({ params }): Promise<Metadata> {
  const batch = await fetchBatch(params.slug);
  return {
    title: `${batch.name} | Creative Canvas IT`,
    openGraph: {
      images: [batch.coverPhoto || '/og-image.jpg'],
    },
  };
}

export default async function BatchPage({ params }) {
  const batch = await fetchBatch(params.slug);
  return <BatchDetailClient initialBatch={batch} />;
}
```

## Creating OG Images

### Using Canva (Recommended for Non-Designers)

1. **Create New Design**
   - Custom dimensions: 1200 x 630 px
   - Template: Social Media → Facebook Post

2. **Design Elements**
   - Background: Gradient (Blue #110A4F to Purple)
   - Logo: Place in top-left or center
   - Text: 
     - Heading: "Creative Canvas IT"
     - Subheading: "শিখুন, তৈরি করুন, সফল হন"
     - Font: Bold, readable (Poppins, Inter, or Noto Sans Bengali)

3. **Export**
   - Format: JPG (smaller file size)
   - Quality: High
   - Name: `og-image.jpg`

### Using Figma (For Designers)

1. Create frame: 1200 x 630
2. Design with brand guidelines
3. Export as JPG (80-90% quality)
4. Optimize with TinyPNG or ImageOptim

### Using Online Tools

- **Bannerbear:** Generate dynamic OG images
- **Vercel OG Image:** Create images with code
- **OG Image.xyz:** Online generator

## Dynamic OG Image Generation (Optional Advanced Feature)

For dynamic OG images (recommended for scaling):

```typescript
// app/api/og/route.tsx
import { ImageResponse } from '@vercel/og';
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #110A4F 0%, #070048 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{ color: 'white', fontSize: 60 }}>{title}</h1>
        <p style={{ color: '#D8D8D8', fontSize: 30 }}>Creative Canvas IT</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
```

Then use: `/api/og?title=${encodeURIComponent(batch.name)}`

## Testing OG Images

### 1. Facebook Debugger
- URL: https://developers.facebook.com/tools/debug/
- Paste your page URL
- Click "Scrape Again" to refresh

### 2. Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Paste URL
- Check preview

### 3. LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- Clear cache if needed

### 4. Local Testing
```bash
# Use Meta Tags checker
curl -I https://your-domain.com/batches/some-batch
```

## Checklist

- [ ] Create `og-image.jpg` (1200x630) for homepage
- [ ] Create `default-og-image.jpg` as fallback
- [ ] Add images to `/public` folder
- [ ] Test with Facebook Debugger
- [ ] Test with Twitter Card Validator
- [ ] (Optional) Convert batch pages to server components
- [ ] (Optional) Convert mentor pages to server components
- [ ] (Optional) Implement dynamic OG image generation

## Quick Fix for Now

If you need immediate solution:

1. Create ONE image: `og-image.jpg` (1200x630)
2. Put it in `/public` folder
3. This will be used for ALL pages
4. Later optimize per-page images

## Image Specifications

| Aspect | Specification |
|--------|--------------|
| Dimensions | 1200 x 630 pixels |
| Format | JPG (preferred) or PNG |
| File Size | < 300 KB (< 100 KB ideal) |
| Color Space | RGB |
| Safe Zone | Center 1200 x 600 area |
| Text Size | Minimum 40px for readability |

## Resources

- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Open Graph Protocol](https://ogp.me/)
- [Vercel OG Image](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)

## Questions?

Contact: creativecanvasit@gmail.com

---

**Status:** Setup completed for metadata structure. Images need to be created and added to `/public` folder.

