'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, Clock, Star, CheckCircle, ArrowLeft, Loader2, ExternalLink, Github, Linkedin, Briefcase, Timer, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

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
    email: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
    skills: string[];
    bio: string;
    socialLinks: {
      linkedin?: string;
      github?: string;
      website?: string;
    };
    rating?: number;
    studentsCount?: number;
    coursesCount?: number;
  };
  modules: {
    title: string;
    description: string;
    duration: number;
    order: number;
  }[];
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
}

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (params.slug) {
      fetchBatch(params.slug as string);
    }
  }, [params.slug]);

  const checkEnrollmentStatus = async () => {
    try {
      // Use the new debug endpoint for more reliable checking
      const response = await fetch(`/api/students/check-enrollment/${batch?._id}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Direct enrollment check result:', data);
        setIsAlreadyEnrolled(data.isEnrolled || false);
      } else {
        console.log('Failed to check enrollment status:', response.status);
        setIsAlreadyEnrolled(false);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setIsAlreadyEnrolled(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!batch?.startDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startDate = new Date(batch.startDate).getTime();
      const difference = startDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [batch?.startDate]);

  const fetchBatch = async (slug: string) => {
    setIsLoading(true);
    try {
      // Use absolute URL to ensure it works in all environments
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/batches/slug/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache control for better performance
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ব্যাচটি পাওয়া যায়নি');
        } else if (response.status === 401) {
          throw new Error('অনুমতি নেই');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();

      if (data.batch) {
        setBatch(data.batch);
        // Check enrollment status after batch is loaded
        setTimeout(() => checkEnrollmentStatus(), 100);
      } else {
        setError(data.error || 'Batch not found');
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
      setError('Failed to load batch. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollClick = async () => {
    setIsCheckingAuth(true);
    try {
      // Check if user is authenticated
      const authResponse = await fetch('/api/auth/check');
      const authData = await authResponse.json();
      
      if (authData.authenticated) {
        // User is authenticated, proceed with enrollment
        try {
          // Get token from cookies more reliably
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return '';
          };
          
          const token = getCookie('auth-token');
          
          const enrollmentResponse = await fetch('/api/enrollment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              batchId: batch?._id
            })
          });

          if (enrollmentResponse.ok) {
            const successData = await enrollmentResponse.json();
            // Enrollment successful, show success message and redirect to dashboard
            alert(`Successfully enrolled in ${batch?.name}! Redirecting to dashboard...`);
            router.push('/dashboard');
          } else {
            const errorData = await enrollmentResponse.json();
            alert(errorData.error || 'Enrollment failed. Please try again.');
          }
        } catch (enrollmentError) {
          console.error('Enrollment error:', enrollmentError);
          alert('Enrollment failed. Please try again.');
        }
      } else {
        // User is not authenticated, redirect to registration
        router.push(`/register?redirect=/batches/${batch?.marketing.slug}`);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.push(`/register?redirect=/batches/${batch?.marketing.slug}`);
    } finally {
      setIsCheckingAuth(false);
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getDurationText = (duration: number, unit: string) => {
    return `${duration} ${unit}${duration > 1 ? 's' : ''}`;
  };

  const isCourseStarted = () => {
    if (!batch?.startDate) return false;
    return new Date().getTime() >= new Date(batch.startDate).getTime();
  };

  const isCountdownActive = () => {
    if (!batch?.startDate) return false;
    const now = new Date().getTime();
    const startDate = new Date(batch.startDate).getTime();
    return startDate > now;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Batch Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The batch you are looking for does not exist.'}</p>
          <Link href="/batches">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/batches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Photo */}
            {batch.coverPhoto && (
              <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={batch.coverPhoto}
                  alt={batch.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}

            {/* Enhanced Heading and Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Badge className={`${getStatusColor(batch.status)} text-sm px-3 py-1`}>
                  {getStatusText(batch.status)}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {batch.courseType}
                </Badge>
                {batch.discountPrice && (
                  <Badge variant="destructive" className="text-sm px-3 py-1 animate-pulse">
                    {batch.discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  {batch.name}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl">
                  {batch.description}
                </p>
                
                {/* Key Benefits */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Live Sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Job Placement</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Lifetime Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Duration & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Duration</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{getDurationText(batch.duration, batch.durationUnit)}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Schedule</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(batch.startDate)} - {formatDate(batch.endDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Students Count */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Capacity</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{batch.currentStudents} / {batch.maxStudents} students enrolled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${(batch.currentStudents / batch.maxStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Syllabus */}
            <Card>
              <CardHeader>
                <CardTitle>Syllabus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batch.modules.map((module, index) => (
                    <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        <span className="text-sm text-gray-500">{module.duration}h</span>
                      </div>
                      <p className="text-gray-600 mt-1">{module.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {batch.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            {batch.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {batch.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {batch.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {batch.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Opportunities Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-6 w-6" />
                  Job Opportunities & Career Support
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Fiverr */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">F</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Fiverr</h4>
                        <p className="text-sm text-gray-600">Freelancing Platform</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Start your freelancing career with high-paying gigs on Fiverr
                    </p>
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Profile Setup Support</span>
                    </div>
                  </div>

                  {/* Upwork */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">U</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Upwork</h4>
                        <p className="text-sm text-gray-600">Global Marketplace</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Connect with international clients and build your portfolio
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Proposal Writing</span>
                    </div>
                  </div>

                  {/* Local & International Jobs */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-purple-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">L</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Job Placement</h4>
                        <p className="text-sm text-gray-600">Direct Placement</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Direct placement in local and international companies
                    </p>
                    <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Interview Prep</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 border border-orange-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-1">Complete Career Support</h4>
                      <p className="text-sm text-orange-700">
                        All our courses include freelancing guidance, job placement support, and ongoing mentorship to help you succeed in your career.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mentor Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Star className="h-6 w-6" />
                  মেন্টর সম্পর্কে
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  {batch.mentorId.avatar ? (
                    <Image
                      src={batch.mentorId.avatar}
                      alt={batch.mentorId.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl font-bold text-white">{batch.mentorId.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{batch.mentorId.name}</h4>
                    <p className="text-lg text-blue-600 font-semibold mb-1">{batch.mentorId.designation}</p>
                    <p className="text-gray-600 mb-3">{batch.mentorId.experience} বছর অভিজ্ঞতা</p>
                    {batch.mentorId.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="text-lg font-bold text-gray-900">{batch.mentorId.rating}</span>
                        </div>
                        <span className="text-gray-600">
                          ({batch.mentorId.studentsCount || 0} জন ছাত্র)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {batch.mentorId.bio && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-gray-700 leading-relaxed">{batch.mentorId.bio}</p>
                  </div>
                )}

                {/* Expertise */}
                <div>
                  <h5 className="text-lg font-bold text-gray-900 mb-3">দক্ষতা</h5>
                  <div className="flex flex-wrap gap-2">
                    {batch.mentorId.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {batch.mentorId.socialLinks.linkedin && (
                    <Button variant="outline" size="lg" asChild className="flex items-center gap-2">
                      <a href={batch.mentorId.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-5 w-5" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {batch.mentorId.socialLinks.github && (
                    <Button variant="outline" size="lg" asChild className="flex items-center gap-2">
                      <a href={batch.mentorId.socialLinks.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {batch.mentorId.socialLinks.website && (
                    <Button variant="outline" size="lg" asChild className="flex items-center gap-2">
                      <a href={batch.mentorId.socialLinks.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-5 w-5" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {batch.marketing.tags.length > 0 && (
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-6 w-6" />
                    ট্যাগসমূহ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {batch.marketing.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Pricing Card with Countdown */}
            <Card className="sticky top-6 bg-gradient-to-br from-orange-50 via-white to-orange-50 shadow-2xl border-2 border-orange-200 overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 via-transparent to-orange-100/20 animate-pulse"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/30 to-transparent rounded-full blur-xl animate-pulse delay-1000"></div>
              
              <CardHeader className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 animate-pulse"></div>
                <div className="relative flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 animate-pulse" />
                    {isCourseStarted() ? 'কোর্স শুরু হয়েছে' : 'কোর্স শীঘ্রই শুরু হবে'}
                  </CardTitle>
                  {batch.discountPrice && (
                    <Badge className="bg-red-500 hover:bg-red-600 animate-bounce text-xs shadow-lg">
                      {batch.discountPercentage}% ছাড়
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4 p-4">
                {/* Countdown Timer */}
                {isCountdownActive() && (
                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg p-3 border border-orange-300">
                    <div className="text-center mb-2">
                      <h3 className="font-semibold text-orange-800 text-sm flex items-center justify-center gap-1">
                        <Timer className="h-3 w-3" />
                        কোর্স শুরু হবে:
                      </h3>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: 'দিন', value: timeLeft.days },
                        { label: 'ঘন্টা', value: timeLeft.hours },
                        { label: 'মিনিট', value: timeLeft.minutes },
                        { label: 'সেকেন্ড', value: timeLeft.seconds }
                      ].map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="bg-white rounded p-1.5 shadow-sm border border-orange-200">
                            <div className="text-lg font-bold text-orange-600 animate-pulse">
                              {item.value.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-orange-700 font-medium">
                              {item.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Section */}
                <div className="text-center space-y-2">
                  {batch.discountPrice ? (
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-orange-600 animate-pulse">
                        ৳{formatPrice(batch.discountPrice)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        ৳{formatPrice(batch.regularPrice)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-orange-600">
                      ৳{formatPrice(batch.regularPrice)}
                    </div>
                  )}
                </div>

                {/* Enrollment Button */}
                {isAlreadyEnrolled ? (
                  <Button 
                    className="w-full h-10 text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg" 
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    আপনি ইতিমধ্যে এনরোল করেছেন - ড্যাশবোর্ডে যান
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-10 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
                    onClick={handleEnrollClick}
                    disabled={isCheckingAuth}
                  >
                    {isCheckingAuth ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        চেক করা হচ্ছে...
                      </>
                    ) : isCourseStarted() ? (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        কোর্সে যোগ দিন
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        আপনার সিট বুক করুন
                      </>
                    )}
                  </Button>
                )}

                {/* Course Status */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>{batch.currentStudents}টি সিট নেওয়া হয়েছে {batch.maxStudents}টি থেকে</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min((batch.currentStudents / batch.maxStudents) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  {batch.currentStudents / batch.maxStudents > 0.8 && (
                    <p className="text-xs text-orange-600 font-medium animate-pulse">
                      ⚠️ সীমিত সিট!
                    </p>
                  )}
                </div>

                {/* Guarantee */}
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs font-medium">৩০ দিনের গ্যারান্টি</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}