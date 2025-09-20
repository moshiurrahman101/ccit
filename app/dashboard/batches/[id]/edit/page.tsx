'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, BookOpen, Calendar, Users, DollarSign, Clock, Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { uploadImage } from '@/lib/cloudinary';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  designation: string;
  avatar?: string;
}

interface Batch {
  _id: string;
  name: string;
  description: string;
  courseType: 'online' | 'offline';
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  coverPhoto: string;
  regularPrice: number;
  discountPrice: number;
  currency: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  prerequisites: string[];
  modules: {
    title: string;
    description: string;
    duration: number;
    order: number;
  }[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  isMandatory: boolean;
  instructor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatar: string;
  };
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  slug: string;
  metaDescription: string;
}

export default function EditBatchPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [tempInputs, setTempInputs] = useState({
    prerequisites: '',
    tags: '',
    features: '',
    requirements: '',
    whatYouWillLearn: ''
  });

  const [formData, setFormData] = useState<Batch>({
    _id: '',
    name: '',
    description: '',
    courseType: 'online',
    duration: 3,
    durationUnit: 'months',
    coverPhoto: '',
    regularPrice: 0,
    discountPrice: 0,
    currency: 'BDT',
    discountPercentage: 0,
    startDate: '',
    endDate: '',
    maxStudents: 30,
    currentStudents: 0,
    prerequisites: [],
    modules: [],
    status: 'upcoming',
    isActive: true,
    isMandatory: true,
    instructor: {
      _id: '',
      name: '',
      email: '',
      phone: '',
      bio: '',
      avatar: ''
    },
    tags: [],
    level: 'beginner',
    features: [],
    requirements: [],
    whatYouWillLearn: [],
    slug: '',
    metaDescription: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchBatch(params.id as string);
    }
    fetchMentors();
  }, [params.id]);

  const fetchBatch = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/batches/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setFormData(data.batch);
        setSearchTerm(data.batch.instructor.name);
      } else {
        toast.error(data.error || 'ব্যাচ লোড করতে সমস্যা হয়েছে');
        router.push('/dashboard/batches');
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
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
      const data = await response.json();
      if (response.ok) {
        setMentors(data.mentors);
        setFilteredMentors(data.mentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInstructorChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructor: {
        ...prev.instructor,
        [field]: value
      }
    }));
  };

  const handleArrayAdd = (field: keyof typeof tempInputs, value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof Batch] as string[], value.trim()]
    }));
    
    setTempInputs(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof Batch] as string[];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  };

  const handleModuleAdd = () => {
    const newModule = {
      title: '',
      description: '',
      duration: 0,
      order: formData.modules.length + 1
    };
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const handleModuleChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const handleModuleRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverPhoto: url }));
      toast.success('কভার ফটো আপলোড সফল হয়েছে');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('কভার ফটো আপলোডে সমস্যা হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const handleMentorSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = mentors.filter(mentor =>
      mentor.name.toLowerCase().includes(term.toLowerCase()) ||
      mentor.email.toLowerCase().includes(term.toLowerCase()) ||
      mentor.designation.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredMentors(filtered);
    setShowMentorDropdown(isFocused && (term.length > 0 || mentors.length > 0));
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setFormData(prev => ({
      ...prev,
      instructor: {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        phone: '',
        bio: '',
        avatar: mentor.avatar || ''
      }
    }));
    setSearchTerm(mentor.name);
    setShowMentorDropdown(false);
    setIsFocused(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.instructor._id) {
      toast.error('নাম এবং ইনস্ট্রাক্টর নির্বাচন করা আবশ্যক');
      return;
    }

    try {
      setLoading(true);
      
      // Generate slug
      const slug = generateSlug(formData.name);
      const batchData = {
        ...formData,
        slug
      };

      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/batches/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(batchData)
      });

      if (response.ok) {
        toast.success('ব্যাচ সফলভাবে আপডেট হয়েছে');
        router.push('/dashboard/batches');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'ব্যাচ আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData._id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">ব্যাচ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ব্যাচ সম্পাদনা করুন</h1>
            <p className="text-gray-600">ব্যাচের তথ্য আপডেট করুন</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                মৌলিক তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">ব্যাচের নাম *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="ব্যাচের নাম লিখুন"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="courseType">কোর্সের ধরন *</Label>
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
              </div>

              <div>
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="ব্যাচ সম্পর্কে বিস্তারিত বিবরণ লিখুন"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="duration">সময়কাল *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="durationUnit">সময়কালের একক *</Label>
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value) => handleInputChange('durationUnit', value)}
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="level">লেভেল *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange('level', value)}
                  >
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
            </CardContent>
          </Card>

          {/* Cover Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                কভার ফটো
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    id="coverPhoto"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="coverPhoto"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploading ? 'আপলোড হচ্ছে...' : 'কভার ফটো আপলোড করুন'}
                    </span>
                  </label>
                </div>
                {formData.coverPhoto && (
                  <div className="mt-4">
                    <img
                      src={formData.coverPhoto}
                      alt="Cover"
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                ইনস্ট্রাক্টর নির্বাচন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="ইনস্ট্রাক্টর খুঁজুন... (নাম, ইমেইল, বা ডিজাইনেশন)"
                    value={searchTerm}
                    onChange={(e) => handleMentorSearch(e.target.value)}
                    onFocus={() => {
                      setIsFocused(true);
                      setShowMentorDropdown(true);
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                      // Delay hiding dropdown to allow click on mentor item
                      setTimeout(() => setShowMentorDropdown(false), 200);
                    }}
                  />
                  {showMentorDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredMentors.length > 0 ? (
                        filteredMentors.map((mentor) => (
                          <div
                            key={mentor._id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleMentorSelect(mentor)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {mentor.avatar ? (
                                  <img
                                    src={mentor.avatar}
                                    alt={mentor.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  mentor.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{mentor.name}</p>
                                <p className="text-sm text-gray-600">{mentor.designation}</p>
                                <p className="text-xs text-gray-500">{mentor.email}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          {searchTerm.length > 0 ? 'কোন মেন্টর পাওয়া যায়নি' : 'মেন্টর খুঁজতে টাইপ করুন'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {formData.instructor._id && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">নির্বাচিত ইনস্ট্রাক্টর:</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {formData.instructor.avatar ? (
                          <img
                            src={formData.instructor.avatar}
                            alt={formData.instructor.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          formData.instructor.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{formData.instructor.name}</p>
                        <p className="text-sm text-gray-600">{formData.instructor.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                মূল্য নির্ধারণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="regularPrice">নিয়মিত মূল্য *</Label>
                  <Input
                    id="regularPrice"
                    type="number"
                    value={formData.regularPrice}
                    onChange={(e) => handleInputChange('regularPrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discountPrice">ছাড়ের মূল্য</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => handleInputChange('discountPrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">মুদ্রা</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                সময়সূচী
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="startDate">শুরুর তারিখ *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">শেষের তারিখ *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxStudents">সর্বোচ্চ শিক্ষার্থী সংখ্যা *</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>অবস্থা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="status">ব্যাচের অবস্থা *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">{getStatusText('upcoming')}</SelectItem>
                      <SelectItem value="ongoing">{getStatusText('ongoing')}</SelectItem>
                      <SelectItem value="completed">{getStatusText('completed')}</SelectItem>
                      <SelectItem value="cancelled">{getStatusText('cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">সক্রিয়</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isMandatory"
                      checked={formData.isMandatory}
                      onChange={(e) => handleInputChange('isMandatory', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isMandatory">বাধ্যতামূলক</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {getStatusText('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  আপডেট হচ্ছে...
                </>
              ) : (
                'ব্যাচ আপডেট করুন'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
