'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, TrendingUp, Users, Award, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface Review {
  _id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  review: string;
  earning?: string;
  avatar?: string;
  isFeatured: boolean;
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxChars = 150;

  const shouldShowExpand = review.review.length > maxChars;
  const displayText = isExpanded 
    ? review.review 
    : review.review.slice(0, maxChars) + (shouldShowExpand ? '...' : '');

  return (
    <div
      className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      style={{
        animationDelay: `${index * 0.2}s`
      }}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        {review.avatar && review.avatar.trim() ? (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
            <img
              src={review.avatar}
              alt={review.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {review.name.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          {/* Quote */}
          <div className="relative mb-6">
            <Quote className="w-8 h-8 text-white/30 mb-2" />
            <p className="text-white/90 leading-relaxed text-base italic">
              &ldquo;{displayText}&rdquo;
              {shouldShowExpand && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 text-white/70 hover:text-white underline text-sm font-semibold"
                >
                  {isExpanded ? (
                    <>
                      কম দেখুন <ChevronUp className="inline w-4 h-4" />
                    </>
                  ) : (
                    <>
                      আরও পড়ুন <ChevronDown className="inline w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </p>
          </div>

          {/* Author Info */}
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white">{review.name}</h4>
            <p className="text-white/70">{review.role}</p>
            
            {/* Rating */}
            <div className="flex items-center space-x-1">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            
            {/* Earning Badge */}
            {review.earning && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 mt-3">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="font-semibold text-sm">{review.earning}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Fetch approved reviews (not just featured ones) to ensure we have content
      const response = await fetch('/api/reviews?isApproved=true&limit=6');
      const data = await response.json();
      console.log('API Response:', data);
      console.log('Reviews array:', data.reviews);
      // The API returns { reviews: [...] } so we need to extract the reviews array
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show static fallback while loading or if no reviews
  const displayReviews = loading ? [] : reviews.length > 0 ? reviews.slice(0, 3) : [
    {
      _id: '1',
      name: "রাহুল আহমেদ",
      role: "ফ্রিল্যান্সার",
      review: "Creative Canvas IT-এর কোর্সের মাধ্যমে আমি সফল ফ্রিল্যান্সার হতে পেরেছি। এখন মাসে ৫০,০০০+ টাকা আয় করি।",
      earning: "মাসে ৫০,০০০৳+ আয়",
      rating: 5,
      isFeatured: false
    },
    {
      _id: '2',
      name: "সুমাইয়া খান",
      role: "ওয়েব ডেভেলপার",
      review: "বিশ্বমানের প্রশিক্ষণ পেয়েছি এবং এখন ভালো কোম্পানিতে চাকরি পেয়েছি। সবাইকে Creative Canvas IT-এর কথা বলব।",
      earning: "বড় কোম্পানিতে চাকরি",
      rating: 5,
      isFeatured: false
    },
    {
      _id: '3',
      name: "আরিফ হোসেন",
      role: "ডিজিটাল মার্কেটার",
      review: "কোর্স শেষ করার পরই চাকরি পেয়েছি। আমাদের মেন্টররা খুবই সাহায্য করেছেন। ধন্যবাদ Creative Canvas IT।",
      earning: "তিন মাসে চাকরি",
      rating: 5,
      isFeatured: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        
        {/* Quote marks */}
        <div className="absolute top-10 left-10 text-white/10 text-9xl font-bold">&ldquo;</div>
        <div className="absolute bottom-10 right-10 text-white/10 text-9xl font-bold">&rdquo;</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            আমাদের শিক্ষার্থীদের সাফল্য
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            দেখুন কিভাবে আমাদের শিক্ষার্থীরা তাদের স্বপ্ন পূরণ করছে
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {displayReviews.map((review, index) => (
              <ReviewCard key={review._id} review={review} index={index} />
            ))}
          </div>
        )}

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
              <Award className="w-10 h-10 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">৫০+</div>
            <div className="text-white/80">সফলতার গল্প</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button className="bg-white text-blue-600 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            সাফল্যের গল্প দেখুন
          </button>
        </div>
      </div>
    </section>
  );
}