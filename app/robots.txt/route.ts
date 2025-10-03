import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Allow OG image generation routes
Allow: /api/og/*

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://creativecanvasit.com'}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
