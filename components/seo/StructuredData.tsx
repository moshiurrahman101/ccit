import { getStructuredData } from '@/lib/seo-server';

interface StructuredDataProps {
  pagePath: string;
}

export async function StructuredData({ pagePath }: StructuredDataProps) {
  const structuredDataString = await getStructuredData(pagePath);
  
  if (!structuredDataString) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: structuredDataString
      }}
    />
  );
}
