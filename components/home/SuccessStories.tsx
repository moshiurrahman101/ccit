'use client';

import { Button } from '@/components/ui/button';

export function SuccessStories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expectations Card */}
          <div className="bg-blue-900 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                Creative Canvas IT শিক্ষার্থীদের প্রত্যাশা দেখুন
              </h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                আমাদের শিক্ষার্থীরা কী ধরনের ক্যারিয়ার গড়ার স্বপ্ন দেখেন এবং 
                কিভাবে আমরা তাদের সেই লক্ষ্যে পৌঁছাতে সাহায্য করি তা দেখুন।
              </p>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-900"
              >
                আরও দেখুন →
              </Button>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-800 rounded-full opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500 rounded-full opacity-20"></div>
          </div>

          {/* Success Stories Card */}
          <div className="bg-gradient-to-br from-orange-500 to-blue-500 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                Creative Canvas IT শিক্ষার্থীদের সাফল্য দেখুন
              </h3>
              <p className="text-orange-100 mb-6 leading-relaxed">
                আমাদের শিক্ষার্থীদের সত্যিকারের সাফল্যের গল্পগুলো দেখুন। 
                কিভাবে তারা তাদের স্বপ্নের চাকরি পেয়েছেন এবং ক্যারিয়ারে সফল হয়েছেন।
              </p>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-orange-600"
              >
                আরও দেখুন →
              </Button>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
