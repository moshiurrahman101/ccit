'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Star, Users, Award } from 'lucide-react';
// Static content for hero section
const content = {
  hero: {
    title: "আগে দক্ষতা অর্জন করুন, তারপর আয় করুন!",
    subtitle: "বাংলাদেশের অন্যতম সেরা আইটি প্রশিক্ষণ প্ল্যাটফর্ম",
    description: "বিশেষজ্ঞ মেন্টরদের সাথে শিখুন, প্রজেক্ট তৈরি করুন এবং সফল ক্যারিয়ার গড়ুন।",
    badge: "বাংলাদেশের বিশ্বস্ত আইটি প্রশিক্ষণ প্ল্যাটফর্ম",
    cta: {
      primary: "কোর্স দেখুন",
      secondary: "মেন্টরদের সাথে কথা বলুন"
    },
    stats: [
      { value: "১০,০০০+", label: "সফল শিক্ষার্থী" },
      { value: "৫০+", label: "প্রফেশনাল কোর্স" },
      { value: "৯৮%", label: "সন্তুষ্টি হার" },
      { value: "২৪/৭", label: "সাপোর্ট" }
    ]
  },
  courses: {
    featured: [
      { title: "Full Stack Web Development", instructor: "রাহুল আহমেদ", image: "🌐", badge: "জনপ্রিয়", newPrice: "৳১৫,০০০", oldPrice: "৳২০,০০০", duration: "৬ মাস", students: "১,২০০+" },
      { title: "Digital Marketing Mastery", instructor: "সুমাইয়া খান", image: "📱", badge: "নতুন", newPrice: "৳১২,০০০", oldPrice: "৳১৫,০০০", duration: "৪ মাস", students: "৯৮০+" },
      { title: "Graphic Design with Adobe", instructor: "আরিফ হোসেন", image: "🎨", badge: "বিশেষ ছাড়", newPrice: "৳১০,০০০", oldPrice: "৳১৩,০০০", duration: "৩ মাস", students: "৮৫০+" }
    ]
  }
};

export function HeroSection() {
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCourseIndex((prev) => (prev + 1) % content.courses.featured.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextCourse = () => {
    setCurrentCourseIndex((prev) => (prev + 1) % content.courses.featured.length);
  };

  const prevCourse = () => {
    setCurrentCourseIndex((prev) => (prev - 1 + content.courses.featured.length) % content.courses.featured.length);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-ccit-primary via-ccit-accent-1 to-ccit-primary overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-ccit-muted-1/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-ccit-muted-1/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-white font-semibold">{content.hero.badge}</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {content.hero.title}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                {content.hero.subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-ccit-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {content.hero.cta.primary}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-ccit-primary px-8 py-4 text-lg font-semibold backdrop-blur-md"
              >
                {content.hero.cta.secondary}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{content.hero.stats[0].value}</div>
                <div className="text-white/80 text-sm">{content.hero.stats[0].label}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{content.hero.stats[1].value}</div>
                <div className="text-white/80 text-sm">{content.hero.stats[1].label}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{content.hero.stats[2].value}</div>
                <div className="text-white/80 text-sm">{content.hero.stats[2].label}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{content.hero.stats[3].value}</div>
                <div className="text-white/80 text-sm">{content.hero.stats[3].label}</div>
              </div>
            </div>
          </div>

          {/* Right Content - Course Carousel */}
          <div className="relative">
            {/* Course Cards Container */}
            <div className="relative h-[500px]">
              {content.courses.featured.map((course, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    index === currentCourseIndex
                      ? 'opacity-100 translate-x-0 scale-100'
                      : index < currentCourseIndex
                      ? 'opacity-0 -translate-x-full scale-95'
                      : 'opacity-0 translate-x-full scale-95'
                  }`}
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl h-full">
                    {/* Course Image Placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-white/20 to-white/10 rounded-xl mb-6 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="space-y-4">
                      <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
                        {course.badge}
                      </Badge>
                      
                      <h3 className="text-xl font-bold text-white leading-tight">
                        {course.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-ccit-muted-1/30 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/80 text-sm">{course.instructor}</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-white">{course.newPrice}</span>
                        <span className="text-lg text-white/60 line-through">{course.oldPrice}</span>
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                          ছাড়
                        </Badge>
                      </div>

                      {/* Course Meta */}
                      <div className="flex items-center justify-between text-white/80 text-sm">
                        <span className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="sm"
              onClick={prevCourse}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextCourse}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              {content.courses.featured.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCourseIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentCourseIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
