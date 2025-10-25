'use client';

import { useEffect, useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Loader2, Filter } from 'lucide-react';

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
  isSuccessStory: boolean;
  createdAt: string;
}

export function SuccessStoriesClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'featured'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/reviews?isApproved=true&limit=50';
      
      if (filter === 'success') {
        url += '&isSuccessStory=true';
      } else if (filter === 'featured') {
        url += '&isFeatured=true';
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-8 border border-red-500/50 text-center">
        <p className="text-red-200 text-lg">{error}</p>
        <Button onClick={fetchReviews} className="mt-4">
          আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">এখনো কোনো রিভিউ নেই</h3>
        <p className="text-white/70">
          শিক্ষার্থীদের রিভিউ শীঘ্রই যুক্ত করা হবে।
        </p>
      </div>
    );
  }

  // Separate featured and regular reviews
  const featuredReviews = reviews.filter(r => r.isFeatured);
  const regularReviews = reviews.filter(r => !r.isFeatured);

  // Sort featured reviews first, then by date
  const sortedReviews = [...featuredReviews, ...regularReviews];

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          সব গল্প ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('success')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            filter === 'success'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Filter className="inline w-4 h-4 mr-2" />
          সফলতার গল্প ({reviews.filter(r => r.isSuccessStory).length})
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review._id}
            name={review.name}
            role={review.role}
            company={review.company}
            rating={review.rating}
            review={review.review}
            earning={review.earning}
            avatar={review.avatar}
            isFeatured={review.isFeatured}
          />
        ))}
      </div>


    </div>
  );
}
