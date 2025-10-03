'use client';

import { usePathname } from 'next/navigation';
import { useSEO } from '@/lib/hooks/useSEO';
import { useEffect } from 'react';

interface PageSEOProps {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
  pageType?: 'website' | 'article' | 'product';
}

export function PageSEO({
  defaultTitle = 'Creative Canvas IT - Learn Programming & Web Development',
  defaultDescription = 'Learn programming and web development with Creative Canvas IT. Expert-led courses in React, Node.js, Python, and more.',
  defaultImage = '/og-image.jpg',
  pageType = 'website'
}: PageSEOProps) {
  const pathname = usePathname();
  const { seoData, isLoading } = useSEO(pathname);

  useEffect(() => {
    if (isLoading || !seoData) return;

    // Update document title
    document.title = seoData.title || defaultTitle;

    // Update meta tags dynamically
    updateMetaTag('description', seoData.description || defaultDescription);
    updateMetaTag('keywords', seoData.keywords || 'programming, web development, react, nodejs, python, online courses');
    updateMetaTag('robots', seoData.robots || 'index,follow');
    
    // Update Open Graph tags
    updateMetaTag('og:title', seoData.ogTitle || defaultTitle, 'property');
    updateMetaTag('og:description', seoData.ogDescription || defaultDescription, 'property');
    updateMetaTag('og:image', getAbsoluteUrl(seoData.ogImage || defaultImage), 'property');
    updateMetaTag('og:image:alt', seoData.ogImageAlt || defaultTitle, 'property');
    updateMetaTag('og:type', pageType, 'property');
    updateMetaTag('og:url', getAbsoluteUrl(seoData.canonicalUrl || pathname), 'property');
    
    // Update Twitter tags
    updateMetaTag('twitter:title', seoData.twitterTitle || seoData.ogTitle || defaultTitle);
    updateMetaTag('twitter:description', seoData.twitterDescription || seoData.ogDescription || defaultDescription);
    updateMetaTag('twitter:image', getAbsoluteUrl(seoData.twitterImage || seoData.ogImage || defaultImage));
    updateMetaTag('twitter:card', 'summary_large_image');
    
    // Update canonical URL
    updateLinkTag('canonical', getAbsoluteUrl(seoData.canonicalUrl || pathname));

    // Add structured data if available
    if (seoData.structuredData) {
      addStructuredData(seoData.structuredData);
    }

  }, [seoData, isLoading, pathname, defaultTitle, defaultDescription, defaultImage, pageType]);

  return null; // This component doesn't render anything
}

function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function getAbsoluteUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `https://creativecanvasit.com${url}`;
}

function addStructuredData(structuredData: string) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = structuredData;
  document.head.appendChild(script);
}
