'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Clock, Star, Award, CheckCircle, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverPhoto?: string;
  courseCode: string;
  courseShortcut: string;
  category: string;
  level: string;
  language: string;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  mentors: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
  }[];
  modules: {
    title: string;
    description: string;
    duration: number;
    order: number;
  }[];
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  createdAt: string;
}

interface Batch {
  _id: string;
  name: string;
  batchCode: string;
  courseType: 'online' | 'offline';
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  regularPrice?: number;
  discountPrice?: number;
  discountPercentage?: number;
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  mentorId: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/courses?slug=${params.slug}`);
        const data = await response.json();

        if (response.ok && data.courses.length > 0) {
          setCourse(data.courses[0]);
          
          // Fetch batches for this course
          const batchesResponse = await fetch(`/api/public/batches?courseId=${data.courses[0]._id}`);
          const batchesData = await batchesResponse.json();
          
          if (batchesResponse.ok) {
            setBatches(batchesData.batches || []);
          }
        } else {
          setError('কোর্স পাওয়া যায়নি');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('কোর্স লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchCourse();
    }
  }, [params.slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'web-development': 'Web Development',
      'data-science': 'Data Science',
      'mobile-development': 'Mobile Development',
      'design': 'Design',
      'marketing': 'Marketing',
      'other': 'Other'
    };
    return categories[category] || category;
  };

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    return levels[level] || level;
  };

  const getLanguageLabel = (language: string) => {
    const languages: { [key: string]: string } = {
      'bengali': 'Bengali',
      'english': 'English'
    };
    return languages[language] || language;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">কোর্স পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/courses">
            <Button>কোর্স তালিকায় ফিরে যান</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-orange-500 text-white px-3 py-1 text-sm">
                  {course.courseCode}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {getCategoryLabel(course.category)}
                </Badge>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              
              <p className="text-base md:text-lg mb-6 opacity-90 leading-relaxed">
                {course.shortDescription || course.description}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{getLevelLabel(course.level)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration} {course.durationUnit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.mentors.length} মেন্টর</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {course.coverPhoto ? (
                <img
                  src={course.coverPhoto}
                  alt={course.title}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <BookOpen className="h-24 w-24 mx-auto mb-4 opacity-80" />
                    <p className="text-xl font-medium opacity-90">{course.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">কোর্স সম্পর্কে</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">আপনি যা শিখবেন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Modules */}
            {course.modules && course.modules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">কোর্স মডিউল</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.modules
                      .sort((a, b) => a.order - b.order)
                      .map((module, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{module.title}</h4>
                            <span className="text-sm text-gray-500">{module.duration} ঘন্টা</span>
                          </div>
                          <p className="text-gray-600">{module.description}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">প্রয়োজনীয়তা</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">কোর্সের বৈশিষ্ট্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  মূল্য সম্পর্কে
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      ৳{formatPrice(course.regularPrice)}
                    </div>
                    {course.discountPrice && (
                      <div className="text-lg text-gray-600 line-through">
                        ৳{formatPrice(course.discountPrice)}
                      </div>
                    )}
                  </div>
                  <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        <p className="font-semibold mb-1">মূল্য পরিবর্তন হতে পারে</p>
                        <p>এই কোর্সের আসন্ন ব্যাচগুলোর মূল্য আলাদা হতে পারে। নিচে উপলব্ধ ব্যাচগুলো দেখুন।</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mentors */}
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
                        <p className="text-xs text-gray-500">{mentor.experience} বছর অভিজ্ঞতা</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Batches */}
            {batches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">উপলব্ধ ব্যাচ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {batches.slice(0, 3).map((batch) => (
                      <div key={batch._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{batch.name}</h4>
                          <Badge variant={batch.status === 'published' ? 'default' : 'secondary'}>
                            {batch.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>শুরু: {formatDate(batch.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{batch.currentStudents}/{batch.maxStudents} শিক্ষার্থী</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              ৳{formatPrice(batch.regularPrice || course.regularPrice)}
                              {batch.discountPrice && (
                                <span className="text-green-600 ml-2">
                                  (ছাড়: ৳{formatPrice(batch.discountPrice)})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        <Link href={`/batches/${batch._id}`}>
                          <Button size="sm" className="w-full mt-3">
                            বিস্তারিত দেখুন
                          </Button>
                        </Link>
                      </div>
                    ))}
                    {batches.length > 3 && (
                      <div className="text-center">
                        <Link href={`/batches?courseId=${course._id}`}>
                          <Button variant="outline" size="sm">
                            সব ব্যাচ দেখুন ({batches.length})
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">কোর্স তথ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ক্যাটাগরি:</span>
                    <span className="font-medium">{getCategoryLabel(course.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">লেভেল:</span>
                    <span className="font-medium">{getLevelLabel(course.level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ভাষা:</span>
                    <span className="font-medium">{getLanguageLabel(course.language)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">মেয়াদ:</span>
                    <span className="font-medium">{course.duration} {course.durationUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">কোর্স কোড:</span>
                    <span className="font-medium">{course.courseCode}</span>
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
