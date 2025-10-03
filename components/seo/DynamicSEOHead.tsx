'use client';

import Head from 'next/head';
import { useSEO } from '@/lib/hooks/useSEO';
import { usePathname } from 'next/navigation';

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

interface DynamicSEOHeadProps {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
  pageType?: 'website' | 'article' | 'product';
}

export function DynamicSEOHead({
  defaultTitle = 'Creative Canvas IT - Learn Programming & Web Development',
  defaultDescription = 'Learn programming and web development with Creative Canvas IT. Expert-led courses in React, Node.js, Python, and more.',
  defaultImage = '/og-image.jpg',
  pageType = 'website'
}: DynamicSEOHeadProps) {
  const pathname = usePathname();
  const { seoData, isLoading } = useSEO(pathname);

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
  const canonicalUrl = seoData?.canonicalUrl || `https://creativecanvasit.com${pathname}`;
  const robots = seoData?.robots || 'index,follow';

  // Ensure absolute URL for OG image
  const absoluteOgImage = ogImage.startsWith('http') 
    ? ogImage 
    : `https://creativecanvasit.com${ogImage}`;

  const absoluteTwitterImage = twitterImage.startsWith('http')
    ? twitterImage
    : `https://creativecanvasit.com${twitterImage}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={pageType} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Creative Canvas IT" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={absoluteTwitterImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {/* Additional Meta Tags */}
      <meta name="author" content="Creative Canvas IT Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Structured Data */}
      {seoData?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: seoData.structuredData
          }}
        />
      )}

      {/* Custom Head Tags */}
      {seoData?.customHeadTags && (
        <div
          dangerouslySetInnerHTML={{
            __html: seoData.customHeadTags
          }}
        />
      )}

      {/* Fallback Structured Data for Homepage */}
      {pathname === '/' && !seoData?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Creative Canvas IT",
              "description": description,
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
      )}
    </Head>
  );
}