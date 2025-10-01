import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <div className="relative h-8 w-auto">
                <Image
                  src="/logo.png"
                  alt="Creative Canvas IT"
                  width={200}
                  height={30}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              বাংলাদেশের সেরা আইটি প্রশিক্ষণ প্ল্যাটফর্ম। আপনার ক্যারিয়ার গড়তে
              আমাদের সাথে যোগ দিন।
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">০১৬০৩৭১৮৩৭৯</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">creativecanvasit@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">কুইক লিংক</h3>
            <div className="space-y-2">
              <Link
                href="/courses/free"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ফ্রি কোর্স
              </Link>
              <Link
                href="/seminars"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ফ্রি সেমিনার
              </Link>
              <Link
                href="/courses/live"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                লাইভ কোর্স
              </Link>
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                আমাদের সম্পর্কে
              </Link>
              <Link
                href="/mentors"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                সকল মেন্টর
              </Link>
              <Link
                href="/register"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                রেজিস্ট্রেশন
              </Link>
              <Link
                href="/events"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ইভেন্ট
              </Link>
              <Link
                href="/contact"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                যোগাযোগ
              </Link>
            </div>
          </div>

          {/* Course Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">কোর্স</h3>
            <div className="space-y-2">
              <Link
                href="/courses/digital-marketing"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ডিজিটাল মার্কেটিং
              </Link>
              <Link
                href="/courses/graphic-design"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                গ্রাফিক ডিজাইন
              </Link>
              <Link
                href="/courses/web-design"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ওয়েব ডিজাইন
              </Link>
              <Link
                href="/courses/programming"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                প্রোগ্রামিং
              </Link>
              <Link
                href="/courses/video-editing"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ভিডিও এডিটিং
              </Link>
              <Link
                href="/courses/data-science"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ডাটা সায়েন্স
              </Link>
            </div>
          </div>

          {/* Others & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">অন্যান্য</h3>
            <div className="space-y-2 mb-6">
              <Link
                href="/blog"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ব্লগ
              </Link>
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                আমাদের সম্পর্কে
              </Link>
              <Link
                href="/jobs"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                জব সার্কুলার
              </Link>
              <Link
                href="/referral"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                রেফারেল
              </Link>
              <Link
                href="/events"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                ইভেন্ট
              </Link>
              <Link
                href="/contact"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                যোগাযোগ
              </Link>
            </div>

            <div>
              <h4 className="font-semibold mb-3">কমিউনিটি-এর সাথে যুক্ত হোন</h4>
              <div className="flex space-x-3">
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              © ২০২৪ Creative Canvas IT. সব অধিকার সংরক্ষিত।
            </p>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy-policy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-use"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Use
              </Link>
              <Link
                href="/disclaimer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Disclaimer
              </Link>
              <Link
                href="/accessibility"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Accessibility
              </Link>
              <Link
                href="/sitemap-page"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
