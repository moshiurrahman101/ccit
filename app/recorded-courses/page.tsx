'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Loader2, Play, Clock, Search, Filter, Award } from 'lucide-react';
import Link from 'next/link';

interface RecordedCourse {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  videos: Array<{
    title: string;
    youtubeVideoId: string;
    isPreview: boolean;
  }>;
  category: string;
  level: string;
  duration: number;
  durationUnit: string;
  slug: string;
  status: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function RecordedCoursesPage() {
  const [courses, setCourses] = useState<RecordedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNext: false,
    hasPrev: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Other' }
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '12',
        status: 'published'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (levelFilter && levelFilter !== 'all') params.append('level', levelFilter);

      const response = await fetch(`/api/recorded-courses?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCourses: data.courses?.length || 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        console.error('Error fetching courses:', data.error);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [pagination.currentPage, searchTerm, categoryFilter, levelFilter]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('en-BD').format(price);
    // Convert English numerals to Bengali numerals
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return formatted.replace(/\d/g, (digit) => bengaliNumerals[parseInt(digit)]);
  };

  const getCategoryLabel = (category: string) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
  };

  const getLevelLabel = (level: string) => {
    const found = levels.find(lvl => lvl.value === level);
    return found ? found.label : level;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg mb-6">
            <Video className="w-5 h-5 text-yellow-300 mr-2" />
            <span className="text-sm font-semibold bengali-text">ভিডিও কোর্স</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6 bengali-heading">
            ভিডিও কোর্সসমূহ
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 bengali-text max-w-3xl mx-auto leading-relaxed">
            আপনার নিজের সময়ে শিখুন - প্রাক-রেকর্ড করা কোর্সসমূহে অ্যাক্সেস করুন এবং যেকোনো সময়, যেকোনো জায়গা থেকে শিখুন
          </p>
          
          {/* Enhanced Search Box */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-2xl">
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
                    <Input
                      type="text"
                      placeholder="কোর্স বা বিষয়বস্তু অনুসারে খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-14 pr-4 py-4 text-lg rounded-xl border-0 bg-transparent placeholder-gray-500 focus:ring-0 focus:outline-none bengali-text"
                    />
                  </div>
                  <Button 
                    className="ml-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => fetchCourses()}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    খুঁজুন
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">{courses.length}+</div>
              <div className="text-sm opacity-90 bengali-text">কোর্স</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">৫০+</div>
              <div className="text-sm opacity-90 bengali-text">ভিডিও</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">৯৫%</div>
              <div className="text-sm opacity-90 bengali-text">সন্তুষ্টি</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">ফিল্টার:</span>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="ক্যাটাগরি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="লেভেল" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব লেভেল</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setLevelFilter('all');
              }}
              className="ml-auto"
            >
              রিসেট
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">কোনো কোর্স পাওয়া যায়নি</h3>
            <p className="text-gray-600">আপনার অনুসন্ধানের সাথে মিলে যাওয়া কোনো কোর্স নেই</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const previewCount = course.videos.filter(v => v.isPreview).length;
              const finalPrice = course.discountPrice || course.regularPrice;
              const discountPercentage = course.discountPrice 
                ? Math.round(((course.regularPrice - course.discountPrice) / course.regularPrice) * 100)
                : 0;

              return (
                <Link key={course._id} href={`/recorded-courses/${course.slug || course._id}`} className="group block">
                  <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 shadow-lg rounded-2xl bg-white flex flex-col">
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                      {course.coverPhoto ? (
                        <img
                          src={course.coverPhoto}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Video className="h-16 w-16 mx-auto mb-3 opacity-80" />
                            <p className="text-sm font-medium opacity-90">{course.title}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Video Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          <Video className="h-4 w-4 inline mr-1" />
                          ভিডিও
                        </span>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                          {getCategoryLabel(course.category)}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {course.discountPrice && discountPercentage > 0 && (
                        <div className="absolute bottom-4 right-4">
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                            {discountPercentage}% ছাড়
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors bengali-heading">
                        {course.title}
                      </h3>
                      
                      {/* Short Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 bengali-text">
                        {course.shortDescription || course.description}
                      </p>
                      
                      {/* Course Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Video className="h-4 w-4 text-orange-500" />
                          <span>{course.videos.length} টি ভিডিও</span>
                        </div>
                        {previewCount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Play className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">{previewCount} টি প্রিভিউ</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="h-4 w-4 text-orange-500" />
                          <span>{getLevelLabel(course.level)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>{course.duration} {course.durationUnit}</span>
                        </div>
                      </div>
                      
                      {/* Price Section - Modern Design */}
                      <div className="mb-4">
                        {course.discountPrice ? (
                          <div className="relative">
                            {/* Discount Banner */}
                            {discountPercentage > 0 && (
                              <div className="absolute -top-2 -right-2 z-10">
                                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                                  {discountPercentage}% ছাড়
                                </div>
                              </div>
                            )}
                            
                            {/* Main Price Card */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 relative overflow-hidden">
                              {/* Decorative elements */}
                              <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                              <div className="absolute bottom-0 left-0 w-12 h-12 bg-emerald-100 rounded-full translate-y-6 -translate-x-6 opacity-50"></div>
                              
                              <div className="relative text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                  <span className="text-3xl font-bold text-green-600">
                                    ৳{formatPrice(course.discountPrice)}
                                  </span>
                                  <div className="flex flex-col items-center">
                                    <div className="text-xs text-gray-500 line-through">
                                      ৳{formatPrice(course.regularPrice)}
                                    </div>
                                    <div className="text-xs text-green-600 font-semibold">
                                      সাশ্রয়
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Savings amount */}
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                                  ৳{formatPrice(course.regularPrice - course.discountPrice)} সাশ্রয়
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-indigo-100 rounded-full translate-y-6 -translate-x-6 opacity-50"></div>
                            
                            <div className="relative text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-1">
                                ৳{formatPrice(course.regularPrice)}
                              </div>
                              <div className="text-sm text-blue-500 font-medium">
                                কোর্স মূল্য
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          একবার কেনার পর আজীবন অ্যাক্সেস
                        </p>
                      </div>
                      
                      {/* Action Button */}
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 bengali-text mt-auto">
                        <Play className="h-4 w-4 mr-2" />
                        বিস্তারিত দেখুন
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2"
            >
              পূর্ববর্তী
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  className="px-4 py-2"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2"
            >
              পরবর্তী
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
