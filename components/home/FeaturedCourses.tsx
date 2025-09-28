'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star } from 'lucide-react';

export function FeaturedCourses() {
  const featuredCourses = [
    {
      id: 1,
      title: 'Full Stack Web Development',
      description: 'React, Node.js, MongoDB দিয়ে সম্পূর্ণ ওয়েব অ্যাপ্লিকেশন তৈরি করুন',
      duration: '৬ মাস',
      students: 150,
      rating: 4.9,
      price: 15000,
      originalPrice: 20000,
      image: '/api/placeholder/400/250',
      tags: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Python Programming & Data Science',
      description: 'Python দিয়ে প্রোগ্রামিং এবং ডেটা সায়েন্স শিখুন',
      duration: '৪ মাস',
      students: 120,
      rating: 4.8,
      price: 12000,
      originalPrice: 15000,
      image: '/api/placeholder/400/250',
      tags: ['Python', 'Data Science', 'Machine Learning']
    },
    {
      id: 3,
      title: 'Mobile App Development',
      description: 'React Native দিয়ে iOS এবং Android অ্যাপ তৈরি করুন',
      duration: '৫ মাস',
      students: 90,
      rating: 4.7,
      price: 18000,
      originalPrice: 22000,
      image: '/api/placeholder/400/250',
      tags: ['React Native', 'iOS', 'Android']
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            জনপ্রিয় কোর্সসমূহ
          </h2>
          <p className="text-xl text-gray-600">
            সবচেয়ে বেশি এনরোল হওয়া কোর্সগুলো দেখুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course, index) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <div className={`aspect-video bg-gradient-to-br ${
                index === 0 ? 'from-orange-400 to-orange-600' :
                index === 1 ? 'from-blue-400 to-blue-600' :
                'from-orange-400 to-blue-500'
              } relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center relative z-10">
                    <h3 className="text-lg font-semibold mb-3">{course.title}</h3>
                    <div className="flex justify-center space-x-2">
                      {course.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <p className="text-gray-600">{course.description}</p>
              </CardHeader>

              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students} শিক্ষার্থী
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    {course.rating}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-orange-600">
                      ৳{course.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through ml-2">
                      ৳{course.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-semibold">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% ছাড়
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                  <Link href={`/courses/${course.id}`}>
                    কোর্স বিস্তারিত দেখুন
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/courses">
              সব কোর্স দেখুন
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
