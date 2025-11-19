'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Loader2, Lock, CheckCircle, Play, Clock, ArrowLeft } from 'lucide-react';
import SecureVideoPlayer from '@/components/course/SecureVideoPlayer';
import { toast } from 'sonner';
import Link from 'next/link';

interface RecordedCourse {
  _id: string;
  title: string;
  description: string;
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  videos: Array<{
    title: string;
    description?: string;
    youtubeVideoId: string;
    duration?: number;
    order: number;
    isPreview: boolean;
  }>;
  whatYouWillLearn: string[];
  requirements: string[];
  category: string;
  level: string;
  duration: number;
  durationUnit: string;
}

interface Enrollment {
  _id: string;
  status: string;
  paymentStatus: string;
  overallProgress: number;
  progress: Array<{
    videoId: string;
    completed: boolean;
    watchedDuration: number;
  }>;
}

export default function StudentRecordedCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<RecordedCourse | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth-token') || 
                    document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        router.push('/login');
        return;
      }

      // Fetch course with enrollment data
      const response = await fetch(`/api/student/recorded-courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        if (data.course && data.enrollment) {
          setCourse(data.course);
          setEnrollment(data.enrollment);
          // Set first video as selected
          if (data.course.videos && data.course.videos.length > 0) {
            setSelectedVideo(data.course.videos[0].youtubeVideoId);
          }
        } else {
          toast.error('কোর্স পাওয়া যায়নি বা আপনি এনরোল করেননি');
          router.push('/dashboard/student/recorded-courses');
        }
      } else {
        if (response.status === 401) {
          toast.error('সেশন শেষ হয়ে গেছে। আবার লগইন করুন');
          localStorage.removeItem('auth-token');
          router.push('/login');
        } else if (response.status === 403) {
          toast.error('আপনি এই কোর্সে এনরোল করেননি');
          router.push('/dashboard/student/recorded-courses');
        } else {
          toast.error(data.error || 'কোর্স লোড করতে সমস্যা হয়েছে');
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsLoading(false);
    }
  };

  const getVideoProgress = (videoId: string) => {
    if (!enrollment) return null;
    return enrollment.progress.find(p => p.videoId === videoId);
  };

  const handleVideoProgress = async (videoId: string, progress: number) => {
    // Update progress on server
    try {
      const token = localStorage.getItem('auth-token') || 
                    document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      
      if (!token) return;

      const isCompleted = progress >= 90; // Consider 90% as completed
      const watchedDuration = Math.floor(progress); // Convert to seconds (simplified)

      await fetch(`/api/student/recorded-courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId,
          watchedDuration,
          completed: isCompleted
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoComplete = async (videoId: string) => {
    await handleVideoProgress(videoId, 100);
    // Refresh enrollment data
    fetchCourse();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">কোর্স পাওয়া যায়নি</h3>
          <p className="text-gray-600 mb-4">আপনি এই কোর্সে এনরোল করেননি</p>
          <Link href="/dashboard/student/recorded-courses">
            <Button>আমার কোর্সে ফিরে যান</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedVideos = [...course.videos].sort((a, b) => a.order - b.order);
  const selectedVideoData = sortedVideos.find(v => v.youtubeVideoId === selectedVideo);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/student/recorded-courses">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              আমার কোর্সে ফিরে যান
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">অগ্রগতি: {enrollment.overallProgress}%</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                {selectedVideoData ? (
                  <SecureVideoPlayer
                    courseId={course._id}
                    videoId={selectedVideoData.youtubeVideoId}
                    title={selectedVideoData.title}
                    isPreview={selectedVideoData.isPreview}
                    onProgress={(progress) => {
                      if (selectedVideoData.youtubeVideoId) {
                        handleVideoProgress(selectedVideoData.youtubeVideoId, progress);
                      }
                    }}
                    onComplete={() => {
                      if (selectedVideoData.youtubeVideoId) {
                        handleVideoComplete(selectedVideoData.youtubeVideoId);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>ভিডিও নির্বাচন করুন</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle>কোর্সের বিবরণ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* What You Will Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>আপনি যা শিখবেন</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.whatYouWillLearn.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>কোর্স তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ভিডিও সংখ্যা:</span>
                    <span className="font-semibold">{course.videos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">সময়কাল:</span>
                    <span className="font-semibold">{course.duration} {course.durationUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">লেভেল:</span>
                    <span className="font-semibold capitalize">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">অগ্রগতি:</span>
                    <span className="font-semibold text-orange-600">{enrollment.overallProgress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video List */}
            <Card>
              <CardHeader>
                <CardTitle>ভিডিও তালিকা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sortedVideos.map((video, index) => {
                    const progress = getVideoProgress(video.youtubeVideoId);
                    const isCompleted = progress?.completed || false;
                    const isSelected = selectedVideo === video.youtubeVideoId;
                    
                    return (
                      <button
                        key={video.youtubeVideoId}
                        onClick={() => setSelectedVideo(video.youtubeVideoId)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Play className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {index + 1}. {video.title}
                              </span>
                              {video.isPreview && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                  প্রিভিউ
                                </span>
                              )}
                            </div>
                            {video.duration && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {video.duration} মিনিট
                              </div>
                            )}
                            {progress && progress.watchedDuration > 0 && (
                              <div className="mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-orange-600 h-1 rounded-full"
                                    style={{ width: `${Math.min(100, (progress.watchedDuration / (video.duration || 60)) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

