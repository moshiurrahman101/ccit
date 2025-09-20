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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card key={batch._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {batch.coverPhoto ? (
                    <Image
                      src={batch.coverPhoto}
                      alt={batch.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <Badge className={`absolute top-3 right-3 ${getStatusColor(batch.status)}`}>
                    {getStatusText(batch.status)}
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{batch.name}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {batch.courseType}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{batch.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Mentor Info */}
                  <div className="flex items-center gap-3">
                    {batch.mentorId.avatar ? (
                      <Image
                        src={batch.mentorId.avatar}
                        alt={batch.mentorId.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{batch.mentorId.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{batch.mentorId.name}</p>
                      <p className="text-xs text-gray-500">{batch.mentorId.designation}</p>
                    </div>
                    {batch.mentorId.rating && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{batch.mentorId.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Duration & Dates */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{batch.duration} {batch.durationUnit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(batch.startDate)}</span>
                    </div>
                  </div>

                  {/* Students Count */}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{batch.currentStudents}/{batch.maxStudents} students</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      {batch.discountPrice ? (
                        <div>
                          <span className="text-2xl font-bold text-orange-600">
                            ৳{formatPrice(batch.discountPrice)}
                          </span>
                          <span className="text-lg text-gray-500 line-through ml-2">
                            ৳{formatPrice(batch.regularPrice)}
                          </span>
                          {batch.discountPercentage && (
                            <Badge variant="destructive" className="ml-2">
                              {batch.discountPercentage}% OFF
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-orange-600">
                          ৳{formatPrice(batch.regularPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {batch.marketing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {batch.marketing.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {batch.marketing.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{batch.marketing.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/batches/${batch.marketing.slug}`}>
                    <Button className="w-full">
                      বিস্তারিত দেখুন
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
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
