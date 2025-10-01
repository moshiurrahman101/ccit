import { Metadata } from 'next';

export async function generateBatchMetadata(slug: string): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/batches/slug/${slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return {
        title: 'Batch Not Found | Creative Canvas IT',
      };
    }

    const { batch } = await response.json();

    const title = `${batch.name} | Creative Canvas IT`;
    const description = batch.marketing?.metaDescription || batch.description || `Join ${batch.name} batch at Creative Canvas IT`;
    const image = batch.coverPhoto || '/og-image.jpg';
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/batches/${batch.marketing.slug}`;

    return {
      title,
      description,
      keywords: batch.marketing?.tags?.join(', ') || 'batch, course, training',
      openGraph: {
        title,
        description,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: batch.name,
          }
        ],
        type: 'website',
        url,
        siteName: 'Creative Canvas IT',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error('Error generating batch metadata:', error);
    return {
      title: 'Creative Canvas IT',
    };
  }
}

