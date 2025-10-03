'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, ArrowRight, TrendingUp, BookOpen } from 'lucide-react';

interface Batch {
  _id: string;
  name: string;
  description: string;
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  duration: number;
  durationUnit: string;
  maxStudents: number;
  currentStudents: number;
  status: string;
  courseType: string;
  marketing: {
    slug: string;
    tags: string[];
  };
  courseId?: {
    _id: string;
    title: string;
    coverPhoto?: string;
    courseCode: string;
    courseShortcut: string;
    category: string;
    level: string;
    language: string;
    mentors: {
      _id: string;
      name: string;
      avatar?: string;
      designation: string;
      experience: number;
      expertise: string[];
    }[];
  };
  mentorId?: {
    name: string;
    avatar?: string;
  };
}

const durationUnitMap: { [key: string]: string } = {
  'days': 'দিন',
  'weeks': 'সপ্তাহ',
  'months': 'মাস',
  'years': 'বছর'
};

const statusBadgeMap: { [key: string]: { label: string; color: string } } = {
  'published': { label: 'চলমান', color: 'bg-green-500' },
  'upcoming': { label: 'আসন্ন', color: 'bg-blue-500' },
  'ongoing': { label: 'চলছে', color: 'bg-orange-500' }
};

export function Courses() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopBatches();
  }, []);

  const fetchTopBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/batches?limit=6');
      const data = await response.json();
      
      if (response.ok && data.batches) {
        setBatches(data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClick = (slug: string) => {
    router.push(`/batches/${slug}`);
  };

  const handleViewAll = () => {
    router.push('/batches');
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              আমাদের জনপ্রিয় ব্যাচসমূহ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              আপনার ক্যারিয়ার গড়ার জন্য সেরা ব্যাচে যুক্ত হন
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 rounded-2xl shadow-xl h-96 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            আমাদের জনপ্রিয় ব্যাচসমূহ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            আপনার ক্যারিয়ার গড়ার জন্য সেরা ব্যাচে যুক্ত হন
          </p>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">কোন ব্যাচ পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {batches.map((batch, index) => (
                <div 
                  key={batch._id} 
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/50 cursor-pointer"
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                  onClick={() => handleBatchClick(batch.marketing.slug)}
                >
                  {/* Batch Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {(batch.courseId?.coverPhoto || batch.coverPhoto) ? (
                      <img 
                        src={batch.courseId?.coverPhoto || batch.coverPhoto} 
                        alt={batch.courseId?.title || batch.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl opacity-60">🎓</div>
                        </div>
                      </>
                    )}
                    
                    {/* Badge */}
                    {statusBadgeMap[batch.status] && (
                      <div className="absolute top-4 right-4">
                        <Badge className={`${statusBadgeMap[batch.status].color} text-white border-0 shadow-lg`}>
                          {statusBadgeMap[batch.status].label}
                        </Badge>
                      </div>
                    )}

                    {/* Trending indicator */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>

                    {/* Course Type Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-black/50 text-white border-0 backdrop-blur-md">
                        {batch.courseType === 'online' ? '🌐 অনলাইন' : '🏢 অফলাইন'}
                      </Badge>
                    </div>
                  </div>

                  {/* Batch Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors bengali-heading">
                      {batch.courseId?.title || batch.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 bengali-text">{batch.name}</p>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2 bengali-text">{batch.description}</p>

                    {/* Course Mentors */}
                    {batch.courseId?.mentors && batch.courseId.mentors.length > 0 ? (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 bengali-text">মেন্টরগণ:</p>
                        <div className="flex flex-wrap gap-2">
                          {batch.courseId.mentors.slice(0, 3).map((mentor, index) => (
                            <div key={mentor._id} className="flex items-center space-x-1">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                {mentor.avatar ? (
                                  <img 
                                    src={mentor.avatar} 
                                    alt={mentor.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-xs font-semibold">
                                    {mentor.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-700 bengali-text">{mentor.name}</span>
                            </div>
                          ))}
                          {batch.courseId.mentors.length > 3 && (
                            <span className="text-xs text-gray-500 bengali-text">
                              +{batch.courseId.mentors.length - 3} আরও
                            </span>
                          )}
                        </div>
                      </div>
                    ) : batch.mentorId && (
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          {batch.mentorId.avatar ? (
                            <img 
                              src={batch.mentorId.avatar} 
                              alt={batch.mentorId.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-semibold">
                              {batch.mentorId.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 bengali-text">{batch.mentorId.name}</p>
                          <p className="text-xs text-gray-500 bengali-text">মেন্টর</p>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{batch.currentStudents}/{batch.maxStudents}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>{batch.duration} {durationUnitMap[batch.durationUnit] || batch.durationUnit}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span>ব্যাচ</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {(batch.discountPrice || batch.regularPrice).toLocaleString('bn-BD')}৳
                        </span>
                        {batch.discountPrice && batch.discountPrice < batch.regularPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            {batch.regularPrice.toLocaleString('bn-BD')}৳
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">সিট বাকি</div>
                        <div className="text-sm font-medium text-gray-900">
                          {batch.maxStudents - batch.currentStudents}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-white font-semibold">
                      বিস্তারিত দেখুন
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleViewAll}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold bg-white/80 backdrop-blur-md"
              >
                সব ব্যাচ দেখুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
