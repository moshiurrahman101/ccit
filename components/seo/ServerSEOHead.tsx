import { Metadata } from 'next';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  robots: string;
  structuredData?: string;
  customHeadTags?: string;
}

interface ServerSEOHeadProps {
  pagePath: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
  pageType?: 'website' | 'article' | 'product';
}

async function getSEOData(pagePath: string): Promise<SEOData | null> {
  try {
    // For server-side rendering, we need to use the full URL or handle it differently
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // In production, we might need to handle this differently
    if (process.env.NODE_ENV === 'production') {
      // For production, we might want to skip the API call and use database directly
      // or use a different approach
      return null;
    }
    
    const response = await fetch(`${baseUrl}/api/analytics/pages?path=${encodeURIComponent(pagePath)}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.page : null;
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return null;
  }
}

export async function generateSEOMetadata({
  pagePath,
  defaultTitle = 'Creative Canvas IT - Learn Programming & Web Development',
  defaultDescription = 'Learn programming and web development with Creative Canvas IT. Expert-led courses in React, Node.js, Python, and more.',
  defaultImage = '/og-image.jpg',
  pageType = 'website'
}: ServerSEOHeadProps): Promise<Metadata> {
  const seoData = await getSEOData(pagePath);

  // Use SEO data if available, otherwise use defaults
  const title = seoData?.title || defaultTitle;
  const description = seoData?.description || defaultDescription;
  const keywords = seoData?.keywords || 'programming, web development, react, nodejs, python, online courses';
  const ogTitle = seoData?.ogTitle || title;
  const ogDescription = seoData?.ogDescription || description;
  const ogImage = seoData?.ogImage || defaultImage;
  const ogImageAlt = seoData?.ogImageAlt || title;
  const twitterTitle = seoData?.twitterTitle || ogTitle;
  const twitterDescription = seoData?.twitterDescription || ogDescription;
  const twitterImage = seoData?.twitterImage || ogImage;
  const canonicalUrl = seoData?.canonicalUrl || `https://creativecanvasit.com${pagePath}`;
  const robots = seoData?.robots || 'index,follow';

  // Ensure absolute URL for OG image
  const absoluteOgImage = ogImage.startsWith('http') 
    ? ogImage 
    : `https://creativecanvasit.com${ogImage}`;

  const absoluteTwitterImage = twitterImage.startsWith('http')
    ? twitterImage
    : `https://creativecanvasit.com${twitterImage}`;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.split(',').map(k => k.trim()),
    robots,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      type: pageType === 'product' ? 'website' : pageType,
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: 'Creative Canvas IT',
      images: [
        {
          url: absoluteOgImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        }
      ],
      locale: 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: [absoluteTwitterImage],
    },
    authors: [{ name: 'Creative Canvas IT Team' }],
    other: {
      'og:image:alt': ogImageAlt,
      'twitter:image:alt': ogImageAlt,
    }
  };

  return metadata;
}

// Structured Data Component
export async function StructuredData({ pagePath }: { pagePath: string }) {
  const seoData = await getSEOData(pagePath);
  
  if (seoData?.structuredData) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: seoData.structuredData
        }}
      />
    );
  }

  // Fallback structured data for homepage
  if (pagePath === '/') {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Creative Canvas IT",
            "description": "Learn programming and web development with Creative Canvas IT. Expert-led courses in React, Node.js, Python, and more.",
            "url": "https://creativecanvasit.com",
            "logo": "https://creativecanvasit.com/logo.png",
            "sameAs": [
              "https://facebook.com/creativecanvasit",
              "https://twitter.com/creativecanvasit",
              "https://linkedin.com/company/creativecanvasit"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+880-123-456-789",
              "contactType": "customer service",
              "areaServed": "BD",
              "availableLanguage": ["English", "Bengali"]
            }
          })
        }}
      />
    );
  }

  return null;
}

// Custom Head Tags Component
export async function CustomHeadTags({ pagePath }: { pagePath: string }) {
  const seoData = await getSEOData(pagePath);
  
  if (seoData?.customHeadTags) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: seoData.customHeadTags
        }}
      />
    );
  }

  return null;
}
