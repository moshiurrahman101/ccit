import { connectToDatabase } from '@/lib/mongodb-client';
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

export async function getSEODataFromDB(pagePath: string): Promise<SEOData | null> {
  try {
    const { db } = await connectToDatabase();
    const page = await db.collection('page_seo').findOne({ page: pagePath });
    return page as SEOData | null;
  } catch (error) {
    console.error('Error fetching SEO data from database:', error);
    return null;
  }
}

export async function generateSEOMetadata({
  pagePath,
  defaultTitle = 'Creative Canvas IT - Learn Programming & Web Development',
  defaultDescription = 'Learn programming and web development with Creative Canvas IT. Expert-led courses in React, Node.js, Python, and more.',
  defaultImage = '/og-image.jpg',
  pageType = 'website'
}: {
  pagePath: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
  pageType?: 'website' | 'article' | 'product';
}): Promise<Metadata> {
  const seoData = await getSEODataFromDB(pagePath);

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

  // Add custom head tags if available
  if (seoData?.customHeadTags) {
    (metadata as any).other = {
      ...metadata.other,
      'custom-head': seoData.customHeadTags
    };
  }

  return metadata;
}

// Helper function to get structured data as JSON string
export async function getStructuredData(pagePath: string): Promise<string | null> {
  const seoData = await getSEODataFromDB(pagePath);
  
  if (seoData?.structuredData) {
    return seoData.structuredData;
  }

  // Fallback structured data for homepage
  if (pagePath === '/') {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Creative Canvas IT",
      "description": "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
      "url": "https://creativecanvasit.com",
      "logo": "https://creativecanvasit.com/logo.png",
      "image": "https://creativecanvasit.com/og-image.jpg",
      "sameAs": [
        "https://www.facebook.com/creativecanvasit",
        "https://www.linkedin.com/company/creativecanvasit",
        "https://twitter.com/creativecanvasit"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BD",
        "addressLocality": "Dhaka"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+880-1234-567890",
        "contactType": "customer service",
        "availableLanguage": "Bengali"
      }
    });
  }

  return null;
}
