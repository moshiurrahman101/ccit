'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, BookOpen, Edit, X, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusText } from '@/lib/utils/statusDictionary';

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

export default function BatchForm({ 
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
        duration: batch.duration || 1,
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
        isMandatory: batch.isMandatory || false,
        instructor: batch.instructor || { name: '', email: '', phone: '', bio: '' },
        tags: batch.tags || [],
        level: batch.level || 'beginner'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        courseType: 'batch',
        duration: 1,
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
        isMandatory: false,
        instructor: { name: '', email: '', phone: '', bio: '' },
        tags: [],
        level: 'beginner'
      });
    }
    setErrors({});
  }, [batch, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'ব্যাচের নাম প্রয়োজন';
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'সামনে আসছে';
      case 'ongoing': return 'চলছে';
      case 'completed': return 'শেষ হয়েছে';
      case 'cancelled': return 'ক্যানসেল';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl z-50 text-gray-900 p-3 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-gray-900 text-lg sm:text-xl">
            {isEdit ? (
              <>
                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                ব্যাচ সম্পাদনা
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                নতুন ব্যাচ তৈরি
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">ব্যাচের নাম *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="যেমন: Batch-2024-01"
                className={`bg-white border-gray-300 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Max Students */}
            <div className="space-y-2">
              <Label htmlFor="maxStudents" className="text-gray-700 font-medium">সর্বোচ্চ শিক্ষার্থী সংখ্যা *</Label>
              <Input
                id="maxStudents"
                type="number"
                min="1"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 1)}
                placeholder="30"
                className={`bg-white border-gray-300 ${errors.maxStudents ? 'border-red-500' : ''}`}
              />
              {errors.maxStudents && (
                <p className="text-sm text-red-500">{errors.maxStudents}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-gray-700 font-medium">শুরুর তারিখ *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`bg-white border-gray-300 ${errors.startDate ? 'border-red-500' : ''}`}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-gray-700 font-medium">শেষের তারিখ *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`bg-white border-gray-300 ${errors.endDate ? 'border-red-500' : ''}`}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 font-medium">অবস্থা</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="upcoming">সামনে আসছে</SelectItem>
                  <SelectItem value="ongoing">চলছে</SelectItem>
                  <SelectItem value="completed">শেষ হয়েছে</SelectItem>
                  <SelectItem value="cancelled">ক্যানসেল</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label htmlFor="isActive" className="text-gray-700 font-medium">অ্যাক্টিভ</Label>
              <Select
                value={formData.isActive ? 'true' : 'false'}
                onValueChange={(value) => handleInputChange('isActive', value === 'true')}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="true">অ্যাক্টিভ</SelectItem>
                  <SelectItem value="false">{getStatusText('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium">বিবরণ</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="ব্যাচ সম্পর্কে বিস্তারিত তথ্য..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              {getStatusText('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...'}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      আপডেট
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      তৈরি করুন
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
