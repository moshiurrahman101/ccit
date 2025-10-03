'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Calendar, Users, DollarSign, BookOpen, Save, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
}

interface Batch {
  _id: string;
  courseId: Course;
  batchCode: string;
  name: string;
  description?: string;
  courseType: 'online' | 'offline';
  mentorId: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
  };
  additionalMentors: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
  }[];
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  regularPrice?: number;
  discountPrice?: number;
  discountPercentage?: number;
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

const statusOptions = [
  { value: 'draft', label: 'খসড়া', color: 'bg-gray-500' },
  { value: 'published', label: 'প্রকাশিত', color: 'bg-green-500' },
  { value: 'upcoming', label: 'আসন্ন', color: 'bg-blue-500' },
  { value: 'ongoing', label: 'চলমান', color: 'bg-orange-500' },
  { value: 'completed', label: 'সম্পন্ন', color: 'bg-purple-500' },
  { value: 'cancelled', label: 'বাতিল', color: 'bg-red-500' }
];

export default function EditBatchPage() {
  const router = useRouter();
  const params = useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: 'online' as 'online' | 'offline',
    mentorId: '',
    additionalMentors: [] as string[],
    startDate: '',
    endDate: '',
    maxStudents: 30,
    currentStudents: 0,
    regularPrice: 0,
    discountPrice: 0,
    status: 'draft' as 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    isActive: true
  });

  useEffect(() => {
    if (params.id) {
      fetchBatch();
      fetchMentors();
    }
  }, [params.id]);

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('লগইন করুন');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/batches/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBatch(data.batch);
        
        // Set form data
        setFormData({
          name: data.batch.name || '',
          description: data.batch.description || '',
          courseType: data.batch.courseType || 'online',
          mentorId: data.batch.mentorId?._id || '',
          additionalMentors: data.batch.additionalMentors?.map((m: any) => m._id) || [],
          startDate: data.batch.startDate ? format(new Date(data.batch.startDate), 'yyyy-MM-dd') : '',
          endDate: data.batch.endDate ? format(new Date(data.batch.endDate), 'yyyy-MM-dd') : '',
          maxStudents: data.batch.maxStudents || 30,
          currentStudents: data.batch.currentStudents || 0,
          regularPrice: data.batch.regularPrice || data.batch.courseId?.regularPrice || 0,
          discountPrice: data.batch.discountPrice || data.batch.courseId?.discountPrice || 0,
          status: data.batch.status || 'draft',
          isActive: data.batch.isActive !== false
        });
      } else if (response.status === 401) {
        toast.error('সেশন শেষ হয়েছে। আবার লগইন করুন');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else {
        toast.error('ব্যাচ লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('ব্যাচ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/mentors?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('লগইন করুন');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/batches/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('ব্যাচ সফলভাবে আপডেট হয়েছে!');
        router.push('/dashboard/batches');
      } else if (response.status === 401) {
        toast.error('সেশন শেষ হয়েছে। আবার লগইন করুন');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else {
        const data = await response.json();
        toast.error(data.error || 'ব্যাচ আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('ব্যাচ আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('লগইন করুন');
        return;
      }

      const response = await fetch(`/api/batches/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('স্ট্যাটাস সফলভাবে আপডেট হয়েছে!');
        setFormData(prev => ({ ...prev, status: newStatus as any }));
        setBatch(prev => prev ? { ...prev, status: newStatus as any } : null);
      } else {
        const data = await response.json();
        toast.error(data.error || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">ব্যাচ লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ব্যাচ পাওয়া যায়নি</h1>
            <Button onClick={() => router.push('/dashboard/batches')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              ব্যাচ তালিকায় ফিরে যান
            </Button>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ব্যাচ সম্পাদনা</h1>
              <p className="text-gray-600 mt-2">{batch.batchCode} - {batch.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusOptions.find(s => s.value === formData.status)?.color} text-white`}>
                {statusOptions.find(s => s.value === formData.status)?.label}
              </Badge>
              <Button
                variant="outline"
                onClick={() => router.push(`/batches/${batch.courseId?.marketing?.slug || batch._id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                দেখুন
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  ব্যাচের তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Course Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">কোর্সের তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">কোর্স:</span>
                        <p className="text-blue-800">{batch.courseId?.title}</p>
                      </div>
                      <div>
                        <span className="font-medium">কোর্স কোড:</span>
                        <p className="text-blue-800">{batch.courseId?.courseCode}</p>
                      </div>
                      <div>
                        <span className="font-medium">ব্যাচ কোড:</span>
                        <p className="text-blue-800 font-mono">{batch.batchCode}</p>
                      </div>
                      <div>
                        <span className="font-medium">ক্যাটাগরি:</span>
                        <p className="text-blue-800">{batch.courseId?.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Batch Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">ব্যাচের নাম</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="ব্যাচের নাম"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">ব্যাচের বিবরণ</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="ব্যাচের জন্য অতিরিক্ত বিবরণ"
                      rows={3}
                    />
                  </div>

                  {/* Course Type */}
                  <div className="space-y-2">
                    <Label htmlFor="courseType">ব্যাচের ধরন</Label>
                    <Select
                      value={formData.courseType}
                      onValueChange={(value: 'online' | 'offline') => handleInputChange('courseType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ব্যাচের ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">অনলাইন</SelectItem>
                        <SelectItem value="offline">অফলাইন</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mentor Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="mentorId">প্রাথমিক মেন্টর</Label>
                    <Select
                      value={formData.mentorId}
                      onValueChange={(value) => handleInputChange('mentorId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="মেন্টর নির্বাচন করুন" />
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
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">শুরুর তারিখ</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">শেষের তারিখ</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Students */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxStudents">সর্বোচ্চ শিক্ষার্থী</Label>
                      <Input
                        id="maxStudents"
                        type="number"
                        value={formData.maxStudents}
                        onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                        min={1}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentStudents">বর্তমান শিক্ষার্থী</Label>
                      <Input
                        id="currentStudents"
                        type="number"
                        value={formData.currentStudents}
                        onChange={(e) => handleInputChange('currentStudents', parseInt(e.target.value))}
                        min={0}
                        max={formData.maxStudents}
                        required
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regularPrice">নিয়মিত মূল্য</Label>
                      <Input
                        id="regularPrice"
                        type="number"
                        value={formData.regularPrice}
                        onChange={(e) => handleInputChange('regularPrice', parseFloat(e.target.value))}
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">ছাড় মূল্য</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        value={formData.discountPrice}
                        onChange={(e) => handleInputChange('discountPrice', parseFloat(e.target.value))}
                        min={0}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        সংরক্ষণ করুন
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Status Change */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">দ্রুত স্ট্যাটাস পরিবর্তন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <Button
                      key={status.value}
                      variant={formData.status === status.value ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickStatusChange(status.value)}
                    >
                      <div className={`w-3 h-3 rounded-full ${status.color} mr-2`}></div>
                      {status.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Batch Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ব্যাচের তথ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ব্যাচ কোড:</span>
                    <span className="font-mono font-medium">{batch.batchCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">স্ট্যাটাস:</span>
                    <Badge className={`${statusOptions.find(s => s.value === formData.status)?.color} text-white`}>
                      {statusOptions.find(s => s.value === formData.status)?.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">সক্রিয়:</span>
                    <span className={formData.isActive ? 'text-green-600' : 'text-red-600'}>
                      {formData.isActive ? 'হ্যাঁ' : 'না'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">তৈরি হয়েছে:</span>
                    <span>{format(new Date(batch.createdAt), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">সর্বশেষ আপডেট:</span>
                    <span>{format(new Date(batch.updatedAt), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">কোর্সের তথ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">কোর্স:</span>
                    <p className="font-medium">{batch.courseId?.title}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ক্যাটাগরি:</span>
                    <span>{batch.courseId?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">লেভেল:</span>
                    <span>{batch.courseId?.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ভাষা:</span>
                    <span>{batch.courseId?.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">মেয়াদ:</span>
                    <span>{batch.courseId?.duration} {batch.courseId?.durationUnit}</span>
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