'use client';

import { Button } from '@/components/ui/button';
import { Star, Quote, TrendingUp, Users } from 'lucide-react';
import content from '../../homepage.content.json';

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-ccit-primary via-ccit-accent-1 to-ccit-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        
        {/* Quote marks */}
        <div className="absolute top-10 left-10 text-white/10 text-9xl font-bold">&ldquo;</div>
        <div className="absolute bottom-10 right-10 text-white/10 text-9xl font-bold">&rdquo;</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            {content.testimonials.title}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {content.testimonials.subtitle}
          </p>
        </div>

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {content.testimonials.stories.map((story, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {story.name.charAt(0)}
                </div>

                <div className="flex-1">
                  {/* Quote */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-white/30 mb-2" />
                    <p className="text-white/90 leading-relaxed text-lg italic">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white">{story.name}</h4>
                    <p className="text-white/70">{story.role}</p>
                    
                    {/* Earning Badge */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-300">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{story.earning}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">১০০০+</div>
            <div className="text-white/80">সফল শিক্ষার্থী</div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Star className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">৪.৯/৫</div>
            <div className="text-white/80">রেটিং</div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">৯৮%</div>
            <div className="text-white/80">সাফল্যের হার</div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Quote className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">৫০+</div>
            <div className="text-white/80">সফলতার গল্প</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-white text-ccit-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {content.testimonials.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
