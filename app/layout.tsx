import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Analytics } from "@/components/analytics/Analytics";
import { SEOHead } from "@/components/seo/SEOHead";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

// Bengali fonts for professional look
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Helper to ensure URL has protocol
const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Creative Canvas IT — ফ্রিল্যান্সিং ও ক্যারিয়ার কোর্স",
  description: "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
  keywords: "আইটি কোর্স, ফ্রিল্যান্সিং, প্রোগ্রামিং, ওয়েব ডেভেলপমেন্ট, ডিজিটাল মার্কেটিং, গ্রাফিক ডিজাইন, বাংলাদেশ",
  authors: [{ name: "Creative Canvas IT" }],
  openGraph: {
    title: "Creative Canvas IT — ফ্রিল্যান্সিং ও ক্যারিয়ার কোর্স",
    description: "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
    type: "website",
    locale: "bn_BD",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Creative Canvas IT - শিখুন, তৈরি করুন, সফল হন',
      }
    ],
    siteName: 'Creative Canvas IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Creative Canvas IT — ফ্রিল্যান্সিং ও ক্যারিয়ার কোর্স",
    description: "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
    images: ['/og-image.jpg'],
    site: '@creativecanvasit',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" dir="ltr">
      <head>
        <SEOHead />
      </head>
      <body className={`${inter.variable} ${notoSansBengali.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <Analytics 
          googleTagManagerId={process.env.NEXT_PUBLIC_GTM_ID}
          googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
          facebookPixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID}
          hotjarId={process.env.NEXT_PUBLIC_HOTJAR_ID}
        />
        <I18nProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <ScrollToTop />
            <Toaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
