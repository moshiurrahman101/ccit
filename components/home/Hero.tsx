'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Star, Users, TrendingUp, BookOpen } from 'lucide-react';

export function Hero() {
  const handleVideoPlay = () => {
    // Here you would integrate with your video player
    console.log('Playing intro video...');
  };

  return (
    <section className="relative py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-200/40 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-indigo-300/30 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-lg">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-blue-700 font-semibold bengali-text text-sm sm:text-base">বাংলাদেশের বিশ্বস্ত আইটি প্রশিক্ষণ প্ল্যাটফর্ম</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bengali-heading">
                <span className="block text-gray-900">Creative Canvas IT</span>
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  অনলাইন প্রশিক্ষণ প্ল্যাটফর্ম
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl bengali-text">
                Creative Canvas IT-এ আমরা বিশ্বাস করি—প্র্যাকটিস করলে দক্ষতা আসে। ২০২৩ থেকে শুরু করে আজ পর্যন্ত ১৫০+ শিক্ষার্থীকে হাতে-কলমে শেখিয়েছি। আমাদের কোর্সে লাইভ ডেমো, রেকর্ডেড ক্লাস, বাস্তবপ্রজেক্ট এবং জব-কানেক্টর সাপোর্ট আছে।
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-glow"
                onClick={() => window.location.href = '/courses'}
              >
                কোর্স দেখুন
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold backdrop-blur-md bg-white/80"
                onClick={() => window.location.href = '/batches'}
              >
                <BookOpen className="mr-2 w-5 h-5" />
                ব্যাচ দেখুন
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-md border border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-2xl font-bold text-blue-600 mb-1">১০০+</div>
                <div className="text-xs text-gray-600 font-medium bengali-text">সফল শিক্ষার্থী</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-md border border-indigo-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-2xl font-bold text-indigo-600 mb-1">৫+</div>
                <div className="text-xs text-gray-600 font-medium bengali-text">প্রফেশনাল কোর্স</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-md border border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-2xl font-bold text-blue-600 mb-1">৯৮%</div>
                <div className="text-xs text-gray-600 font-medium bengali-text">সন্তুষ্টি হার</div>
              </div>
            </div>
          </div>

          {/* Right Content - Animated Video Playbox */}
          <div className="relative">
            <div className="relative">
              {/* Main Video Container */}
              <div className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl">
                {/* Animated background pattern */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233B82F6' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20zm-20-20v40'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat'
                    }}
                  />
                </div>
                
                {/* Video Placeholder */}
                <div className="relative z-10">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                    {/* Video overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Play Button */}
                    <button
                      onClick={handleVideoPlay}
                      className="relative z-10 group"
                    >
                      <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110 group-hover:bg-white">
                        <Play className="w-6 h-6 text-orange-600 ml-1 group-hover:text-orange-700 transition-colors" />
                      </div>
                    </button>

                    {/* Video Info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="bg-black/40 backdrop-blur-md rounded-lg p-2">
                        <p className="text-xs font-medium">Creative Canvas IT - সফলতার গল্প</p>
                        <p className="text-xs opacity-80">২ মিনিটের অনুপ্রেরণামূলক ভিডিও</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Stats */}
                <div className="relative z-10 grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-2 rounded-lg bg-white/60 backdrop-blur-md">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="text-xs font-semibold text-gray-900">১৫০+</div>
                    <div className="text-xs text-gray-600">দেখেছেন</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/60 backdrop-blur-md">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="text-xs font-semibold text-gray-900">৪.৯/৫</div>
                    <div className="text-xs text-gray-600">রেটিং</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/60 backdrop-blur-md">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="text-xs font-semibold text-gray-900">৯৮%</div>
                    <div className="text-xs text-gray-600">সন্তুষ্টি</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-float"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}