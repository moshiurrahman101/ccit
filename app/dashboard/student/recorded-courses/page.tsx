'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Loader2, 
  Play, 
  Clock, 
  CheckCircle,
  Lock,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';

interface EnrolledCourse {
  enrollment: {
    _id: string;
    enrollmentDate: string;
    status: string;
    paymentStatus: string;
    overallProgress: number;
    lastAccessed: string;
    progress: Array<{
      videoId: string;
      completed: boolean;
      watchedDuration: number;
    }>;
  };
  course: {
    _id: string;
    title: string;
    description: string;
    coverPhoto?: string;
    regularPrice: number;
    discountPrice?: number;
    videos: Array<{
      title: string;
      youtubeVideoId: string;
      order: number;
      isPreview: boolean;
    }>;
    category: string;
    level: string;
    duration: number;
    durationUnit: string;
    slug: string;
  };
}

export default function StudentRecordedCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
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
        fetchCourses();
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
        
        fetchCourses();
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token') || 
                    document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/student/recorded-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        if (response.status === 401) {
          toast.error('সেশন শেষ হয়ে গেছে। আবার লগইন করুন');
          localStorage.removeItem('auth-token');
          router.push('/login');
        } else {
          toast.error(data.error || 'কোর্স লোড করতে সমস্যা হয়েছে');
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (course: EnrolledCourse) => {
    return course.enrollment.overallProgress || 0;
  };

  const getCompletedVideosCount = (course: EnrolledCourse) => {
    return course.enrollment.progress.filter(p => p.completed).length;
  };

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      'web-development': 'ওয়েব ডেভেলপমেন্ট',
      'data-science': 'ডেটা সায়েন্স',
      'mobile-development': 'মোবাইল ডেভেলপমেন্ট',
      'design': 'ডিজাইন',
      'marketing': 'মার্কেটিং',
      'other': 'অন্যান্য'
    };
    return categories[category] || category;
  };

  const getLevelText = (level: string) => {
    const levels: Record<string, string> = {
      'beginner': 'শুরু',
      'intermediate': 'মধ্যম',
      'advanced': 'উন্নত'
    };
    return levels[level] || level;
  };

  if (loading || isCheckingApproval) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (user?.role === 'student' && approvalStatus !== 'approved') {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">আমার রেকর্ড করা কোর্স</h1>
        <p className="text-gray-600 mt-2">আপনার এনরোল করা প্রাক-রেকর্ড করা কোর্সসমূহ</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">কোনো কোর্স নেই</h3>
            <p className="text-gray-600 mb-4">আপনি এখনও কোনো রেকর্ড করা কোর্সে এনরোল করেননি</p>
            <Link href="/recorded-courses">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <BookOpen className="h-4 w-4 mr-2" />
                কোর্স ব্রাউজ করুন
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((item) => {
            const course = item.course;
            const enrollment = item.enrollment;
            const progress = getProgressPercentage(item);
            const completedVideos = getCompletedVideosCount(item);
            const totalVideos = course.videos.length;

            return (
              <Card key={course._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  {course.coverPhoto ? (
                    <img
                      src={course.coverPhoto}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Video className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      এনরোল করা
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ভিডিও:</span>
                      <span className="font-semibold">{totalVideos} টি</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">সম্পন্ন:</span>
                      <span className="font-semibold text-green-600">
                        {completedVideos}/{totalVideos}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">অগ্রগতি</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getCategoryText(course.category)}</span>
                      <span>•</span>
                      <span>{getLevelText(course.level)}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Link
                        href={`/dashboard/student/recorded-courses/${course._id}`}
                        className="flex-1 text-center px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                      >
                        <Play className="h-4 w-4 inline mr-2" />
                        কোর্স দেখুন
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

