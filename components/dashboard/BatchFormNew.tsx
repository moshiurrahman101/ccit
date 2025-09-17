'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Edit, X, Calendar, Users, DollarSign, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Batch {
  _id?: string;
  name: string;
  description?: string;
  courseType: 'batch' | 'course';
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  fee: number;
  currency: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents?: number;
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
    name: string;
    email: string;
    phone: string;
    bio: string;
  };
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface BatchFormProps {
  batch?: Batch | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchFormNew({ 
  batch, 
  isOpen, 
  onClose, 
  onSuccess 
}: BatchFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: 'batch' as 'batch' | 'course',
    duration: 3,
    durationUnit: 'months' as 'days' | 'weeks' | 'months' | 'years',
    fee: 0,
    currency: 'BDT',
    startDate: '',
    endDate: '',
    maxStudents: 30,
    prerequisites: [] as string[],
    modules: [] as { title: string; description: string; duration: number; order: number }[],
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    isActive: true,
    isMandatory: true,
    instructor: {
      name: '',
      email: '',
      phone: '',
      bio: ''
    },
    tags: [] as string[],
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newModule, setNewModule] = useState({ title: '', description: '', duration: 0, order: 0 });
  const [newTag, setNewTag] = useState('');

  const isEdit = !!batch;
  const totalSteps = 4;

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || '',
        description: batch.description || '',
        courseType: batch.courseType || 'batch',
        duration: batch.duration || 3,
        durationUnit: batch.durationUnit || 'months',
        fee: batch.fee || 0,
        currency: batch.currency || 'BDT',
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
        maxStudents: batch.maxStudents || 30,
        prerequisites: batch.prerequisites || [],
        modules: batch.modules || [],
        status: batch.status || 'upcoming',
        isActive: batch.isActive !== undefined ? batch.isActive : true,
        isMandatory: batch.isMandatory !== undefined ? batch.isMandatory : true,
        instructor: batch.instructor || { name: '', email: '', phone: '', bio: '' },
        tags: batch.tags || [],
        level: batch.level || 'beginner'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        courseType: 'batch',
        duration: 3,
        durationUnit: 'months',
        fee: 0,
        currency: 'BDT',
        startDate: '',
        endDate: '',
        maxStudents: 30,
        prerequisites: [],
        modules: [],
        status: 'upcoming',
        isActive: true,
        isMandatory: true,
        instructor: { name: '', email: '', phone: '', bio: '' },
        tags: [],
        level: 'beginner'
      });
    }
    setErrors({});
    setCurrentStep(1);
  }, [batch, isOpen]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'নাম প্রয়োজন';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'বিবরণ প্রয়োজন';
      }
      if (formData.fee < 0) {
        newErrors.fee = 'ফি শূন্য বা তার বেশি হতে হবে';
      }
    }

    if (step === 2) {
      if (!formData.startDate) {
        newErrors.startDate = 'শুরুর তারিখ প্রয়োজন';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'শেষের তারিখ প্রয়োজন';
      }
      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        if (startDate >= endDate) {
          newErrors.endDate = 'শেষের তারিখ শুরুর তারিখের পরে হতে হবে';
        }
      }
      if (formData.maxStudents < 1) {
        newErrors.maxStudents = 'সর্বনিম্ন ১ জন শিক্ষার্থী হতে হবে';
      }
    }

    if (step === 3) {
      if (!formData.instructor.name.trim()) {
        newErrors.instructorName = 'ইনস্ট্রাক্টরের নাম প্রয়োজন';
      }
      if (!formData.instructor.email.trim()) {
        newErrors.instructorEmail = 'ইনস্ট্রাক্টরের ইমেইল প্রয়োজন';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addModule = () => {
    if (newModule.title.trim()) {
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, { ...newModule, order: prev.modules.length + 1 }]
      }));
      setNewModule({ title: '', description: '', duration: 0, order: 0 });
    }
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      const url = isEdit ? `/api/batches/${batch._id}` : '/api/batches';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEdit ? 'ব্যাচ আপডেট হয়েছে' : 'ব্যাচ তৈরি হয়েছে');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">নাম *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="ব্যাচ/কোর্সের নাম"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">বিবরণ *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="ব্যাচ/কোর্সের বিবরণ"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseType">ধরন</Label>
                <Select value={formData.courseType} onValueChange={(value) => handleInputChange('courseType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="batch">ব্যাচ</SelectItem>
                    <SelectItem value="course">কোর্স</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">সময়কাল *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="durationUnit">একক</Label>
                <Select value={formData.durationUnit} onValueChange={(value) => handleInputChange('durationUnit', value)}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fee">ফি *</Label>
                <Input
                  id="fee"
                  type="number"
                  value={formData.fee}
                  onChange={(e) => handleInputChange('fee', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  className={errors.fee ? 'border-red-500' : ''}
                />
                {errors.fee && <p className="text-sm text-red-500 mt-1">{errors.fee}</p>}
              </div>

              <div>
                <Label htmlFor="currency">মুদ্রা</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">শুরুর তারিখ *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate">শেষের তারিখ *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="maxStudents">সর্বোচ্চ শিক্ষার্থী সংখ্যা *</Label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                min="1"
                className={errors.maxStudents ? 'border-red-500' : ''}
              />
              {errors.maxStudents && <p className="text-sm text-red-500 mt-1">{errors.maxStudents}</p>}
            </div>

            <div>
              <Label>পূর্বশর্ত</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="পূর্বশর্ত যোগ করুন"
                  onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                />
                <Button type="button" onClick={addPrerequisite} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.prerequisites.map((prereq, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {prereq}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>ট্যাগ</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="ট্যাগ যোগ করুন"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ইনস্ট্রাক্টর তথ্য</h3>
            
            <div>
              <Label htmlFor="instructorName">নাম *</Label>
              <Input
                id="instructorName"
                value={formData.instructor.name}
                onChange={(e) => handleInputChange('instructor.name', e.target.value)}
                placeholder="ইনস্ট্রাক্টরের নাম"
                className={errors.instructorName ? 'border-red-500' : ''}
              />
              {errors.instructorName && <p className="text-sm text-red-500 mt-1">{errors.instructorName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructorEmail">ইমেইল *</Label>
                <Input
                  id="instructorEmail"
                  type="email"
                  value={formData.instructor.email}
                  onChange={(e) => handleInputChange('instructor.email', e.target.value)}
                  placeholder="ইমেইল ঠিকানা"
                  className={errors.instructorEmail ? 'border-red-500' : ''}
                />
                {errors.instructorEmail && <p className="text-sm text-red-500 mt-1">{errors.instructorEmail}</p>}
              </div>

              <div>
                <Label htmlFor="instructorPhone">ফোন</Label>
                <Input
                  id="instructorPhone"
                  value={formData.instructor.phone}
                  onChange={(e) => handleInputChange('instructor.phone', e.target.value)}
                  placeholder="ফোন নম্বর"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructorBio">বায়ো</Label>
              <Textarea
                id="instructorBio"
                value={formData.instructor.bio}
                onChange={(e) => handleInputChange('instructor.bio', e.target.value)}
                placeholder="ইনস্ট্রাক্টরের সংক্ষিপ্ত পরিচয়"
                rows={3}
              />
            </div>

            <div>
              <Label>কোর্স মডিউল</Label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newModule.title}
                    onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="মডিউলের নাম"
                  />
                  <Input
                    type="number"
                    value={newModule.duration}
                    onChange={(e) => setNewModule(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    placeholder="সময়কাল (ঘন্টা)"
                    min="0"
                  />
                </div>
                <Textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="মডিউলের বিবরণ"
                  rows={2}
                />
                <Button type="button" onClick={addModule} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  মডিউল যোগ করুন
                </Button>
              </div>
              
              <div className="mt-4 space-y-2">
                {formData.modules.map((module, index) => (
                  <div key={index} className="p-3 border rounded-lg flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{module.title}</h4>
                      <p className="text-sm text-gray-600">{module.description}</p>
                      <p className="text-xs text-gray-500">{module.duration} ঘন্টা</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeModule(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">অবস্থা এবং সেটিংস</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">অবস্থা</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">আসন্ন</SelectItem>
                    <SelectItem value="ongoing">চলমান</SelectItem>
                    <SelectItem value="completed">সম্পন্ন</SelectItem>
                    <SelectItem value="cancelled">বাতিল</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">সারসংক্ষেপ</h4>
              <div className="space-y-1 text-sm">
                <p><strong>নাম:</strong> {formData.name}</p>
                <p><strong>ধরন:</strong> {formData.courseType === 'batch' ? 'ব্যাচ' : 'কোর্স'}</p>
                <p><strong>সময়কাল:</strong> {formData.duration} {formData.durationUnit}</p>
                <p><strong>ফি:</strong> {formData.fee} {formData.currency}</p>
                <p><strong>শিক্ষার্থী:</strong> {formData.maxStudents} জন</p>
                <p><strong>ইনস্ট্রাক্টর:</strong> {formData.instructor.name}</p>
                <p><strong>মডিউল:</strong> {formData.modules.length} টি</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>{isEdit ? 'ব্যাচ সম্পাদনা করুন' : 'নতুন ব্যাচ/কোর্স তৈরি করুন'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      i + 1 < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  পূর্ববর্তী
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                বাতিল
              </Button>
              
              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  পরবর্তী
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEdit ? 'আপডেট করুন' : 'তৈরি করুন'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
