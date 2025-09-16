'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Edit, X } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  batch: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

interface Batch {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
}

interface StudentFormProps {
  student?: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentForm({ 
  student, 
  isOpen, 
  onClose, 
  onSuccess
}: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batch: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const isEdit = !!student;

  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const response = await fetch('/api/batches/active');
      const data = await response.json();
      
      if (response.ok) {
        setBatches(data.batches);
      } else {
        toast.error('ব্যাচের তথ্য লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBatches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        batch: student.batch || '',
        status: student.status || 'active',
        password: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        batch: '',
        status: 'active',
        password: ''
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'নাম প্রয়োজন';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'ইমেইল প্রয়োজন';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'সঠিক ইমেইল ঠিকানা দিন';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'ফোন নম্বর প্রয়োজন';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'সঠিক ফোন নম্বর দিন';
    }

    if (!formData.batch) {
      newErrors.batch = 'ব্যাচ নির্বাচন করুন';
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'পাসওয়ার্ড প্রয়োজন';
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
      const token = localStorage.getItem('token');
      const url = isEdit ? `/api/students/${student._id}` : '/api/students';
      const method = isEdit ? 'PUT' : 'POST';

      const body: Record<string, unknown> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        batch: formData.batch,
        status: formData.status
      };

      if (!isEdit || formData.password.trim()) {
        body.password = formData.password || '123456';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEdit ? 'শিক্ষার্থী আপডেট হয়েছে' : 'শিক্ষার্থী যোগ করা হয়েছে');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl z-50 text-gray-900">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            {isEdit ? (
              <>
                <Edit className="h-5 w-5" />
                শিক্ষার্থী সম্পাদনা
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                নতুন শিক্ষার্থী যোগ করুন
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">নাম *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="শিক্ষার্থীর নাম"
                className={`bg-white border-gray-300 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">ইমেইল *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                className={`bg-white border-gray-300 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">ফোন নম্বর *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="০১৭১২৩৪৫৬৭৮"
                className={`bg-white border-gray-300 ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Batch */}
            <div className="space-y-2">
              <Label htmlFor="batch" className="text-gray-700 font-medium">ব্যাচ *</Label>
              <Select
                value={formData.batch}
                onValueChange={(value) => handleInputChange('batch', value)}
                disabled={loadingBatches}
              >
                <SelectTrigger className={`bg-white border-gray-300 ${errors.batch ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={loadingBatches ? "ব্যাচ লোড হচ্ছে..." : "ব্যাচ নির্বাচন করুন"} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {batches.map((batch) => (
                    <SelectItem key={batch._id} value={batch.name}>
                      <div className="flex flex-col">
                        <span>{batch.name}</span>
                        <span className="text-xs text-gray-500">
                          {batch.currentStudents}/{batch.maxStudents} শিক্ষার্থী
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.batch && (
                <p className="text-sm text-red-500">{errors.batch}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 font-medium">স্ট্যাটাস</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="active">সক্রিয়</SelectItem>
                  <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                  <SelectItem value="suspended">স্থগিত</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                পাসওয়ার্ড {!isEdit && '*'}
                {isEdit && <span className="text-gray-500 text-sm"> (খালি রাখলে পরিবর্তন হবে না)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={isEdit ? 'নতুন পাসওয়ার্ড' : 'পাসওয়ার্ড'}
                className={`bg-white border-gray-300 ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
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
              বাতিল
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'আপডেট হচ্ছে...' : 'যোগ করা হচ্ছে...'}
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
                      <UserPlus className="h-4 w-4 mr-2" />
                      যোগ করুন
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
