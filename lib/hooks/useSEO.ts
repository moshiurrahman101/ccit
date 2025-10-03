'use client';

import { useState, useEffect } from 'react';

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

interface UseSEOResult {
  seoData: SEOData | null;
  isLoading: boolean;
  error: string | null;
}

export function useSEO(pagePath?: string): UseSEOResult {
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSEOData = async () => {
      if (!pagePath) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics/pages?path=${encodeURIComponent(pagePath)}`);
        const data = await response.json();

        if (data.success && data.page) {
          setSeoData(data.page);
        } else {
          // No SEO data found, use defaults
          setSeoData(null);
        }
      } catch (err) {
        console.error('Error fetching SEO data:', err);
        setError('Failed to load SEO data');
        setSeoData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSEOData();
  }, [pagePath]);

  return { seoData, isLoading, error };
}
