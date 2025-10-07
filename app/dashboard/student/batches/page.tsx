'use client';

import { useState, useEffect } from 'react';
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
  MessageSquare
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
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  progress: number;
  lastAccessed: string;
  amount: number;
}

export default function StudentBatchesPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentBatches();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          <span>Loading your batches...</span>
        </div>
      </div>
    );
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

      {/* Batches Grid - Card System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <Link
            key={batch._id}
            href={`/dashboard/student/batches/${batch.batch._id}`}
            className="block"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-500 cursor-pointer">
              {/* Cover Photo */}
              <div className="relative h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-lg overflow-hidden">
                {batch.batch.coverPhoto ? (
                  <img
                    src={batch.batch.coverPhoto}
                    alt={batch.batch.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Badge className={getStatusColor(batch.status)}>
                    {getStatusText(batch.status)}
                  </Badge>
                  <Badge className={getPaymentStatusColor(batch.paymentStatus)}>
                    {getPaymentStatusText(batch.paymentStatus)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Batch Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {batch.batch.name}
                </h3>

                {/* Batch Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {batch.batch.description}
                </p>

                {/* Mentor Info */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{batch.batch.mentorId.name}</p>
                    <p className="text-xs text-gray-500">{batch.batch.mentorId.designation}</p>
                  </div>
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video className="h-4 w-4 text-blue-500" />
                    <span>{batch.batch.courseType === 'online' ? 'Online' : 'Offline'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span>{batch.batch.duration} {batch.batch.durationUnit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>{formatBanglaDate(batch.enrollmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span>{formatBanglaCurrency(batch.amount)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{batch.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${batch.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Warning for Pending Status */}
                {batch.status === 'pending' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Pending Approval</p>
                        <p className="text-xs text-yellow-700">Admin review required to access course</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className={`w-full ${
                    batch.status === 'approved' 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={batch.status !== 'approved'}
                >
                  {batch.status === 'approved' ? (
                    <>
                      Continue Learning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Awaiting Approval
                      <Clock className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
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