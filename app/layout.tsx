import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Creative Canvas IT — ফ্রিল্যান্সিং ও ক্যারিয়ার কোর্স",
  description: "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
  keywords: "আইটি কোর্স, ফ্রিল্যান্সিং, প্রোগ্রামিং, ওয়েব ডেভেলপমেন্ট, ডিজিটাল মার্কেটিং, গ্রাফিক ডিজাইন, বাংলাদেশ",
  authors: [{ name: "Creative Canvas IT" }],
  openGraph: {
    title: "Creative Canvas IT — ফ্রিল্যান্সিং ও ক্যারিয়ার কোর্স",
    description: "Creative Canvas IT - সাশ্রয়ী লাইভ ও রেকর্ডেড কোর্স, ২৪/৭ মেন্টর সাপোর্ট, সার্টিফিকেট।",
    type: "website",
    locale: "bn_BD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" dir="ltr">
      <body className={`${inter.variable} font-sans antialiased`}>
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
