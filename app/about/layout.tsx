import { generateSEOMetadata } from "@/lib/seo-server";

export async function generateMetadata() {
  return await generateSEOMetadata({
    pagePath: '/about',
    defaultTitle: 'আমাদের সম্পর্কে - Creative Canvas IT',
    defaultDescription: 'Creative Canvas IT প্রতিষ্ঠিত হয় ২০২৩ সালে, একটি স্বপ্ন নিয়ে—বাংলাদেশের তরুণ প্রজন্মকে ডিজিটাল দক্ষতায় এগিয়ে নিয়ে যাওয়া।',
    defaultImage: '/og-image.jpg',
    pageType: 'website'
  });
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
