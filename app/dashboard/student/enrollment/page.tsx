'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  Loader2,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  User,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatBanglaNumber, formatBanglaDate, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';

interface EnrolledBatch {
  _id: string;
  invoiceNumber: string;
  batchId: string;
  batchName: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  batchDetails?: {
    _id: string;
    name: string;
    description: string;
    coverPhoto?: string;
    courseType: 'online' | 'offline';
    mentorId: {
      _id: string;
      name: string;
      avatar?: string;
      designation: string;
    };
    duration: number;
    durationUnit: 'days' | 'weeks' | 'months' | 'years';
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface AvailableBatch {
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
}

export default function EnrollmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [enrolledBatches, setEnrolledBatches] = useState<EnrolledBatch[]>([]);
  const [availableBatches, setAvailableBatches] = useState<AvailableBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseTypeFilter, setCourseTypeFilter] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');
  const [isCheckingApproval, setIsCheckingApproval] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'student' && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      } else if (user.role === 'student') {
        checkApprovalStatus();
      } else {
        setIsCheckingApproval(false);
        fetchEnrolledBatches();
        fetchAvailableBatches();
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const checkApprovalStatus = async () => {
    try {
      setIsCheckingApproval(true);
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.user) {
        const status = data.user.approvalStatus || 'pending';
        setApprovalStatus(status);
        
        if (status !== 'approved') {
          router.push('/dashboard/student');
          return;
        }
        
        fetchEnrolledBatches();
        fetchAvailableBatches();
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const fetchEnrolledBatches = async () => {
    try {
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
      };
      
      const token = getCookie('auth-token');
      console.log('Fetching enrolled batches with token:', token ? 'present' : 'missing');

      const response = await fetch('/api/students/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched enrolled batches:', data.invoices);
        setEnrolledBatches(data.invoices || []);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching enrolled batches:', error);
    }
  };

  const fetchAvailableBatches = async () => {
    try {
      const response = await fetch('/api/public/batches?limit=20');
      if (response.ok) {
        const data = await response.json();
        setAvailableBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching available batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAlreadyEnrolled = (batchId: string) => {
    const isEnrolled = enrolledBatches.some(enrollment => {
      const enrollmentBatchId = typeof enrollment.batchId === 'string' ? enrollment.batchId : (enrollment.batchId as any)?._id;
      return enrollmentBatchId === batchId;
    });
    console.log('Checking enrollment for batch:', batchId);
    console.log('Available enrollments:', enrolledBatches.map(e => typeof e.batchId === 'string' ? e.batchId : (e.batchId as any)?._id));
    console.log('Is enrolled:', isEnrolled);
    return isEnrolled;
  };

  const handleEnroll = async (batchId: string, batchName: string) => {
    try {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        },
        body: JSON.stringify({ batchId })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully enrolled in ${batchName}! Please complete payment to access the course.`);
        await fetchEnrolledBatches(); // Refresh enrolled batches
        await fetchAvailableBatches(); // Refresh available batches
      } else {
        const errorData = await response.json();
        console.log('Enrollment failed:', errorData);
        alert(errorData.error || 'Enrollment failed. Please try again.');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Enrollment failed. Please try again.');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'পরিশোধিত';
      case 'partial': return 'আংশিক পরিশোধিত';
      case 'pending': return 'অপেক্ষমান';
      case 'overdue': return 'মেয়াদ উত্তীর্ণ';
      case 'published': return 'প্রকাশিত';
      case 'upcoming': return 'আসন্ন';
      case 'ongoing': return 'চলমান';
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

  const filteredAvailableBatches = availableBatches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || !statusFilter || batch.status === statusFilter;
    const matchesType = courseTypeFilter === 'all' || !courseTypeFilter || batch.courseType === courseTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading || isCheckingApproval) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span>লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (user?.role !== 'student' && user?.role !== 'admin') {
    return null;
  }

  if (user?.role === 'student' && approvalStatus !== 'approved') {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">এনরোলমেন্ট ম্যানেজমেন্ট</h1>
        <p className="text-gray-600 mt-2">আপনার নিবন্ধিত কোর্স দেখুন এবং নতুন কোর্সে এনরোল করুন</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">নিবন্ধিত কোর্স</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(enrolledBatches.length)}</div>
            <p className="text-xs text-gray-600">
              মোট কোর্স
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পরিশোধিত কোর্স</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBanglaNumber(enrolledBatches.filter(batch => batch.status === 'paid').length)}
            </div>
            <p className="text-xs text-gray-600">
              সম্পূর্ণ পরিশোধিত
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">উপলব্ধ কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(availableBatches.length)}</div>
            <p className="text-xs text-gray-600">
              নতুন এনরোলমেন্টের জন্য
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'enrolled'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <GraduationCap className="h-4 w-4 inline mr-2" />
            আমার কোর্সসমূহ ({enrolledBatches.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            নতুন কোর্সে এনরোল করুন ({availableBatches.length})
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'enrolled' ? (
        <div>
          {enrolledBatches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">কোন কোর্সে নিবন্ধিত নন</h3>
                <p className="text-gray-600 mb-6">আপনি এখনো কোন কোর্সে নিবন্ধিত হননি। নতুন কোর্সে এনরোল করুন!</p>
                <Button 
                  onClick={() => setActiveTab('available')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন কোর্সে এনরোল করুন
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledBatches.map((enrollment) => (
                <Card key={enrollment._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{enrollment.batchName}</CardTitle>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {getStatusText(enrollment.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">ইনভয়েস #: {enrollment.invoiceNumber}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">পরিমাণ:</span>
                      <span className="font-semibold">৳{formatPrice(enrollment.finalAmount)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">মেয়াদ:</span>
                      <span className="text-sm">{formatDate(enrollment.dueDate)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">নিবন্ধনের তারিখ:</span>
                      <span className="text-sm">{formatDate(enrollment.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/invoices/${enrollment._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          ইনভয়েস দেখুন
                        </Button>
                      </Link>
                      {enrollment.status === 'pending' ? (
                        <Link href="/dashboard/student/payment" className="flex-1">
                          <Button 
                            size="sm" 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            পেমেন্ট জমা দিন
                          </Button>
                        </Link>
                      ) : enrollment.status === 'paid' ? (
                        <Link href="/dashboard/student/batches" className="flex-1">
                          <Button 
                            size="sm" 
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            কোর্সে যান
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                          disabled
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {getStatusText(enrollment.status)}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Filters for available batches */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="কোর্স খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="স্ট্যাটাস দিয়ে ফিল্টার করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                    <SelectItem value="published">প্রকাশিত</SelectItem>
                    <SelectItem value="upcoming">আসন্ন</SelectItem>
                    <SelectItem value="ongoing">চলমান</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
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
            </CardContent>
          </Card>

          {/* Available batches */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
            </div>
          ) : filteredAvailableBatches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">কোন কোর্স পাওয়া যায়নি</h3>
                <p className="text-gray-600">আপনার অনুসন্ধান মানদণ্ড সামঞ্জস্য করার চেষ্টা করুন।</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableBatches.map((batch) => (
                <Card key={batch._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {batch.coverPhoto && batch.coverPhoto.trim() !== '' ? (
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
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-orange-600">
                            ৳{formatPrice(batch.regularPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/batches/${batch.marketing.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          বিস্তারিত
                        </Button>
                      </Link>
                      {isAlreadyEnrolled(batch._id) ? (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white cursor-default"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          আপনি ইতিমধ্যে এনরোল করেছেন
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => handleEnroll(batch._id, batch.name)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          এনরোল করুন
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
