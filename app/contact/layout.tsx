import { generateSEOMetadata } from "@/lib/seo-server";

export async function generateMetadata() {
  return await generateSEOMetadata({
    pagePath: '/contact',
    defaultTitle: 'যোগাযোগ - Creative Canvas IT',
    defaultDescription: 'Creative Canvas IT এর সাথে যোগাযোগ করুন। আমাদের কোর্স সম্পর্কে জানুন এবং আপনার প্রশ্নের উত্তর পান।',
    defaultImage: '/og-image.jpg',
    pageType: 'website'
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
