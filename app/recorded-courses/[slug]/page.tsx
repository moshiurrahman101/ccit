'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Loader2, Lock, CheckCircle, Play, Clock } from 'lucide-react';
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
  mentors?: Array<{
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience?: number;
    expertise?: string[];
  }>;
}

interface Enrollment {
  _id: string;
  status: string;
  paymentStatus: string;
  progress: Array<{
    videoId: string;
    completed: boolean;
  }>;
}

export default function RecordedCoursePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [course, setCourse] = useState<RecordedCourse | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (course) {
      checkEnrollment();
    }
  }, [course]);

  // If no preview video selected but preview videos exist, select first one
  useEffect(() => {
    if (course && !selectedVideo && course.videos) {
      const previewVideos = course.videos.filter(v => v.isPreview);
      const sortedVideos = [...previewVideos].sort((a, b) => a.order - b.order);
      if (sortedVideos.length > 0) {
        setSelectedVideo(sortedVideos[0].youtubeVideoId);
      }
    }
  }, [course]);

  const fetchCourse = async () => {
    try {
      // Try direct fetch by slug/ID (public access)
      const response = await fetch(`/api/recorded-courses/${slug}?public=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.course) {
          console.log('Course data received:', data.course);
          console.log('Mentors:', data.course.mentors);
          setCourse(data.course);
          // Set first video as selected
          if (data.course.videos && data.course.videos.length > 0) {
            setSelectedVideo(data.course.videos[0].youtubeVideoId);
          }
        }
      } else {
        toast.error('কোর্স পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('কোর্স লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setHasAccess(false);
        return;
      }

      // Check if user is enrolled
      const response = await fetch(`/api/student/recorded-courses/${course?._id || slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // If user is enrolled, redirect to dashboard
        if (data.course && data.enrollment) {
          toast.info('আপনি এই কোর্সে এনরোল করেছেন। ড্যাশবোর্ডে যাচ্ছেন...');
          setTimeout(() => {
            window.location.href = `/dashboard/student/recorded-courses/${data.course._id}`;
          }, 1500);
          return;
        }
      } else if (response.status === 403) {
        // User is not enrolled, show only preview videos
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;

    setIsEnrolling(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('লগইন প্রয়োজন');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/recorded-courses/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: course._id })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('এনরোলমেন্ট সফল হয়েছে। পেমেন্ট সম্পন্ন করুন।');
        window.location.href = '/dashboard/student/payment';
      } else {
        toast.error(data.error || 'এনরোলমেন্ট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsEnrolling(false);
    }
  };

  const getVideoProgress = (videoId: string) => {
    if (!enrollment) return null;
    return enrollment.progress.find(p => p.videoId === videoId);
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

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">কোর্স পাওয়া যায়নি</h3>
          <Link href="/recorded-courses">
            <Button>কোর্স ব্রাউজ করুন</Button>
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = course.discountPrice || course.regularPrice;
  // Only show preview videos on public page
  const previewVideos = course ? course.videos.filter(v => v.isPreview) : [];
  const sortedVideos = [...previewVideos].sort((a, b) => a.order - b.order);
  const selectedVideoData = sortedVideos.find(v => v.youtubeVideoId === selectedVideo);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
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

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>প্রয়োজনীয়তা</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
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
                <div>
                  <div className="text-sm text-gray-600 mb-1">মূল্য</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-600">
                      ৳{finalPrice.toLocaleString()}
                    </span>
                    {course.discountPrice && (
                      <span className="text-gray-500 line-through">
                        ৳{course.regularPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

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
                </div>

                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      এনরোল হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      এখনই এনরোল করুন
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Mentors */}
            {course.mentors && course.mentors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">মেন্টরগণ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.mentors.map((mentor) => (
                      <div key={mentor._id} className="flex items-center gap-3">
                        {mentor.avatar ? (
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{mentor.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold">{mentor.name}</h4>
                          <p className="text-sm text-gray-600">{mentor.designation}</p>
                          {mentor.experience && (
                            <p className="text-xs text-gray-500">{mentor.experience} বছর অভিজ্ঞতা</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video List - Only Preview Videos */}
            <Card>
              <CardHeader>
                <CardTitle>প্রিভিউ ভিডিও</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sortedVideos.length > 0 ? (
                    sortedVideos.map((video, index) => {
                      const progress = getVideoProgress(video.youtubeVideoId);
                      
                      return (
                        <button
                          key={video.youtubeVideoId}
                          onClick={() => setSelectedVideo(video.youtubeVideoId)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedVideo === video.youtubeVideoId
                              ? 'bg-orange-50 border-orange-500'
                              : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {progress?.completed ? (
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
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                  প্রিভিউ
                                </span>
                              </div>
                              {video.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {video.duration} মিনিট
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>প্রিভিউ ভিডিও নেই। কোর্সে এনরোল করুন সমস্ত ভিডিও দেখতে।</p>
                    </div>
                  )}
                </div>
                {course.videos.length > previewVideos.length && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-center text-sm text-gray-600">
                      <Lock className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                      <p>{course.videos.length - previewVideos.length} টি অতিরিক্ত ভিডিও</p>
                      <p className="text-xs mt-1">এনরোল করে সমস্ত ভিডিও দেখুন</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

