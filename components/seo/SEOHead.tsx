import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  structuredData?: any;
  noindex?: boolean;
  nofollow?: boolean;
}

export function SEOHead({
  title = "Creative Canvas IT — ফ্রিল্যান্সিং ও ক্যারিয়ার কোর্স",
  description = "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
  keywords = "আইটি কোর্স, ফ্রিল্যান্সিং, প্রোগ্রামিং, ওয়েব ডেভেলপমেন্ট, ডিজিটাল মার্কেটিং, গ্রাফিক ডিজাইন, বাংলাদেশ",
  canonicalUrl,
  ogImage = "/og-image.jpg",
  ogImageAlt = "Creative Canvas IT - শিখুন, তৈরি করুন, সফল হন",
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterSite = "@creativecanvasit",
  twitterCreator = "@creativecanvasit",
  structuredData,
  noindex = false,
  nofollow = false
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creativecanvasit.com';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent} />
      <meta name="author" content="Creative Canvas IT" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="bn" />
      <meta name="language" content="Bengali" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content="Creative Canvas IT" />
      <meta property="og:locale" content="bn_BD" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Creative Canvas IT" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icon.png" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}

      {/* Default Structured Data for Organization */}
      {!structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Creative Canvas IT",
              "description": "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
              "url": baseUrl,
              "logo": `${baseUrl}/logo.png`,
              "image": fullOgImage,
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
            })
          }}
        />
      )}
    </Head>
  );
}
