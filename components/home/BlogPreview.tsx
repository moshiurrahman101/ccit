'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
// Static content for blog preview
const content = {
  blog: {
    title: "সফলতার গল্প ও টিপস",
    subtitle: "আমাদের বিশেষজ্ঞদের অভিজ্ঞতা এবং সফল শিক্ষার্থীদের গল্প জানুন",
    posts: [
      {
        title: "ফ্রিল্যান্সিং শুরু করার সম্পূর্ণ গাইড",
        excerpt: "ফ্রিল্যান্সিং শুরু করতে চান? এই গাইডে শিখুন কিভাবে প্রথম প্রজেক্ট পাবেন।",
        date: "১৫ জানুয়ারি",
        tags: ["ফ্রিল্যান্সিং", "ক্যারিয়ার"]
      },
      {
        title: "React.js শেখার সেরা উপায়",
        excerpt: "React.js শিখতে চান? জানুন কোন পথে এগোলে দ্রুত শিখতে পারবেন।",
        date: "১২ জানুয়ারি",
        tags: ["React", "প্রোগ্রামিং"]
      },
      {
        title: "ডিজিটাল মার্কেটিংয়ে সফলতা",
        excerpt: "ডিজিটাল মার্কেটিংয়ে ক্যারিয়ার গড়তে চান? এই টিপসগুলো সাহায্য করবে।",
        date: "১০ জানুয়ারি",
        tags: ["মার্কেটিং", "সফলতা"]
      }
    ]
  }
};

export function BlogPreview() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-48 h-48 bg-ccit-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-ccit-muted-1/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ccit-primary mb-6">
            {content.blog.title}
          </h2>
          <p className="text-xl text-ccit-muted-1 max-w-3xl mx-auto">
            {content.blog.subtitle}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {content.blog.posts.map((post, index) => (
            <article
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/50"
            >
              {/* Blog Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-ccit-primary/10 to-ccit-muted-1/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <span className="text-2xl opacity-60">📝</span>
                  </div>
                </div>
                
                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold text-ccit-primary">
                  {post.date}
                </div>
              </div>

              {/* Blog Content */}
              <div className="p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex} 
                      variant="secondary" 
                      className="bg-ccit-primary/10 text-ccit-primary border-ccit-primary/20 text-xs"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-ccit-primary mb-3 line-clamp-2 group-hover:text-ccit-accent-1 transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-ccit-muted-1 leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-ccit-muted-1 text-sm mb-6">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>৫ মিনিট পড়া</span>
                  </div>
                </div>

                {/* Read More Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-ccit-primary text-ccit-primary hover:bg-ccit-primary hover:text-white transition-all duration-300"
                >
                  আরও পড়ুন
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Blog Button */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-ccit-primary to-ccit-accent-1 hover:from-ccit-accent-1 hover:to-ccit-primary text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            সব ব্লগ পোস্ট দেখুন
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
