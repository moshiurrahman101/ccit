'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Palette, 
  Code, 
  TrendingUp, 
  Video, 
  Globe,
  Database,
  Cpu
} from 'lucide-react';

const categories = [
  { id: 'all', name: 'সকল কোর্স', icon: BookOpen, isActive: true },
  { id: 'design', name: 'ডিজাইন এন্ড মাল্টিমিডিয়া', icon: Palette },
  { id: 'web', name: 'ওয়েব এন্ড সফটওয়্যার', icon: Code },
  { id: 'marketing', name: 'ডিজিটাল মার্কেটিং', icon: TrendingUp },
  { id: 'media', name: 'ফিল্ম এন্ড মিডিয়া', icon: Video },
  { id: 'language', name: 'ইংলিশ ল্যাঙ্গুয়েজ', icon: Globe },
  { id: 'data', name: 'ডেটা সায়েন্স', icon: Database },
  { id: 'ai', name: 'AI & ML', icon: Cpu },
];

export function CourseCategories() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap text-sm font-medium">
                  {category.name}
                </span>
                {isActive && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
