'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  X, 
  Upload,
  UserPlus,
  User,
  Briefcase,
  Globe,
  BookOpen,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { uploadImage } from '@/lib/cloudinary';

interface FormData {
  // Step 1: Basic Information
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  designation: string;

  // Step 2: Professional Information
  experience: number;
  expertise: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;

  // Step 3: Skills & Languages
  skills: string[];
  languages: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
  }>;

  // Step 4: Social Links
  socialLinks: {
    website: string;
    linkedin: string;
    github: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    portfolio: string;
  };

  // Step 5: Teaching & Availability
  teachingExperience: number;
  teachingStyle: string;
  availability: {
    timezone: string;
    workingHours: string;
    availableDays: string[];
  };

  // Step 6: Status
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified: boolean;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
  designation: '',
  experience: 0,
  expertise: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  socialLinks: {
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    facebook: '',
    instagram: '',
    youtube: '',
    portfolio: ''
  },
  teachingExperience: 0,
  teachingStyle: '',
  availability: {
    timezone: 'Asia/Dhaka',
    workingHours: '9:00 AM - 6:00 PM',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  status: 'pending',
  isVerified: false
};

const steps = [
  { id: 1, title: 'মূল তথ্য', description: 'মেন্টরের ব্যক্তিগত তথ্য', icon: User },
  { id: 2, title: 'পেশাগত তথ্য', description: 'অভিজ্ঞতা ও শিক্ষাগত যোগ্যতা', icon: Briefcase },
  { id: 3, title: 'দক্ষতা', description: 'স্কিল ও ভাষা', icon: BookOpen },
  { id: 4, title: 'সামাজিক লিংক', description: 'সোশ্যাল মিডিয়া প্রোফাইল', icon: Globe },
  { id: 5, title: 'শিক্ষাদান', description: 'শিক্ষাদান পদ্ধতি ও সময়', icon: UserPlus },
  { id: 6, title: 'স্ট্যাটাস', description: 'মেন্টর স্ট্যাটাস সেটিং', icon: Settings }
];

