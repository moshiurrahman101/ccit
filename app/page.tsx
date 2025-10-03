import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Courses } from "@/components/home/Courses";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { Footer } from "@/components/home/Footer";
import { generateSEOMetadata } from "@/lib/seo-server";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata() {
  return await generateSEOMetadata({
    pagePath: '/',
    defaultTitle: 'Creative Canvas IT — ফ্রিল্যান্সিং ও ক্যারিয়ার কোর্স',
    defaultDescription: 'Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।',
    defaultImage: '/og-image.jpg',
    pageType: 'website'
  });
}

export default function Home() {
  return (
    <>
      <StructuredData pagePath="/" />
      <div className="min-h-screen">
        <Hero />
        <Features />
        <Courses />
        <Testimonials />
        <Newsletter />
      </div>
    </>
  );
}