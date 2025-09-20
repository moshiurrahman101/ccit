'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Upload, Search, Check, Loader2 } from 'lucide-react';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  designation: string;
  experience: number;
  expertise: string[];
  skills: string[];
  rating?: number;
  studentsCount?: number;
  coursesCount?: number;
}

interface FormData {
  name: string;
  description: string;
  coverPhoto: string;
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  mentorId: string;
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
    metaDescription: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface BatchFormStepsProps {
  formData: FormData;
  errors: Record<string, string>;
  selectedMentor: Mentor | null;
  mentors: Mentor[];
  mentorSearch: string;
  isUploading: boolean;
  onInputChange: (field: string, value: any) => void;
  onArrayInputChange: (field: string, value: string) => void;
  onRemoveArrayItem: (field: string, index: number) => void;
  onAddModule: () => void;
  onUpdateModule: (index: number, field: string, value: any) => void;
  onRemoveModule: (index: number) => void;
  onFileUpload: (file: File) => void;
  onMentorSearchChange: (value: string) => void;
  onMentorSelect: (mentor: Mentor) => void;
  onSetMentors: (mentors: Mentor[]) => void;
}

export function Step1BasicInfo({
  formData,
  errors,
  selectedMentor,
  mentors,
  mentorSearch,
  isUploading,
  onInputChange,
  onFileUpload,
  onMentorSearchChange,
  onMentorSelect,
  onSetMentors
}: BatchFormStepsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">ব্যাচের নাম *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="ব্যাচের নাম লিখুন"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseType">কোর্সের ধরন *</Label>
          <Select value={formData.courseType} onValueChange={(value) => onInputChange('courseType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="কোর্সের ধরন নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="online">অনলাইন</SelectItem>
              <SelectItem value="offline">অফলাইন</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>কভার ফটো</Label>
        <div className="flex items-center gap-4">
          {formData.coverPhoto && (
            <img src={formData.coverPhoto} alt="Cover" className="w-20 h-20 object-cover rounded-lg" />
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(file);
              }}
              className="hidden"
              id="cover-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('cover-upload')?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {formData.coverPhoto ? 'ফটো পরিবর্তন করুন' : 'ফটো আপলোড করুন'}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">সংক্ষিপ্ত বর্ণনা *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="ব্যাচের বর্ণনা লিখুন"
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="regularPrice">নিয়মিত মূল্য (টাকা) *</Label>
          <Input
            id="regularPrice"
            type="number"
            value={formData.regularPrice}
            onChange={(e) => onInputChange('regularPrice', parseFloat(e.target.value) || 0)}
            placeholder="নিয়মিত মূল্য লিখুন"
            className={errors.regularPrice ? 'border-red-500' : ''}
          />
          {errors.regularPrice && <p className="text-sm text-red-500">{errors.regularPrice}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountPrice">ছাড়ের মূল্য (টাকা)</Label>
          <Input
            id="discountPrice"
            type="number"
            value={formData.discountPrice || ''}
            onChange={(e) => onInputChange('discountPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="ছাড়ের মূল্য লিখুন (ঐচ্ছিক)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>মেন্টর নির্বাচন *</Label>
        <div className="relative">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              value={mentorSearch}
              onChange={(e) => onMentorSearchChange(e.target.value)}
              placeholder="মেন্টর খুঁজুন..."
              className={errors.mentorId ? 'border-red-500' : ''}
            />
          </div>
          
          {mentors.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {mentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    onMentorSelect(mentor);
                    onInputChange('mentorId', mentor._id);
                    onMentorSearchChange(mentor.name);
                    onSetMentors([]);
                  }}
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
        
        {selectedMentor && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                নির্বাচিত: {selectedMentor.name} - {selectedMentor.designation}
              </span>
            </div>
          </div>
        )}
        
        {errors.mentorId && <p className="text-sm text-red-500">{errors.mentorId}</p>}
      </div>
    </div>
  );
}

export function Step2CourseDetails({
  formData,
  errors,
  onInputChange,
  onArrayInputChange,
  onRemoveArrayItem,
  onAddModule,
  onUpdateModule,
  onRemoveModule
}: BatchFormStepsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>সিলেবাস / মডিউল *</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddModule}>
            <Plus className="h-4 w-4 mr-2" />
            মডিউল যোগ করুন
          </Button>
        </div>
        
        {formData.modules.map((module, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">মডিউল {index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveModule(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>মডিউলের শিরোনাম</Label>
                  <Input
                    value={module.title}
                    onChange={(e) => onUpdateModule(index, 'title', e.target.value)}
                    placeholder="মডিউলের শিরোনাম লিখুন"
                  />
                </div>
                <div className="space-y-2">
                  <Label>সময়কাল (ঘণ্টা)</Label>
                  <Input
                    type="number"
                    value={module.duration}
                    onChange={(e) => onUpdateModule(index, 'duration', parseFloat(e.target.value) || 0)}
                    placeholder="সময়কাল লিখুন"
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>বর্ণনা</Label>
                <Textarea
                  value={module.description}
                  onChange={(e) => onUpdateModule(index, 'description', e.target.value)}
                  placeholder="মডিউলের বর্ণনা লিখুন"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {errors.modules && <p className="text-sm text-red-500">{errors.modules}</p>}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>শিক্ষার্থীরা যা শিখবে *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="শেখার ফলাফল লিখুন"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayInputChange('whatYouWillLearn', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input.value.trim()) {
                  onArrayInputChange('whatYouWillLearn', input.value);
                  input.value = '';
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.whatYouWillLearn.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onRemoveArrayItem('whatYouWillLearn', index)}
                />
              </Badge>
            ))}
          </div>
          {errors.whatYouWillLearn && <p className="text-sm text-red-500">{errors.whatYouWillLearn}</p>}
        </div>

        <div className="space-y-2">
          <Label>প্রয়োজনীয়তা / পূর্বশর্ত</Label>
          <div className="flex gap-2">
            <Input
              placeholder="প্রয়োজনীয়তা লিখুন"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayInputChange('requirements', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input.value.trim()) {
                  onArrayInputChange('requirements', input.value);
                  input.value = '';
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.requirements.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onRemoveArrayItem('requirements', index)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>বিশেষ সুবিধা</Label>
          <div className="flex gap-2">
            <Input
              placeholder="বিশেষ সুবিধা লিখুন (যেমন: সার্টিফিকেট, আজীবন অ্যাক্সেস)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onArrayInputChange('features', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input.value.trim()) {
                  onArrayInputChange('features', input.value);
                  input.value = '';
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.features.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onRemoveArrayItem('features', index)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Step3ScheduleCapacity({
  formData,
  errors,
  onInputChange
}: BatchFormStepsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="duration">সময়কাল *</Label>
          <div className="flex gap-2">
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => onInputChange('duration', parseFloat(e.target.value) || 0)}
              placeholder="সময়কাল লিখুন"
              min="1"
            />
            <Select value={formData.durationUnit} onValueChange={(value) => onInputChange('durationUnit', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="days">দিন</SelectItem>
                <SelectItem value="weeks">সপ্তাহ</SelectItem>
                <SelectItem value="months">মাস</SelectItem>
                <SelectItem value="years">বছর</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxStudents">সর্বোচ্চ শিক্ষার্থী</Label>
          <Input
            id="maxStudents"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => onInputChange('maxStudents', parseInt(e.target.value) || 0)}
            placeholder="সর্বোচ্চ শিক্ষার্থী সংখ্যা"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startDate">শুরুর তারিখ *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onInputChange('startDate', e.target.value)}
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">শেষের তারিখ *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => onInputChange('endDate', e.target.value)}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
        </div>
      </div>
    </div>
  );
}

export function Step4SEOMarketing({
  formData,
  errors,
  onInputChange,
  onArrayInputChange,
  onRemoveArrayItem
}: BatchFormStepsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="slug">ইউআরএল স্লাগ *</Label>
        <Input
          id="slug"
          value={formData.marketing.slug}
          onChange={(e) => onInputChange('marketing.slug', e.target.value)}
          placeholder="ইউআরএল স্লাগ লিখুন"
          className={errors['marketing.slug'] ? 'border-red-500' : ''}
        />
        <p className="text-sm text-gray-500">
          ইউআরএল: /batches/{formData.marketing.slug || 'your-slug'}
        </p>
        {errors['marketing.slug'] && <p className="text-sm text-red-500">{errors['marketing.slug']}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">মেটা বর্ণনা</Label>
        <Textarea
          id="metaDescription"
          value={formData.marketing.metaDescription}
          onChange={(e) => onInputChange('marketing.metaDescription', e.target.value)}
          placeholder="এসইওর জন্য মেটা বর্ণনা লিখুন"
          rows={3}
          maxLength={160}
        />
        <p className="text-sm text-gray-500">
          {formData.marketing.metaDescription.length}/160 অক্ষর
        </p>
      </div>

      <div className="space-y-2">
        <Label>ট্যাগ</Label>
        <div className="flex gap-2">
          <Input
            placeholder="ট্যাগ লিখুন"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onArrayInputChange('marketing.tags', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input.value.trim()) {
                onArrayInputChange('marketing.tags', input.value);
                input.value = '';
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.marketing.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveArrayItem('marketing.tags', index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Step5Finalize({
  formData,
  selectedMentor,
  onInputChange
}: BatchFormStepsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">ব্যাচের বিবরণ পর্যালোচনা</h3>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">মূল তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>নাম:</strong> {formData.name}</p>
            <p><strong>ধরন:</strong> {formData.courseType}</p>
            <p><strong>মূল্য:</strong> ৳{formData.regularPrice.toLocaleString()}</p>
            {formData.discountPrice && (
              <p><strong>ছাড়ের মূল্য:</strong> ৳{formData.discountPrice.toLocaleString()}</p>
            )}
            <p><strong>মেন্টর:</strong> {selectedMentor?.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">কোর্সের বিবরণ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>মডিউল:</strong> {formData.modules.length}</p>
            <p><strong>শেখার ফলাফল:</strong> {formData.whatYouWillLearn.length}</p>
            <p><strong>বিশেষ সুবিধা:</strong> {formData.features.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">সময়সূচী ও ধারণক্ষমতা</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>সময়কাল:</strong> {formData.duration} {formData.durationUnit}</p>
            <p><strong>শুরুর তারিখ:</strong> {new Date(formData.startDate).toLocaleDateString()}</p>
            <p><strong>শেষের তারিখ:</strong> {new Date(formData.endDate).toLocaleDateString()}</p>
            <p><strong>সর্বোচ্চ শিক্ষার্থী:</strong> {formData.maxStudents}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="draft">Save as Draft</SelectItem>
              <SelectItem value="published">Publish</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
