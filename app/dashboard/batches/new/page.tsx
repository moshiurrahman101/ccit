'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Calendar, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  courseShortcut: string;
  regularPrice: number;
  discountPrice?: number;
  courseType: 'online' | 'offline' | 'both';
  coverPhoto?: string;
  mentors: {
    _id: string;
    name: string;
  }[];
}

interface Mentor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  designation: string;
}

export default function NewBatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseId: '',
    mentorId: '' as string | undefined,
    startDate: '',
    endDate: '',
    maxStudents: 30,
    regularPrice: 0,
    discountPrice: 0,
    courseType: 'online' as 'online' | 'offline',
    description: ''
  });

  // Fetch courses and mentors
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [coursesRes, mentorsRes] = await Promise.all([
          fetch('/api/public/courses?limit=100'),
          fetch('/api/mentors?limit=100')
        ]);

        if (!coursesRes.ok) {
          throw new Error(`Courses API error: ${coursesRes.status}`);
        }

        if (!mentorsRes.ok) {
          throw new Error(`Mentors API error: ${mentorsRes.status}`);
        }

        const [coursesData, mentorsData] = await Promise.all([
          coursesRes.json(),
          mentorsRes.json()
        ]);

        setCourses(coursesData.courses || []);
        setMentors(mentorsData.mentors || []);

        // Pre-select course if courseId is provided in URL
        const courseId = searchParams.get('courseId');
        if (courseId && coursesData.courses) {
          const course = coursesData.courses.find((c: Course) => c._id === courseId);
          if (course) {
            setSelectedCourse(course);
            setFormData(prev => ({
              ...prev,
              courseId: course._id,
              regularPrice: course.regularPrice,
              discountPrice: course.discountPrice || 0,
              courseType: course.courseType === 'both' ? 'online' : course.courseType as 'online' | 'offline'
            }));
          }
        }

        // Show message if no courses available
        if (!coursesData.courses || coursesData.courses.length === 0) {
          toast.error('কোনো প্রকাশিত কোর্স পাওয়া যায়নি। প্রথমে কোর্স তৈরি করুন।');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('ডেটা লোড করতে সমস্যা হয়েছে');
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Update form when course is selected
  useEffect(() => {
    if (selectedCourse) {
      // Set primary mentor to first course mentor if available
      const primaryMentorId = selectedCourse.mentors && selectedCourse.mentors.length > 0 
        ? selectedCourse.mentors[0]._id 
        : '';

      setFormData(prev => ({
        ...prev,
        courseId: selectedCourse._id,
        mentorId: primaryMentorId, // Set primary mentor from course
        regularPrice: selectedCourse.regularPrice,
        discountPrice: selectedCourse.discountPrice || 0,
        courseType: selectedCourse.courseType === 'both' ? 'online' : selectedCourse.courseType as 'online' | 'offline'
      }));
    }
  }, [selectedCourse]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseId) {
      toast.error('কোর্স নির্বাচন করুন');
      return;
    }

    // Mentor selection is now optional since course mentors are automatically included
    // if (!formData.mentorId) {
    //   toast.error('মেন্টর নির্বাচন করুন');
    //   return;
    // }

    if (!formData.startDate || !formData.endDate) {
      toast.error('শুরুর এবং শেষের তারিখ দিন');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('শেষের তারিখ শুরুর তারিখের পরে হতে হবে');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('লগইন করুন');
        router.push('/login');
        return;
      }

      // Prepare data for submission - remove empty mentorId
      const submitData = { ...formData };
      if (!submitData.mentorId || submitData.mentorId === '') {
        delete submitData.mentorId;
      }

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('ব্যাচ সফলভাবে তৈরি হয়েছে!');
        router.push('/dashboard/batches');
      } else if (response.status === 401) {
        toast.error('সেশন শেষ হয়ে গেছে। আবার লগইন করুন');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else if (response.status === 403) {
        toast.error('এই কাজের জন্য অনুমতি নেই');
      } else {
        toast.error(data.message || 'ব্যাচ তৈরি করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('ব্যাচ তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching data
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">কোর্স এবং মেন্টর তথ্য লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ফিরে যান
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">নতুন ব্যাচ তৈরি করুন</h1>
          <p className="text-gray-600 mt-2">একটি কোর্সের জন্য নতুন ব্যাচ তৈরি করুন</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              ব্যাচের তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Selection */}
              <div className="space-y-2">
                <Label htmlFor="course">কোর্স নির্বাচন করুন *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => {
                    const course = courses.find(c => c._id === value);
                    setSelectedCourse(course || null);
                    handleInputChange('courseId', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="কোর্স নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        <div className="flex items-center space-x-3">
                          {course.coverPhoto && (
                            <img
                              src={course.coverPhoto}
                              alt={course.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-500">
                              {course.courseCode} - {course.courseShortcut}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourse && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {selectedCourse.coverPhoto && (
                        <img
                          src={selectedCourse.coverPhoto}
                          alt={selectedCourse.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
            <div>
                        <h3 className="font-medium">{selectedCourse.title}</h3>
                        <p className="text-sm text-gray-600">
                          কোর্স কোড: {selectedCourse.courseCode} | 
                          মূল্য: ৳{selectedCourse.regularPrice}
                          {selectedCourse.discountPrice && (
                            <span className="text-green-600 ml-1">
                              (ছাড়: ৳{selectedCourse.discountPrice})
                            </span>
                          )}
                        </p>
            </div>
          </div>
                </div>
                )}
              </div>

              {/* Course Mentors Display */}
              {selectedCourse && selectedCourse.mentors && selectedCourse.mentors.length > 0 && (
                <div className="space-y-2">
                  <Label>কোর্সের মেন্টরগণ</Label>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCourse.mentors.map((mentor: any) => (
                        <div key={mentor._id} className="flex items-center space-x-3">
                          {mentor.avatar && (
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm">{mentor.name}</div>
                            <div className="text-xs text-gray-500">{mentor.designation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      এই মেন্টরগণ স্বয়ংক্রিয়ভাবে ব্যাচে যুক্ত হবেন
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Mentor Selection (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="mentor">অতিরিক্ত মেন্টর নির্বাচন করুন (ঐচ্ছিক)</Label>
                <Select
                  value={formData.mentorId}
                  onValueChange={(value) => handleInputChange('mentorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="প্রয়োজনে অতিরিক্ত মেন্টর নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor._id} value={mentor._id}>
                        <div className="flex items-center space-x-3">
                          {mentor.avatar && (
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{mentor.name}</div>
                            <div className="text-sm text-gray-500">{mentor.designation}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  কোর্সের মেন্টরগণ ইতিমধ্যে যুক্ত আছেন। প্রয়োজনে অতিরিক্ত মেন্টর যোগ করতে পারেন।
                </p>
              </div>

              {/* Course Type */}
              <div className="space-y-2">
                <Label htmlFor="courseType">ব্যাচের ধরন</Label>
                <Select
                  value={formData.courseType}
                  onValueChange={(value) => handleInputChange('courseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">অনলাইন</SelectItem>
                    <SelectItem value="offline">অফলাইন</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">শুরুর তারিখ *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">শেষের তারিখ *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">নিয়মিত মূল্য (৳) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="regularPrice"
                      type="number"
                      value={formData.regularPrice}
                      onChange={(e) => handleInputChange('regularPrice', Number(e.target.value))}
                      className="pl-10"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPrice">ছাড়ের মূল্য (৳)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="discountPrice"
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => handleInputChange('discountPrice', Number(e.target.value))}
                      className="pl-10"
                      min="0"
                    />
          </div>
        </div>
      </div>

              {/* Max Students */}
              <div className="space-y-2">
                <Label htmlFor="maxStudents">সর্বোচ্চ শিক্ষার্থী সংখ্যা</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', Number(e.target.value))}
                    className="pl-10"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">ব্যাচের বিবরণ (ঐচ্ছিক)</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="এই ব্যাচের বিশেষ বিবরণ দিন..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    ব্যাচ তৈরি করুন
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}