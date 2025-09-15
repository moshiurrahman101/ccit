'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, Star } from 'lucide-react';
// Static content for course section
const content = {
  courses: {
    featured: [
      {
        title: "Full Stack Web Development",
        instructor: "রাহুল আহমেদ",
        price: "৳১৫,০০০",
        originalPrice: "৳২০,০০০",
        rating: 4.9,
        students: 1200,
        duration: "৬ মাস",
        level: "বিগিনার",
        image: "🌐",
        badge: "জনপ্রিয়"
      },
      {
        title: "Digital Marketing Mastery",
        instructor: "সুমাইয়া খান",
        price: "৳১২,০০০",
        originalPrice: "৳১৫,০০০",
        rating: 4.8,
        students: 980,
        duration: "৪ মাস",
        level: "ইন্টারমিডিয়েট",
        image: "📱",
        badge: "নতুন"
      },
      {
        title: "Graphic Design with Adobe",
        instructor: "আরিফ হোসেন",
        price: "৳১০,০০০",
        originalPrice: "৳১৩,০০০",
        rating: 4.7,
        students: 850,
        duration: "৩ মাস",
        level: "বিগিনার",
        image: "🎨",
        badge: "বিশেষ ছাড়"
      }
    ]
  }
};

interface CourseSectionProps {
  title: string;
  subtitle?: string;
  showCalendar?: boolean;
}

export function CourseSection({ title, subtitle, showCalendar = false }: CourseSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const coursesPerView = 3;

  const nextCourses = () => {
    setCurrentIndex((prev) => Math.min(content.courses.featured.length - coursesPerView, prev + 1));
  };

  const prevCourses = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-ccit-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-ccit-muted-1/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-ccit-primary mb-4">{title}</h2>
            {subtitle && (
              <p className="text-xl text-ccit-muted-1">{subtitle}</p>
            )}
          </div>
          
          {showCalendar && (
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-ccit-primary to-ccit-accent-1 text-white shadow-lg">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-semibold">আগামী সপ্তাহে শুরু</span>
              </div>
            </div>
          )}
        </div>

        {/* Course Cards with Navigation */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={prevCourses}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border-ccit-primary/20 text-ccit-primary hover:bg-ccit-primary hover:text-white shadow-xl z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextCourses}
            disabled={currentIndex >= content.courses.featured.length - coursesPerView}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border-ccit-primary/20 text-ccit-primary hover:bg-ccit-primary hover:text-white shadow-xl z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.courses.featured.slice(currentIndex, currentIndex + coursesPerView).map((course, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/50"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-ccit-primary/10 to-ccit-muted-1/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <div className="text-4xl opacity-60">🎓</div>
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                    {course.badge}
                  </Badge>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-ccit-primary mb-3 line-clamp-2 group-hover:text-ccit-accent-1 transition-colors">
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-ccit-primary to-ccit-accent-1 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-ccit-muted-1 text-sm">{course.instructor}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl font-bold text-ccit-primary">{course.price}</span>
                    <span className="text-lg text-ccit-muted-1 line-through">{course.originalPrice}</span>
                    <Badge variant="destructive" className="text-xs">
                      ছাড়
                    </Badge>
                  </div>

                  {/* Course Meta */}
                  <div className="flex items-center justify-between text-ccit-muted-1 text-sm mb-6">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full bg-gradient-to-r from-ccit-primary to-ccit-accent-1 hover:from-ccit-accent-1 hover:to-ccit-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    কোর্স বিস্তারিত
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-ccit-primary text-ccit-primary hover:bg-ccit-primary hover:text-white px-8 py-3 font-semibold"
          >
            সব কোর্স দেখুন
          </Button>
        </div>
      </div>
    </section>
  );
}