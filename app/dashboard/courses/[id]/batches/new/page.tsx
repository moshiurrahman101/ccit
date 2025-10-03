'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  courseShortcut: string;
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  maxStudents: number;
  mentors: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
  }[];
}

interface Mentor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  designation: string;
  experience: number;
  expertise: string[];
}

export default function NewBatchPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorSearch, setMentorSearch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedAdditionalMentors, setSelectedAdditionalMentors] = useState<Mentor[]>([]);
  const [formData, setFormData] = useState({
    courseId: courseId,
    name: '',
    description: '',
    courseType: 'online' as 'online' | 'offline',
    mentorId: '',
    additionalMentors: [] as string[],
    startDate: '',
    endDate: '',
    maxStudents: 30,
    currentStudents: 0,
    status: 'draft' as 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Search mentors
  useEffect(() => {
    const searchMentors = async () => {
      try {
        const response = await fetch(`/api/mentors/search?q=${encodeURIComponent(mentorSearch)}&limit=10`);
        const data = await response.json();
        setMentors(data.mentors || []);
      } catch (error) {
        console.error('Error searching mentors:', error);
      }
    };

    const timeoutId = setTimeout(searchMentors, mentorSearch.length > 0 ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [mentorSearch]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCourse(data.course);
        // Set default values from course
        setFormData(prev => ({
          ...prev,
          maxStudents: data.course.maxStudents || 30
        }));
      } else {
        if (response.status === 401) {
          toast.error('সেশন শেষ হয়ে গেছে। আবার লগইন করুন');
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        } else {
          toast.error(data.error || 'কোর্সের তথ্য লোড করতে সমস্যা হয়েছে');
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setFormData(prev => ({
      ...prev,
      mentorId: mentor._id
    }));
    setMentorSearch('');
  };

  const handleAdditionalMentorSelect = (mentor: Mentor) => {
    if (!selectedAdditionalMentors.find(m => m._id === mentor._id) && mentor._id !== formData.mentorId) {
      setSelectedAdditionalMentors(prev => [...prev, mentor]);
      setFormData(prev => ({
        ...prev,
        additionalMentors: [...prev.additionalMentors, mentor._id]
      }));
    }
    setMentorSearch('');
  };

  const handleAdditionalMentorRemove = (mentorId: string) => {
    setSelectedAdditionalMentors(prev => prev.filter(m => m._id !== mentorId));
    setFormData(prev => ({
      ...prev,
      additionalMentors: prev.additionalMentors.filter(id => id !== mentorId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.mentorId) newErrors.mentorId = 'Primary mentor is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.maxStudents || formData.maxStudents <= 0) newErrors.maxStudents = 'Valid max students is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('Please log in to create a batch');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Batch created successfully');
        router.push(`/dashboard/courses/${courseId}/batches`);
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else if (response.status === 403) {
        toast.error('You do not have permission to create batches');
      } else {
        toast.error(data.error || 'Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">নতুন ব্যাচ তৈরি করুন</h1>
              <p className="text-gray-600">{course.title} - {course.courseCode}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">ব্যাচের তথ্য</CardTitle>
            <p className="text-gray-600">নতুন ব্যাচ তৈরি করতে বিবরণ পূরণ করুন</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">কোর্সের তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>কোর্স:</strong> {course.title}
                </div>
                <div>
                  <strong>কোড:</strong> {course.courseCode}
                </div>
                <div>
                  <strong>মূল্য:</strong> ৳{course.regularPrice.toLocaleString()}
                  {course.discountPrice && (
                    <span className="text-green-600 ml-2">(ছাড়: ৳{course.discountPrice.toLocaleString()})</span>
                  )}
                </div>
                <div>
                  <strong>সর্বোচ্চ শিক্ষার্থী:</strong> {course.maxStudents}
                </div>
              </div>
            </div>

            {/* Batch Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">ব্যাচের নাম (ঐচ্ছিক)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="ব্যাচের বিশেষ নাম (যদি থাকে)"
                />
                <p className="text-xs text-gray-500 mt-1">খালি রাখলে স্বয়ংক্রিয়ভাবে তৈরি হবে</p>
              </div>

              <div>
                <Label htmlFor="courseType">ব্যাচের ধরন</Label>
                <Select value={formData.courseType} onValueChange={(value) => handleInputChange('courseType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">অনলাইন</SelectItem>
                    <SelectItem value="offline">অফলাইন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">ব্যাচের বিশেষ বিবরণ (ঐচ্ছিক)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="এই ব্যাচের বিশেষ বিবরণ (যদি থাকে)"
                rows={3}
              />
            </div>

            {/* Primary Mentor Selection */}
            <div>
              <Label>প্রাথমিক মেন্টর *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="মেন্টরের নাম বা ইমেইল লিখুন"
                  value={mentorSearch}
                  onChange={(e) => setMentorSearch(e.target.value)}
                />
                {mentorSearch && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {mentors.map((mentor) => (
                      <div
                        key={mentor._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleMentorSelect(mentor)}
                      >
                        <div className="flex items-center gap-3">
                          {mentor.avatar ? (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={mentor.avatar}
                              alt={mentor.name}
                            />
                          ) : (
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{mentor.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{mentor.name}</div>
                            <div className="text-sm text-gray-500">{mentor.designation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedMentor && (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      {selectedMentor.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={selectedMentor.avatar}
                          alt={selectedMentor.name}
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{selectedMentor.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{selectedMentor.name}</div>
                        <div className="text-sm text-gray-500">{selectedMentor.designation}</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMentor(null);
                        setFormData(prev => ({ ...prev, mentorId: '' }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {errors.mentorId && <p className="text-red-500 text-sm">{errors.mentorId}</p>}
              </div>
            </div>

            {/* Additional Mentors Selection */}
            <div>
              <Label>অতিরিক্ত মেন্টর (ঐচ্ছিক)</Label>
              <div className="space-y-2">
                <Input
                  placeholder="অতিরিক্ত মেন্টরের নাম বা ইমেইল লিখুন"
                  value={mentorSearch}
                  onChange={(e) => setMentorSearch(e.target.value)}
                />
                {mentorSearch && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {mentors
                      .filter(mentor => mentor._id !== formData.mentorId && !selectedAdditionalMentors.find(m => m._id === mentor._id))
                      .map((mentor) => (
                      <div
                        key={mentor._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleAdditionalMentorSelect(mentor)}
                      >
                        <div className="flex items-center gap-3">
                          {mentor.avatar ? (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={mentor.avatar}
                              alt={mentor.name}
                            />
                          ) : (
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{mentor.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{mentor.name}</div>
                            <div className="text-sm text-gray-500">{mentor.designation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedAdditionalMentors.length > 0 && (
                  <div className="space-y-2">
                    {selectedAdditionalMentors.map((mentor) => (
                      <div key={mentor._id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                        <div className="flex items-center gap-3">
                          {mentor.avatar ? (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={mentor.avatar}
                              alt={mentor.name}
                            />
                          ) : (
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{mentor.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{mentor.name}</div>
                            <div className="text-sm text-gray-500">{mentor.designation}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdditionalMentorRemove(mentor._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate">শুরু হওয়ার তারিখ *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate">শেষ হওয়ার তারিখ *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="maxStudents">সর্বোচ্চ শিক্ষার্থী সংখ্যা *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 30)}
                  min="1"
                  className={errors.maxStudents ? 'border-red-500' : ''}
                />
                {errors.maxStudents && <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>}
              </div>

              <div>
                <Label htmlFor="status">ব্যাচের স্ট্যাটাস</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">খসড়া</SelectItem>
                    <SelectItem value="published">প্রকাশিত</SelectItem>
                    <SelectItem value="upcoming">আসন্ন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/courses/${courseId}/batches`)}
              >
                বাতিল
              </Button>
              
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                ব্যাচ তৈরি করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
