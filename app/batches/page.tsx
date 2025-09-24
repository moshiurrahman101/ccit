'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, Calendar, Clock, Star, Search, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Batch {
  _id: string;
  name: string;
  description: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  mentorId: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
    rating?: number;
  };
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  marketing: {
    slug: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBatches: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalBatches: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    courseType: ''
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async (page = 1, search = '', status = '', courseType = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(status && { status }),
        ...(courseType && { courseType })
      });

      const response = await fetch(`/api/public/batches?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBatches(data.batches);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching batches:', data.error);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    fetchBatches(1, search, filters.status, filters.courseType);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchBatches(1, newFilters.search, newFilters.status, newFilters.courseType);
  };

  const handlePageChange = (page: number) => {
    fetchBatches(page, filters.search, filters.status, filters.courseType);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && batches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading batches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">আমাদের ব্যাচসমূহ</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              নতুন দক্ষতা আয়ত্ত করতে এবং আপনার ক্যারিয়ার এগিয়ে নিতে ডিজাইন করা আমাদের বিস্তৃত শিক্ষামূলক প্রোগ্রামগুলি আবিষ্কার করুন।
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ব্যাচ খুঁজুন..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilter('status', value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="স্ট্যাটাস দিয়ে ফিল্টার করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="published">প্রকাশিত</SelectItem>
                <SelectItem value="upcoming">আসন্ন</SelectItem>
                <SelectItem value="ongoing">চলমান</SelectItem>
                <SelectItem value="completed">সম্পন্ন</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.courseType || "all"} onValueChange={(value) => handleFilter('courseType', value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="টাইপ দিয়ে ফিল্টার করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব টাইপ</SelectItem>
                <SelectItem value="online">অনলাইন</SelectItem>
                <SelectItem value="offline">অফলাইন</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {batches.length}টি ব্যাচ দেখানো হচ্ছে {pagination.totalBatches}টি থেকে
          </p>
        </div>


        {/* Batches Grid */}
        {batches.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ব্যাচ পাওয়া যায়নি</h3>
            <p className="text-gray-600">আপনার অনুসন্ধান বা ফিল্টার মানদণ্ড সামঞ্জস্য করার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {batches.map((batch) => {
              // Calculate days until start
              const now = new Date().getTime();
              const startDate = new Date(batch.startDate).getTime();
              const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
              const isStarted = daysUntilStart <= 0;
              
              return (
                <Link key={batch._id} href={`/batches/${batch.marketing.slug}`} className="group block">
                  {/* New Card Design */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 h-full flex flex-col">
                    
                    {/* Cover Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      {batch.coverPhoto ? (
                        <img
                          src={batch.coverPhoto}
                          alt={batch.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <BookOpen className="h-16 w-16 mx-auto mb-3 opacity-80" />
                            <p className="text-sm font-medium opacity-90">{batch.name}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      
                      {/* Smart Countdown Badge */}
                      <div className="absolute top-4 left-4">
                        {batch.status === 'upcoming' ? (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            <Star className="h-4 w-4 inline mr-1" />
                            Coming Soon!
                          </span>
                        ) : batch.currentStudents >= batch.maxStudents ? (
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            <Users className="h-3 w-3 inline mr-1" />
                            No Seat Available
                          </span>
                        ) : isStarted ? (
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Batch is Running
                          </span>
                        ) : batch.status === 'published' ? (
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {daysUntilStart === 1 ? 'আগামীকাল' : 
                             daysUntilStart <= 7 ? `${daysUntilStart} দিন বাকি` : 
                             `শুরু: ${formatDate(batch.startDate)}`}
                          </span>
                        ) : (
                          <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {daysUntilStart === 1 ? 'আগামীকাল' : 
                             daysUntilStart <= 7 ? `${daysUntilStart} দিন বাকি` : 
                             `শুরু: ${formatDate(batch.startDate)}`}
                          </span>
                        )}
                      </div>
                      
                      {/* Course Type Badge */}
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                          {batch.courseType}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col">
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {batch.name}
                      </h3>
                      
                      {/* Mentor Info */}
                      <div className="flex items-center gap-3 mb-4">
                        {batch.mentorId.avatar ? (
                          <img
                            src={batch.mentorId.avatar}
                            alt={batch.mentorId.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center border-2 border-orange-200">
                            <span className="text-white font-bold text-sm">{batch.mentorId.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{batch.mentorId.name}</p>
                          <p className="text-xs text-gray-500">{batch.mentorId.designation}</p>
                        </div>
                        {batch.mentorId.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-semibold text-gray-900">{batch.mentorId.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Course Details */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{batch.duration} {batch.durationUnit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{batch.currentStudents}/{batch.maxStudents}</span>
                        </div>
                      </div>
                      
                      {/* Price Section - Redesigned */}
                      <div className="mb-6">
                        {batch.discountPrice ? (
                          <div className="relative">
                            {/* Discount Banner */}
                            <div className="absolute -top-2 -right-2 z-10">
                              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                                {batch.discountPercentage}% ছাড়
                              </div>
                            </div>
                            
                            {/* Main Price Card */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 relative overflow-hidden">
                              {/* Decorative elements */}
                              <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                              <div className="absolute bottom-0 left-0 w-12 h-12 bg-emerald-100 rounded-full translate-y-6 -translate-x-6 opacity-50"></div>
                              
                              <div className="relative text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                  <span className="text-4xl font-bold text-green-600">
                                    ৳{formatPrice(batch.discountPrice)}
                                  </span>
                                  <div className="flex flex-col items-center">
                                    <div className="text-xs text-gray-500 line-through">
                                      ৳{formatPrice(batch.regularPrice)}
                                    </div>
                                    <div className="text-xs text-green-600 font-semibold">
                                      আপনি সাশ্রয় করবেন
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Savings amount */}
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                                  ৳{formatPrice(batch.regularPrice - batch.discountPrice)} সাশ্রয়
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
                              <div className="text-4xl font-bold text-blue-600 mb-1">
                                ৳{formatPrice(batch.regularPrice)}
                              </div>
                              <div className="text-sm text-blue-500 font-medium">
                                স্পেশাল প্রাইস
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        বিস্তারিত দেখুন
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              পূর্ববর্তী
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              পরবর্তী
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