export default function EditMentorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tempInputs, setTempInputs] = useState({
    expertise: '',
    education: '',
    skills: '',
    languages: '',
    certifications: '',
  });
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;

  const fetchMentor = useCallback(async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/mentors/${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mentor');
      }

      const data = await response.json();
      const mentor = data.mentor;
      
      // Populate form data
      setFormData({
        name: mentor.name || '',
        email: mentor.email || '',
        phone: mentor.phone || '',
        avatar: mentor.avatar || '',
        bio: mentor.bio || '',
        designation: mentor.designation || '',
        experience: mentor.experience || 0,
        expertise: mentor.expertise || [],
        education: mentor.education || [],
        skills: mentor.skills || [],
        languages: mentor.languages || [],
        certifications: mentor.certifications || [],
        socialLinks: {
          website: mentor.socialLinks?.website || '',
          linkedin: mentor.socialLinks?.linkedin || '',
          github: mentor.socialLinks?.github || '',
          twitter: mentor.socialLinks?.twitter || '',
          facebook: mentor.socialLinks?.facebook || '',
          instagram: mentor.socialLinks?.instagram || '',
          youtube: mentor.socialLinks?.youtube || '',
          portfolio: mentor.socialLinks?.portfolio || ''
        },
        teachingExperience: mentor.teachingExperience || 0,
        teachingStyle: mentor.teachingStyle || '',
        availability: {
          timezone: mentor.availability?.timezone || 'Asia/Dhaka',
          workingHours: mentor.availability?.workingHours || '9:00 AM - 6:00 PM',
          availableDays: mentor.availability?.availableDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        status: mentor.status || 'pending',
        isVerified: mentor.isVerified || false
      });
    } catch (error) {
      console.error('Error fetching mentor:', error);
      setError('Failed to fetch mentor details');
    } finally {
      setFetching(false);
    }
  }, [mentorId, router]);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchMentor();
  }, [isAuthenticated, user, router, mentorId, fetchMentor]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof FormData] as Record<string, unknown>),
        [field]: value
      }
    }));
  };

  const handleArrayAdd = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof FormData] as string[]), value.trim()]
      }));
      setTempInputs(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof FormData] as any[];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  };

  const handleEducationAdd = () => {
    if (tempInputs.education.trim()) {
      const [degree, institution, year] = tempInputs.education.split('|').map(s => s.trim());
      if (degree && institution && year) {
        setFormData(prev => ({
          ...prev,
          education: [...prev.education, {
            degree,
            institution,
            year: parseInt(year) || new Date().getFullYear()
          }]
        }));
        setTempInputs(prev => ({
          ...prev,
          education: ''
        }));
      }
    }
  };

  const handleCertificationAdd = () => {
    if (tempInputs.certifications.trim()) {
      const [name, issuer, date, credentialId] = tempInputs.certifications.split('|').map(s => s.trim());
      if (name && issuer && date) {
        setFormData(prev => ({
          ...prev,
          certifications: [...prev.certifications, {
            name,
            issuer,
            date,
            credentialId: credentialId || ''
          }]
        }));
        setTempInputs(prev => ({
          ...prev,
          certifications: ''
        }));
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      handleInputChange('avatar', imageUrl);
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/mentors/${mentorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update mentor');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/mentors');
      }, 2000);
    } catch (error) {
      console.error('Error updating mentor:', error);
      setError(error instanceof Error ? error.message : 'Failed to update mentor');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-orange-600" />
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">নাম *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="মেন্টরের পূর্ণ নাম"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">ইমেইল *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="mentor@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">ফোন</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+880 1XXX XXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="designation">পদবি</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Senior Developer, UI/UX Expert"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">বায়ো</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="মেন্টরের সম্পর্কে সংক্ষিপ্ত বর্ণনা"
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="experience">অভিজ্ঞতা (বছর) *</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                placeholder="5"
                required
              />
            </div>

            <div>
              <Label>বিশেষজ্ঞতা</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tempInputs.expertise}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, expertise: e.target.value }))}
                  placeholder="বিশেষজ্ঞতা যোগ করুন"
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayAdd('expertise', tempInputs.expertise)}
                />
                <Button
                  type="button"
                  onClick={() => handleArrayAdd('expertise', tempInputs.expertise)}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.expertise.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleArrayRemove('expertise', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>শিক্ষাগত যোগ্যতা</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tempInputs.education}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="ডিগ্রি | প্রতিষ্ঠান | বছর (যেমন: BSc | DU | 2020)"
                  onKeyPress={(e) => e.key === 'Enter' && handleEducationAdd()}
                />
                <Button
                  type="button"
                  onClick={handleEducationAdd}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.education.map((edu, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{edu.degree} - {edu.institution} ({edu.year})</span>
                      <X
                        className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                        onClick={() => handleArrayRemove('education', index)}
                      />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>টেকনিক্যাল স্কিল</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tempInputs.skills}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="স্কিল যোগ করুন"
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayAdd('skills', tempInputs.skills)}
                />
                <Button
                  type="button"
                  onClick={() => handleArrayAdd('skills', tempInputs.skills)}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleArrayRemove('skills', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>ভাষা</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tempInputs.languages}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, languages: e.target.value }))}
                  placeholder="ভাষা যোগ করুন"
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayAdd('languages', tempInputs.languages)}
                />
                <Button
                  type="button"
                  onClick={() => handleArrayAdd('languages', tempInputs.languages)}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleArrayRemove('languages', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>সার্টিফিকেশন</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tempInputs.certifications}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, certifications: e.target.value }))}
                  placeholder="নাম | প্রদানকারী | তারিখ | ক্রেডেনশিয়াল আইডি"
                  onKeyPress={(e) => e.key === 'Enter' && handleCertificationAdd()}
                />
                <Button
                  type="button"
                  onClick={handleCertificationAdd}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{cert.name} - {cert.issuer} ({cert.date})</span>
                      <X
                        className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                        onClick={() => handleArrayRemove('certifications', index)}
                      />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="website">ওয়েবসাইট</Label>
                <Input
                  id="website"
                  value={formData.socialLinks.website}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={formData.socialLinks.github}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'github', e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'youtube', e.target.value)}
                  placeholder="https://youtube.com/@username"
                />
              </div>

              <div>
                <Label htmlFor="portfolio">পোর্টফোলিও</Label>
                <Input
                  id="portfolio"
                  value={formData.socialLinks.portfolio}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'portfolio', e.target.value)}
                  placeholder="https://portfolio.example.com"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="teachingExperience">শিক্ষাদান অভিজ্ঞতা (বছর)</Label>
              <Input
                id="teachingExperience"
                type="number"
                min="0"
                max="50"
                value={formData.teachingExperience}
                onChange={(e) => handleInputChange('teachingExperience', parseInt(e.target.value) || 0)}
                placeholder="3"
              />
            </div>

            <div>
              <Label htmlFor="teachingStyle">শিক্ষাদান পদ্ধতি</Label>
              <Textarea
                id="teachingStyle"
                value={formData.teachingStyle}
                onChange={(e) => handleInputChange('teachingStyle', e.target.value)}
                placeholder="মেন্টরের শিক্ষাদান পদ্ধতি বর্ণনা করুন"
                rows={3}
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timezone">টাইমজোন</Label>
                <select
                  id="timezone"
                  value={formData.availability.timezone}
                  onChange={(e) => handleNestedInputChange('availability', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>

              <div>
                <Label htmlFor="workingHours">কাজের সময়</Label>
                <Input
                  id="workingHours"
                  value={formData.availability.workingHours}
                  onChange={(e) => handleNestedInputChange('availability', 'workingHours', e.target.value)}
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>
            </div>

            <div>
              <Label>উপলব্ধ দিন</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.availability.availableDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleNestedInputChange('availability', 'availableDays', [...formData.availability.availableDays, day]);
                        } else {
                          handleNestedInputChange('availability', 'availableDays', formData.availability.availableDays.filter(d => d !== day));
                        }
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm capitalize">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="status">স্ট্যাটাস</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="pending">{getStatusText('pending')}</option>
                <option value="active">{getStatusText('active')}</option>
                <option value="inactive">{getStatusText('inactive')}</option>
                <option value="suspended">{getStatusText('suspended')}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <Label htmlFor="isVerified">{getStatusText('verified')} মেন্টর</Label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">মেন্টর আপডেট করার আগে</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• নিশ্চিত করুন যে সমস্ত তথ্য সঠিকভাবে পূরণ করা হয়েছে</li>
                <li>• স্ট্যাটাস পরিবর্তন করার আগে যাচাই করুন</li>
                <li>• পরিবর্তনগুলি সংরক্ষণ করার পর তা অবিলম্বে কার্যকর হবে</li>
                <li>• ইমেইল পরিবর্তন করলে নতুন ব্যবহারকারী তৈরি হতে পারে</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            মেন্টর লোড হচ্ছে...
          </h1>
          <p className="text-gray-600">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/mentors')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ফিরে যান
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">মেন্টর সম্পাদনা করুন</h1>
        <p className="text-gray-600 mt-2">
          ধাপে ধাপে মেন্টরের তথ্য আপডেট করুন
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block absolute top-5 left-1/2 w-full h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} style={{ transform: 'translateX(50%)', width: 'calc(100% - 2.5rem)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 mr-2" })}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="mt-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            মেন্টর সফলভাবে আপডেট হয়েছে! পুনর্নির্দেশিত হচ্ছে...
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          পূর্ববর্তী
        </Button>

        <div className="flex gap-2">
          {currentStep === steps.length ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Updating...' : 'Update Mentor'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-orange-600 hover:bg-orange-700"
            >
              পরবর্তী
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
