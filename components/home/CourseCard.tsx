'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock } from 'lucide-react';

interface CourseCardProps {
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  students: number;
  duration: string;
  level: string;
}

export function CourseCard({
  title,
  instructor,
  price,
  originalPrice,
  rating,
  students,
  duration,
  level
}: CourseCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-20">🎓</div>
        </div>
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white">
            {discount}% ছাড়
          </Badge>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Instructor Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-blue-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {instructor.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{instructor}</p>
            <p className="text-xs text-gray-500">বিশেষজ্ঞ মেন্টর</p>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Course Meta */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{students}+</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Level Badge */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs">
            {level}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-orange-600">
              {price.toLocaleString('bn-BD')}৳
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString('bn-BD')}৳
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white">
          বিস্তারিত দেখুন
        </Button>
      </div>
    </div>
  );
}
