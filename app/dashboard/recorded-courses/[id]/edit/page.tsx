'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, X, Video, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const steps = [
  { id: 1, title: 'মূল তথ্য', description: 'কোর্সের নাম, কভার ফটো, এবং মূল্য' },
  { id: 2, title: 'ভিডিও যোগ করুন', description: 'ইউটিউব আনলিস্টেড লিংক যোগ করুন' },
  { id: 3, title: 'কোর্সের বিবরণ', description: 'শেখার ফলাফল এবং প্রয়োজনীয়তা' },
  { id: 4, title: 'এসইও ও মার্কেটিং', description: 'স্লাগ, মেটা বর্ণনা এবং ট্যাগ' },
  { id: 5, title: 'সমাপ্তি', description: 'পর্যালোচনা এবং প্রকাশ' }
];

export default function EditRecordedCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    coverPhoto: '',
    regularPrice: 0,
    discountPrice: undefined as number | undefined,
    videos: [] as Array<{
      title: string;
      description?: string;
      youtubeUrl: string;
      duration?: number;
      order: number;
      isPreview: boolean;
    }>,
    category: 'web-development' as 'web-development' | 'data-science' | 'mobile-development' | 'design' | 'marketing' | 'other',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    language: 'bengali' as 'bengali' | 'english',
    duration: 1,
    durationUnit: 'hours' as 'hours' | 'days' | 'weeks',
    whatYouWillLearn: [] as string[],
    requirements: [] as string[],
    features: [] as string[],
    slug: '',
    metaDescription: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    allowDownload: false,
    mentors: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  interface Mentor {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience?: number;
    expertise?: string[];
  }
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorSearch, setMentorSearch] = useState('');
  const [selectedMentors, setSelectedMentors] = useState<Mentor[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Search mentors
  useEffect(() => {
    const searchMentors = async () => {
      if (mentorSearch.length < 2) {
        setMentors([]);
        return;
      }
      try {
        const response = await fetch(`/api/mentors/search?q=${encodeURIComponent(mentorSearch)}&limit=10`);
        const data = await response.json();
        setMentors(data.mentors || []);
      } catch (error) {
        console.error('Error searching mentors:', error);
      }
    };

    const timeoutId = setTimeout(searchMentors, 300);
    return () => clearTimeout(timeoutId);
  }, [mentorSearch]);

  const handleMentorSelect = (mentor: Mentor) => {
    if (!selectedMentors.find(m => m._id === mentor._id)) {
      setSelectedMentors(prev => [...prev, mentor]);
      setFormData(prev => ({
        ...prev,
        mentors: [...prev.mentors, mentor._id]
      }));
      setMentorSearch('');
      setMentors([]);
    }
  };

  const handleMentorRemove = (mentorId: string) => {
    setSelectedMentors(prev => prev.filter(m => m._id !== mentorId));
    setFormData(prev => ({
      ...prev,
      mentors: prev.mentors.filter(id => id !== mentorId)
    }));
  };

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/recorded-courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.course) {
        const course = data.course;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          shortDescription: course.shortDescription || '',
          coverPhoto: course.coverPhoto || '',
          regularPrice: course.regularPrice || 0,
          discountPrice: course.discountPrice,
          videos: course.videos?.map((v: any) => ({
            title: v.title || '',
            description: v.description || '',
            youtubeUrl: v.youtubeUrl || '',
            duration: v.duration,
            order: v.order || 0,
            isPreview: v.isPreview || false
          })) || [],
          category: course.category || 'web-development',
          level: course.level || 'beginner',
          language: course.language || 'bengali',
          duration: course.duration || 1,
          durationUnit: course.durationUnit || 'hours',
          whatYouWillLearn: course.whatYouWillLearn || [],
          requirements: course.requirements || [],
          features: course.features || [],
          slug: course.slug || '',
          metaDescription: course.metaDescription || '',
          tags: course.tags || [],
          status: course.status || 'draft',
          allowDownload: course.allowDownload || false,
          mentors: course.mentors?.map((m: any) => m._id || m) || []
        });
        
        // Fetch and set selected mentors
        if (course.mentors && course.mentors.length > 0) {
          const mentorIds = course.mentors.map((m: any) => m._id || m);
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
      } else {
        toast.error(data.error || 'কোর্স লোড করতে সমস্যা হয়েছে');
        router.push('/dashboard/recorded-courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
      router.push('/dashboard/recorded-courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[] | undefined) => {
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
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayInputChange = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const parentValue = prev[parent as keyof typeof prev];
          if (typeof parentValue === 'object' && parentValue !== null && !Array.isArray(parentValue)) {
            const parentField = parentValue as Record<string, unknown>;
            return {
              ...prev,
              [parent]: {
                ...parentField,
                [child]: [...(parentField[child] as string[] || []), value.trim()]
              }
            };
          }
          return prev;
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
        const parentValue = prev[parent as keyof typeof prev];
        if (typeof parentValue === 'object' && parentValue !== null && !Array.isArray(parentValue)) {
          const parentField = parentValue as Record<string, unknown>;
          return {
            ...prev,
            [parent]: {
              ...parentField,
              [child]: (parentField[child] as string[] || []).filter((_, i) => i !== index)
            }
          };
        }
        return prev;
      } else {
        return {
          ...prev,
          [field]: (prev[field as keyof typeof prev] as string[] || []).filter((_, i) => i !== index)
        };
      }
    });
  };

  const addVideo = () => {
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, { 
        title: '', 
        description: '', 
        youtubeUrl: '', 
        order: prev.videos.length + 1,
        isPreview: false
      }]
    }));
  };

  const updateVideo = (index: number, field: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((video, i) => 
        i === index ? { ...video, [field]: value } : video
      )
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index).map((video, idx) => ({
        ...video,
        order: idx + 1
      }))
    }));
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'course-covers');

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        handleInputChange('coverPhoto', data.url);
        toast.success('Cover photo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title) newErrors.title = 'Course title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.regularPrice || formData.regularPrice <= 0) newErrors.regularPrice = 'Valid price is required';
        if (!formData.slug) newErrors.slug = 'Slug is required';
        break;
      case 2:
        if (formData.videos.length === 0) newErrors.videos = 'At least one video is required';
        formData.videos.forEach((video, index) => {
          if (!video.title) newErrors[`video_${index}_title`] = 'Video title is required';
          if (!video.youtubeUrl) newErrors[`video_${index}_url`] = 'YouTube URL is required';
          if (video.youtubeUrl && !video.youtubeUrl.includes('youtube.com') && !video.youtubeUrl.includes('youtu.be')) {
            newErrors[`video_${index}_url`] = 'Invalid YouTube URL';
          }
        });
        break;
      case 3:
        if (formData.whatYouWillLearn.length === 0) newErrors.whatYouWillLearn = 'At least one learning outcome is required';
        break;
      case 4:
        if (!formData.slug) newErrors.slug = 'Slug is required';
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
        toast.error('Please log in to update course');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/recorded-courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Recorded course updated successfully');
        router.push('/dashboard/recorded-courses');
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else if (response.status === 403) {
        toast.error('You do not have permission to update courses');
      } else {
        toast.error(data.error || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
              />
              <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/500 অক্ষর</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div>
                <Label htmlFor="language">ভাষা</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bengali">বাংলা</SelectItem>
                    <SelectItem value="english">ইংরেজি</SelectItem>
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
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    handleInputChange('discountPrice', value);
                  }}
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
                      <SelectItem value="hours">ঘন্টা</SelectItem>
                      <SelectItem value="days">দিন</SelectItem>
                      <SelectItem value="weeks">সপ্তাহ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

            {/* Mentor Selection */}
            <div>
              <Label>মেন্টর নির্বাচন করুন</Label>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    value={mentorSearch}
                    onChange={(e) => setMentorSearch(e.target.value)}
                    placeholder="মেন্টরের নাম দিয়ে খুঁজুন..."
                  />
                </div>
                
                {mentors.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {mentors.map((mentor) => (
                      <div
                        key={mentor._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleMentorSelect(mentor)}
                      >
                        <div className="flex items-center gap-3">
                          {mentor.avatar ? (
                            <img src={mentor.avatar} alt={mentor.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{mentor.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{mentor.name}</p>
                            <p className="text-sm text-gray-500">{mentor.designation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedMentors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>নির্বাচিত মেন্টরগণ:</Label>
                  <div className="space-y-2">
                    {selectedMentors.map((mentor) => (
                      <div key={mentor._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {mentor.avatar ? (
                            <img src={mentor.avatar} alt={mentor.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{mentor.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{mentor.name}</p>
                            <p className="text-sm text-gray-500">{mentor.designation}</p>
                            {mentor.experience && (
                              <p className="text-xs text-gray-400">{mentor.experience} বছর অভিজ্ঞতা</p>
                            )}
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
                <Label>ভিডিও তালিকা *</Label>
                <Button type="button" onClick={addVideo} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  ভিডিও যোগ করুন
                </Button>
              </div>
              {formData.videos.map((video, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">ভিডিও {index + 1}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVideo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>ভিডিও শিরোনাম *</Label>
                      <Input
                        value={video.title}
                        onChange={(e) => updateVideo(index, 'title', e.target.value)}
                        placeholder="ভিডিও শিরোনাম"
                        className={errors[`video_${index}_title`] ? 'border-red-500' : ''}
                      />
                      {errors[`video_${index}_title`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`video_${index}_title`]}</p>
                      )}
                    </div>
                    <div>
                      <Label>ইউটিউব আনলিস্টেড লিংক *</Label>
                      <Input
                        value={video.youtubeUrl}
                        onChange={(e) => updateVideo(index, 'youtubeUrl', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                        className={errors[`video_${index}_url`] ? 'border-red-500' : ''}
                      />
                      {errors[`video_${index}_url`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`video_${index}_url`]}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        ⚠️ অনুগ্রহ করে ইউটিউবে ভিডিওটি আনলিস্টেড হিসেবে সেট করুন
                      </p>
                    </div>
                    <div>
                      <Label>ভিডিও বিবরণ (ঐচ্ছিক)</Label>
                      <Textarea
                        value={video.description || ''}
                        onChange={(e) => updateVideo(index, 'description', e.target.value)}
                        placeholder="ভিডিও সম্পর্কে সংক্ষিপ্ত বিবরণ"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>সময়কাল (মিনিট)</Label>
                        <Input
                          type="number"
                          value={video.duration || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            updateVideo(index, 'duration', value);
                          }}
                          placeholder="০"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id={`preview-${index}`}
                          checked={video.isPreview}
                          onChange={(e) => updateVideo(index, 'isPreview', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`preview-${index}`} className="cursor-pointer">
                          প্রিভিউ ভিডিও (ফ্রি)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {errors.videos && <p className="text-red-500 text-sm">{errors.videos}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
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

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="slug">স্লাগ *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="course-slug"
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
            </div>

            <div>
              <Label htmlFor="metaDescription">মেটা বর্ণনা</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder="SEO এর জন্য মেটা বর্ণনা (১৬০ অক্ষরের মধ্যে)"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 অক্ষর</p>
            </div>

            <div>
              <Label>ট্যাগ</Label>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{tag}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('tags', index)}
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
                        handleArrayInputChange('tags', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="নতুন ট্যাগ যোগ করুন"]') as HTMLInputElement;
                      if (input?.value) {
                        handleArrayInputChange('tags', input.value);
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
                  <strong>ভিডিও সংখ্যা:</strong> {formData.videos.length}
                </div>
                <div>
                  <strong>মূল্য:</strong> ৳{formData.discountPrice || formData.regularPrice}
                  {formData.discountPrice && (
                    <span className="text-gray-500 line-through ml-2">
                      ৳{formData.regularPrice}
                    </span>
                  )}
                </div>
                <div>
                  <strong>ক্যাটাগরি:</strong> {formData.category}
                </div>
                <div>
                  <strong>লেভেল:</strong> {formData.level}
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
      <div className="flex items-center justify-center min-h-screen">
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
              <h1 className="text-3xl font-bold text-gray-900">কোর্স সম্পাদনা করুন</h1>
              <p className="text-gray-600">রেকর্ড করা কোর্সের তথ্য আপডেট করুন</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
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
                  onClick={() => router.push('/dashboard/recorded-courses')}
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
                        আপডেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        আপডেট করুন
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

