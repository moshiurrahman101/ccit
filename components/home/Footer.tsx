import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Creative Canvas IT" 
                width={200}
                height={30}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 leading-relaxed">
              বাংলাদেশের সেরা আইটি প্রশিক্ষণ প্ল্যাটফর্ম। 
              আপনার ক্যারিয়ার গড়তে আমাদের সাথে যোগ দিন।
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">কুইক লিংক</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                ফ্রি কোর্স
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                ফ্রি সেমিনার
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                লাইভ কোর্স
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                আমাদের সম্পর্কে
              </Link>
            </div>
          </div>

          {/* Course Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">কোর্স</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                ডিজিটাল মার্কেটিং
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                গ্রাফিক ডিজাইন
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                ওয়েব ডিজাইন
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-white transition-colors">
                প্রোগ্রামিং
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">যোগাযোগ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">
                  ০১৬০৩৭১৮৩৭৯
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">
                  creativecanvasit@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">
                  শনি - বৃহস্পতি: ৬:০০PM - ১১:০০PM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © ২০২৪ Creative Canvas IT. সব অধিকার সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
}
