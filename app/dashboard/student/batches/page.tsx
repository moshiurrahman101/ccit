'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Clock, 
  Video, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  MessageSquare,
  Loader2,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatBanglaNumber, formatBanglaDate, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';

interface StudentBatch {
  _id: string;
  batch: {
    _id: string;
    name: string;
    description: string;
    coverPhoto?: string;
    courseType: 'online' | 'offline';
    regularPrice: number;
    discountPrice?: number;
    mentorId: {
      _id: string;
      name: string;
      avatar?: string;
      designation: string;
    };
    duration: number;
    durationUnit: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    currentStudents: number;
    status: string;
  };
  enrollmentDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
  progress: number;
  lastAccessed: string;
  amount: number;
}

export default function StudentBatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');
  const [isCheckingApproval, setIsCheckingApproval] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'student' && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      } else if (user.role === 'student') {
        checkApprovalStatus();
      } else {
        setIsCheckingApproval(false);
        fetchStudentBatches();
      }
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
        
        fetchStudentBatches();
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const fetchStudentBatches = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/student/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }

      const data = await response.json();
      console.log('=== STUDENT BATCHES DATA ===');
      console.log('Batches received:', data.batches?.length);
      if (data.batches && data.batches.length > 0) {
        console.log('First batch status:', data.batches[0].status);
        console.log('First batch paymentStatus:', data.batches[0].paymentStatus);
      }
      setBatches(data.batches || []);
      
    } catch (error) {
      console.error('Error fetching student batches:', error);
      toast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Awaiting Approval';
      case 'approved': return 'Active';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'dropped': return 'Dropped';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'পেমেন্ট বাকি';
      case 'paid': return 'পরিশোধিত';
      case 'failed': return 'ব্যর্থ';
      case 'refunded': return 'ফেরত';
      default: return status;
    }
  };

  if (authLoading || isCheckingApproval || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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

  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Enrolled Batches</h2>
        <p className="text-gray-600 mb-6">You haven't enrolled in any batches yet.</p>
        <Link href="/batches">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Browse Available Batches
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const activeBatches = batches.filter(b => b.status === 'approved').length;
  const pendingApproval = batches.filter(b => b.status === 'pending').length;
  const avgProgress = batches.length > 0 
    ? Math.round(batches.reduce((sum, b) => sum + b.progress, 0) / batches.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Batches</h1>
        <p className="text-gray-600 mt-2">Manage your enrolled courses and track your progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(batches.length)}</div>
            <p className="text-xs text-gray-600">All enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(activeBatches)}</div>
            <p className="text-xs text-gray-600">Approved & ongoing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(pendingApproval)}</div>
            <p className="text-xs text-gray-600">Awaiting admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(avgProgress)}%</div>
            <p className="text-xs text-gray-600">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Batches Grid - Google Classroom Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => {
          // Determine link based on payment status
          const linkHref = batch.paymentStatus === 'pending' 
            ? '/dashboard/student/payment'
            : `/dashboard/student/batches/${batch.batch._id}`;
          
          return (
          <Link
            key={batch._id}
            href={linkHref}
            className="block"
          >
            <Card className="h-full hover:shadow-md transition-all duration-200 border rounded-lg overflow-hidden cursor-pointer group">
              {/* Simple Header Strip - Google Classroom Style */}
              <div className="h-24 bg-gradient-to-r from-orange-500 to-orange-600 relative">
                {batch.batch.coverPhoto && (
                  <img
                    src={batch.batch.coverPhoto}
                    alt={batch.batch.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                )}
                {/* Status Badge - Top Right */}
                <div className="absolute top-2 right-2">
                  {batch.paymentStatus === 'pending' ? (
                    <Badge className="bg-yellow-500 text-white text-xs">
                      পেমেন্ট বাকি
                    </Badge>
                  ) : batch.paymentStatus === 'paid' || batch.paymentStatus === 'partial' ? (
                    <Badge className="bg-green-500 text-white text-xs">
                      Active
                    </Badge>
                  ) : batch.status === 'pending' ? (
                    <Badge className="bg-blue-500 text-white text-xs">
                      অনুমোদনের অপেক্ষায়
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500 text-white text-xs">
                      {batch.status}
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                {/* Course Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {batch.batch.name}
                </h3>

                {/* Teacher Name */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-3 w-3 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {batch.batch.mentorId?.name || 'Mentor Information Unavailable'}
                  </p>
                </div>

                {/* Simple Status Indicator */}
                {batch.paymentStatus === 'pending' && (
                  <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800 font-medium">পেমেন্ট প্রয়োজন</p>
                  </div>
                )}

                {/* Progress - Simple */}
                {(batch.paymentStatus === 'paid' || batch.paymentStatus === 'partial') && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{batch.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-orange-600 h-1.5 rounded-full transition-all" 
                        style={{ width: `${batch.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </div>

      {/* Add More Batches Card */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-orange-500 transition-all duration-300">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enroll in More Batches</h3>
          <p className="text-gray-600 mb-4">Explore our available courses and expand your learning journey</p>
          <Link href="/batches">
            <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
              Browse Available Batches
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}