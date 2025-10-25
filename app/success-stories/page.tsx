import { Metadata } from 'next';
import { SuccessStoriesClient } from '@/components/review/SuccessStoriesClient';
import { Trophy, Users, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'সফলতার গল্প - Creative Canvas IT',
  description: 'আমাদের শিক্ষার্থীদের আসল সফলতার গল্প। দেখুন কিভাবে আমাদের কোর্স ক্যারিয়ার পরিবর্তন করেছে।'
};

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-orange-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400/20 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            সফলতার গল্প
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            আসল শিক্ষার্থীদের আসল গল্প। দেখুন কিভাবে আমাদের কোর্স ক্যারিয়ার পরিবর্তন করেছে এবং নতুন সুযোগের দরজা খুলেছে।
          </p>
          

        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <div className="text-4xl font-bold text-white mb-2">৫০০+</div>
            <div className="text-white/70">শিক্ষার্থী নিবন্ধিত</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <div className="text-4xl font-bold text-white mb-2">৪.৮/৫</div>
            <div className="text-white/70">গড় রেটিং</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <Trophy className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <div className="text-4xl font-bold text-white mb-2">২০০+</div>
            <div className="text-white/70">সফলতার গল্প</div>
          </div>
        </div>

        {/* Reviews Section */}
        <SuccessStoriesClient />
      </div>
    </div>
  );
}
