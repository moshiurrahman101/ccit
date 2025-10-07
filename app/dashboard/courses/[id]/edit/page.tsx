'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, X, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  designation: string;
  experience: number;
  expertise: string[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline' | 'both';
  regularPrice: number;
  discountPrice?: number;
  mentors: string[];
  modules: Array<{
    title: string;
    description: string;
    duration: number;
    order: number;
  }>;
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  maxStudents: number;
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  category: 'web-development' | 'data-science' | 'mobile-development' | 'design' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'bengali' | 'english';
  courseCode: string;
  courseShortcut: string;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const steps = [
  { id: 1, title: 'মূল তথ্য', description: 'কোর্সের নাম, কভার ফটো, ধরন এবং মূল্য' },
  { id: 2, title: 'কোর্সের বিবরণ', description: 'সিলেবাস, শেখার ফলাফল এবং প্রয়োজনীয়তা' },
  { id: 3, title: 'মেন্টর নির্বাচন', description: 'কোর্সের জন্য মেন্টর নির্বাচন করুন' },
  { id: 4, title: 'এসইও ও মার্কেটিং', description: 'স্লাগ, মেটা বর্ণনা এবং ট্যাগ' },
  { id: 5, title: 'সমাপ্তি', description: 'পর্যালোচনা এবং প্রকাশ বা খসড়া হিসেবে সংরক্ষণ' }
];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorSearch, setMentorSearch] = useState('');
  const [selectedMentors, setSelectedMentors] = useState<Mentor[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    coverPhoto: '',
    courseType: 'both' as 'online' | 'offline' | 'both',
    regularPrice: 0,
    discountPrice: undefined as number | undefined,
    mentors: [] as string[],
    modules: [] as Array<{
      title: string;
      description: string;
      duration: number;
      order: number;
    }>,
    whatYouWillLearn: [] as string[],
    requirements: [] as string[],
    features: [] as string[],
    duration: 1,
    durationUnit: 'months' as 'days' | 'weeks' | 'months' | 'years',
    maxStudents: 30,
    marketing: {
      slug: '',
      metaDescription: '',
      tags: [] as string[]
    },
    category: 'web-development' as 'web-development' | 'data-science' | 'mobile-development' | 'design' | 'marketing' | 'other',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    language: 'bengali' as 'bengali' | 'english',
    courseCode: '',
    courseShortcut: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('লগইন করুন');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const courseData = data.course;
        setCourse(courseData);
        
        // Populate form with course data
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          shortDescription: courseData.shortDescription || '',
          coverPhoto: courseData.coverPhoto || '',
          courseType: courseData.courseType || 'both',
          regularPrice: courseData.regularPrice || 0,
          discountPrice: courseData.discountPrice,
          mentors: courseData.mentors?.map((m: any) => m._id || m) || [],
          modules: courseData.modules || [],
          whatYouWillLearn: courseData.whatYouWillLearn || [],
          requirements: courseData.requirements || [],
          features: courseData.features || [],
          duration: courseData.duration || 1,
          durationUnit: courseData.durationUnit || 'months',
          maxStudents: courseData.maxStudents || 30,
          marketing: {
            slug: courseData.marketing?.slug || '',
            metaDescription: courseData.marketing?.metaDescription || '',
            tags: courseData.marketing?.tags || []
          },
          category: courseData.category || 'web-development',
          level: courseData.level || 'beginner',
          language: courseData.language || 'bengali',
          courseCode: courseData.courseCode || '',
          courseShortcut: courseData.courseShortcut || '',
          status: courseData.status || 'draft'
        });

        // Fetch and set selected mentors
        if (courseData.mentors && courseData.mentors.length > 0) {
          const mentorIds = courseData.mentors.map((m: any) => m._id || m);
          const mentorsResponse = await fetch(`/api/mentors?limit=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (mentorsResponse.ok) {
            const mentorsData = await mentorsResponse.json();
            const courseMentors = mentorsData.mentors.filter((m: Mentor) => 
              mentorIds.includes(m._id)
            );
            setSelectedMentors(courseMentors);
          }
        }
      } else if (response.status === 401) {
        toast.error('সেশন শেষ হয়েছে। আবার লগইন করুন');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else {
        toast.error('কোর্স লোড করতে সমস্যা হয়েছে');
        router.push('/dashboard/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('কোর্স লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentValue = prev[parent as keyof typeof prev] as Record<string, any>;
        return {
          ...prev,
          [parent]: { ...parentValue, [child]: value }
        };
      }
      return { ...prev, [field]: value };
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayInputChange = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const parentField = prev[parent as keyof typeof prev] as Record<string, unknown>;
          return {
            ...prev,
            [parent]: {
              ...parentField,
              [child]: [...(parentField[child] as string[] || []), value.trim()]
            }
          };
        } else {
          return {
            ...prev,
            [field]: [...(prev[field as keyof typeof prev] as string[] || []), value.trim()]
          };
        }
      });
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentField = prev[parent as keyof typeof prev] as Record<string, unknown>;
        return {
          ...prev,
          [parent]: {
            ...parentField,
            [child]: (parentField[child] as string[] || []).filter((_, i) => i !== index)
          }
        };
      } else {
        return {
          ...prev,
          [field]: (prev[field as keyof typeof prev] as string[] || []).filter((_, i) => i !== index)
        };
      }
    });
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', description: '', duration: 1, order: prev.modules.length + 1 }]
    }));
  };

  const updateModule = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i + 1 }))
    }));
  };

  const handleMentorSelect = (mentor: Mentor) => {
    if (!selectedMentors.find(m => m._id === mentor._id)) {
      setSelectedMentors(prev => [...prev, mentor]);
      setFormData(prev => ({
        ...prev,
        mentors: [...prev.mentors, mentor._id]
      }));
    }
    setMentorSearch('');
  };

  const handleMentorRemove = (mentorId: string) => {
    setSelectedMentors(prev => prev.filter(m => m._id !== mentorId));
    setFormData(prev => ({
      ...prev,
      mentors: prev.mentors.filter(id => id !== mentorId)
    }));
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'course-covers');

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();
      
      if (response.ok) {
        handleInputChange('coverPhoto', data.url);
        toast.success('কভার ফটো সফলভাবে আপলোড হয়েছে');
      } else {
        toast.error(data.error || 'ইমেজ আপলোড ব্যর্থ');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('ইমেজ আপলোড ব্যর্থ');
    } finally {
      setIsUploading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title) newErrors.title = 'কোর্সের শিরোনাম প্রয়োজন';
        if (!formData.description) newErrors.description = 'বিবরণ প্রয়োজন';
        if (formData.shortDescription && formData.shortDescription.length > 500) {
          newErrors.shortDescription = 'সংক্ষিপ্ত বিবরণ ৫০০ অক্ষরের মধ্যে হতে হবে';
        }
        if (!formData.regularPrice || formData.regularPrice <= 0) newErrors.regularPrice = 'সঠিক মূল্য প্রয়োজন';
        if (!formData.courseCode) newErrors.courseCode = 'কোর্স কোড প্রয়োজন';
        if (!formData.courseShortcut) newErrors.courseShortcut = 'কোর্স সংক্ষিপ্ত নাম প্রয়োজন';
        break;
      case 2:
        if (formData.modules.length === 0) newErrors.modules = 'অন্তত একটি মডিউল প্রয়োজন';
        if (formData.whatYouWillLearn.length === 0) newErrors.whatYouWillLearn = 'অন্তত একটি শেখার ফলাফল প্রয়োজন';
        break;
      case 3:
        if (formData.mentors.length === 0) newErrors.mentors = 'অন্তত একজন মেন্টর প্রয়োজন';
        break;
      case 4:
        if (!formData.marketing.slug) newErrors['marketing.slug'] = 'স্লাগ প্রয়োজন';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('লগইন করুন');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('কোর্স সফলভাবে আপডেট হয়েছে');
        router.push('/dashboard/courses');
      } else if (response.status === 401) {
        toast.error('সেশন শেষ হয়েছে। আবার লগইন করুন');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else if (response.status === 403) {
        toast.error('আপনার কোর্স আপডেট করার অনুমতি নেই');
      } else {
        toast.error(data.error || 'কোর্স আপডেট করতে ব্যর্থ');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('কোর্স আপডেট করতে ব্যর্থ');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">কোর্সের শিরোনাম *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="কোর্সের শিরোনাম লিখুন"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="courseCode">কোর্স কোড *</Label>
                <Input
                  id="courseCode"
                  value={formData.courseCode}
                  onChange={(e) => handleInputChange('courseCode', e.target.value.toUpperCase())}
                  placeholder="GDI"
                  className={errors.courseCode ? 'border-red-500' : ''}
                />
                {errors.courseCode && <p className="text-red-500 text-sm mt-1">{errors.courseCode}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="courseShortcut">কোর্স সংক্ষিপ্ত নাম *</Label>
              <Input
                id="courseShortcut"
                value={formData.courseShortcut}
                onChange={(e) => handleInputChange('courseShortcut', e.target.value)}
                placeholder="Graphics Design with Illustrator"
                className={errors.courseShortcut ? 'border-red-500' : ''}
              />
              {errors.courseShortcut && <p className="text-red-500 text-sm mt-1">{errors.courseShortcut}</p>}
            </div>

            <div>
              <Label htmlFor="description">কোর্সের বিবরণ *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="কোর্সের বিস্তারিত বিবরণ লিখুন"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="shortDescription">সংক্ষিপ্ত বিবরণ</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="কোর্সের সংক্ষিপ্ত বিবরণ (৫০০ অক্ষরের মধ্যে)"
                rows={2}
                maxLength={500}
                className={formData.shortDescription.length > 500 ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${formData.shortDescription.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.shortDescription.length}/500 অক্ষর
                </span>
                {formData.shortDescription.length > 500 && (
                  <span className="text-xs text-red-500">সংক্ষিপ্ত বিবরণ খুব দীর্ঘ</span>
                )}
              </div>
              {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="courseType">কোর্সের ধরন</Label>
                <Select value={formData.courseType} onValueChange={(value) => handleInputChange('courseType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">অনলাইন</SelectItem>
                    <SelectItem value="offline">অফলাইন</SelectItem>
                    <SelectItem value="both">উভয়</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">ক্যাটাগরি</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-development">ওয়েব ডেভেলপমেন্ট</SelectItem>
                    <SelectItem value="data-science">ডেটা সায়েন্স</SelectItem>
                    <SelectItem value="mobile-development">মোবাইল ডেভেলপমেন্ট</SelectItem>
                    <SelectItem value="design">ডিজাইন</SelectItem>
                    <SelectItem value="marketing">মার্কেটিং</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">লেভেল</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">শুরু</SelectItem>
                    <SelectItem value="intermediate">মধ্যম</SelectItem>
                    <SelectItem value="advanced">উন্নত</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="regularPrice">নিয়মিত মূল্য *</Label>
                <Input
                  id="regularPrice"
                  type="number"
                  value={formData.regularPrice}
                  onChange={(e) => handleInputChange('regularPrice', parseFloat(e.target.value) || 0)}
                  placeholder="০"
                  className={errors.regularPrice ? 'border-red-500' : ''}
                />
                {errors.regularPrice && <p className="text-red-500 text-sm mt-1">{errors.regularPrice}</p>}
              </div>

              <div>
                <Label htmlFor="discountPrice">ছাড় মূল্য</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  value={formData.discountPrice || ''}
                  onChange={(e) => handleInputChange('discountPrice', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="০"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="duration">সময়কাল</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                    placeholder="১"
                  />
                  <Select value={formData.durationUnit} onValueChange={(value) => handleInputChange('durationUnit', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">দিন</SelectItem>
                      <SelectItem value="weeks">সপ্তাহ</SelectItem>
                      <SelectItem value="months">মাস</SelectItem>
                      <SelectItem value="years">বছর</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="maxStudents">সর্বোচ্চ শিক্ষার্থী</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 30)}
                  placeholder="৩০"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="coverPhoto">কভার ফটো</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  disabled={isUploading}
                />
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.coverPhoto && (
                <div className="mt-2">
                  <img src={formData.coverPhoto} alt="Cover" className="h-20 w-32 object-cover rounded" />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>মডিউলসমূহ *</Label>
                <Button type="button" onClick={addModule} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  মডিউল যোগ করুন
                </Button>
              </div>
              {formData.modules.map((module, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">মডিউল {index + 1}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeModule(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>মডিউলের শিরোনাম</Label>
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(index, 'title', e.target.value)}
                        placeholder="মডিউলের শিরোনাম"
                      />
                    </div>
                    <div>
                      <Label>সময়কাল (ঘন্টা)</Label>
                      <Input
                        type="number"
                        value={module.duration}
                        onChange={(e) => updateModule(index, 'duration', parseFloat(e.target.value) || 1)}
                        placeholder="১"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label>বিবরণ</Label>
                    <Textarea
                      value={module.description}
                      onChange={(e) => updateModule(index, 'description', e.target.value)}
                      placeholder="মডিউলের বিবরণ"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              {errors.modules && <p className="text-red-500 text-sm">{errors.modules}</p>}
            </div>

            <div>
              <Label>শেখার ফলাফল *</Label>
              <div className="space-y-2">
                {formData.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...formData.whatYouWillLearn];
                        newItems[index] = e.target.value;
                        setFormData(prev => ({ ...prev, whatYouWillLearn: newItems }));
                      }}
                      placeholder="শেখার ফলাফল"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('whatYouWillLearn', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="নতুন শেখার ফলাফল যোগ করুন"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInputChange('whatYouWillLearn', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="নতুন শেখার ফলাফল যোগ করুন"]') as HTMLInputElement;
                      if (input?.value) {
                        handleArrayInputChange('whatYouWillLearn', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    যোগ করুন
                  </Button>
                </div>
              </div>
              {errors.whatYouWillLearn && <p className="text-red-500 text-sm">{errors.whatYouWillLearn}</p>}
            </div>

            <div>
              <Label>প্রয়োজনীয়তা</Label>
              <div className="space-y-2">
                {formData.requirements.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...formData.requirements];
                        newItems[index] = e.target.value;
                        setFormData(prev => ({ ...prev, requirements: newItems }));
                      }}
                      placeholder="প্রয়োজনীয়তা"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('requirements', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="নতুন প্রয়োজনীয়তা যোগ করুন"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInputChange('requirements', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="নতুন প্রয়োজনীয়তা যোগ করুন"]') as HTMLInputElement;
                      if (input?.value) {
                        handleArrayInputChange('requirements', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    যোগ করুন
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>বৈশিষ্ট্য</Label>
              <div className="space-y-2">
                {formData.features.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...formData.features];
                        newItems[index] = e.target.value;
                        setFormData(prev => ({ ...prev, features: newItems }));
                      }}
                      placeholder="বৈশিষ্ট্য"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('features', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="নতুন বৈশিষ্ট্য যোগ করুন"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInputChange('features', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="নতুন বৈশিষ্ট্য যোগ করুন"]') as HTMLInputElement;
                      if (input?.value) {
                        handleArrayInputChange('features', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    যোগ করুন
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>মেন্টর খুঁজুন</Label>
              <Input
                placeholder="মেন্টরের নাম বা ইমেইল লিখুন"
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
              />
              {mentorSearch && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
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
            </div>

            <div>
              <Label>নির্বাচিত মেন্টর *</Label>
              {selectedMentors.length === 0 ? (
                <p className="text-gray-500 text-sm">কোনো মেন্টর নির্বাচিত হয়নি</p>
              ) : (
                <div className="space-y-2">
                  {selectedMentors.map((mentor) => (
                    <div key={mentor._id} className="flex items-center justify-between p-3 border rounded-lg">
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
                        onClick={() => handleMentorRemove(mentor._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {errors.mentors && <p className="text-red-500 text-sm">{errors.mentors}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="slug">স্লাগ *</Label>
              <Input
                id="slug"
                value={formData.marketing.slug}
                onChange={(e) => handleInputChange('marketing.slug', e.target.value)}
                placeholder="course-slug"
                className={errors['marketing.slug'] ? 'border-red-500' : ''}
              />
              {errors['marketing.slug'] && <p className="text-red-500 text-sm mt-1">{errors['marketing.slug']}</p>}
            </div>

            <div>
              <Label htmlFor="metaDescription">মেটা বর্ণনা</Label>
              <Textarea
                id="metaDescription"
                value={formData.marketing.metaDescription}
                onChange={(e) => handleInputChange('marketing.metaDescription', e.target.value)}
                placeholder="SEO এর জন্য মেটা বর্ণনা (১৬০ অক্ষরের মধ্যে)"
                rows={3}
              />
            </div>

            <div>
              <Label>ট্যাগ</Label>
              <div className="space-y-2">
                {formData.marketing.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{tag}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('marketing.tags', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="নতুন ট্যাগ যোগ করুন"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInputChange('marketing.tags', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="নতুন ট্যাগ যোগ করুন"]') as HTMLInputElement;
                      if (input?.value) {
                        handleArrayInputChange('marketing.tags', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    যোগ করুন
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">কোর্সের তথ্য পর্যালোচনা</h3>
              <div className="space-y-4">
                <div>
                  <strong>শিরোনাম:</strong> {formData.title}
                </div>
                <div>
                  <strong>কোর্স কোড:</strong> {formData.courseCode}
                </div>
                <div>
                  <strong>সংক্ষিপ্ত নাম:</strong> {formData.courseShortcut}
                </div>
                <div>
                  <strong>মূল্য:</strong> ৳{formData.regularPrice.toLocaleString()}
                  {formData.discountPrice && (
                    <span className="text-gray-500 ml-2">(ছাড়: ৳{formData.discountPrice.toLocaleString()})</span>
                  )}
                </div>
                <div>
                  <strong>মেন্টর:</strong> {selectedMentors.map(m => m.name).join(', ')}
                </div>
                <div>
                  <strong>মডিউল সংখ্যা:</strong> {formData.modules.length}
                </div>
                <div>
                  <strong>শেখার ফলাফল:</strong> {formData.whatYouWillLearn.length} টি
                </div>
              </div>
            </div>

            <div>
              <Label>প্রকাশের স্ট্যাটাস</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">খসড়া</SelectItem>
                  <SelectItem value="published">প্রকাশিত</SelectItem>
                  <SelectItem value="archived">আর্কাইভ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">কোর্স পাওয়া যায়নি</h1>
            <Button onClick={() => router.push('/dashboard/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              কোর্স তালিকায় ফিরে যান
            </Button>
          </div>
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
              ফিরে যান
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">কোর্স সম্পাদনা করুন</h1>
              <p className="text-gray-600">{course.title}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/courses/${course.marketing?.slug}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              প্রিভিউ
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    currentStep >= step.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {step.id}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">{steps[currentStep - 1].title}</CardTitle>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                পূর্ববর্তী
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/courses')}
                >
                  বাতিল
                </Button>
                
                {currentStep < steps.length ? (
                  <Button onClick={nextStep}>
                    পরবর্তী
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        কোর্স আপডেট করুন
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

