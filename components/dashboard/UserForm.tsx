'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { Loader2, User, Mail, Phone, Shield, ToggleLeft } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'mentor' | 'student' | 'marketing' | 'support';
  isActive: boolean;
  createdAt: string;
}

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const roleOptions = [
  { value: 'admin', label: 'অ্যাডমিন', description: 'সম্পূর্ণ অ্যাক্সেস' },
  { value: 'mentor', label: 'মেন্টর', description: 'কোর্স ও শিক্ষার্থী ব্যবস্থাপনা' },
  { value: 'student', label: 'শিক্ষার্থী', description: 'কোর্সে অংশগ্রহণ ও শেখা' },
  { value: 'marketing', label: 'মার্কেটিং', description: 'বাজারজাতকরণ ও প্রচারণা' },
  { value: 'support', label: 'সাপোর্ট', description: 'গ্রাহক সেবা ও সহায়তা' }
];

export default function UserForm({ user, isOpen, onClose, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'mentor' as 'admin' | 'mentor' | 'student' | 'marketing' | 'support',
    password: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        password: '',
        isActive: user.isActive
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'mentor',
        password: '',
        isActive: true
      });
    }
  }, [user, isOpen]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      const url = user ? `/api/users/${user._id}` : '/api/users';
      const method = user ? 'PUT' : 'POST';
      
      const body: Record<string, unknown> = { ...formData };
      if (user && !body.password) {
        delete body.password; // Don't update password if empty
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
        toast.success(data.message || 'ব্যবহারকারী সফলভাবে সংরক্ষিত হয়েছে');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 shadow-xl z-50 text-gray-900 max-w-md p-3 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4 border-b border-gray-200">
          <DialogTitle className="text-gray-900 text-lg sm:text-xl font-semibold">
            {user ? 'ব্যবহারকারী সম্পাদনা' : 'নতুন ব্যবহারকারী'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">
              <User className="inline w-4 h-4 mr-2" />
              নাম *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="পূর্ণ নাম লিখুন"
              className="bg-white border-gray-300"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              <Mail className="inline w-4 h-4 mr-2" />
              ইমেইল *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="ইমেইল ঠিকানা লিখুন"
              className="bg-white border-gray-300"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              <Phone className="inline w-4 h-4 mr-2" />
              ফোন নম্বর
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="ফোন নম্বর লিখুন"
              className="bg-white border-gray-300"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700 font-medium">
              <Shield className="inline w-4 h-4 mr-2" />
              ভূমিকা *
            </Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              পাসওয়ার্ড {user ? '(খালি রাখলে পরিবর্তন হবে না)' : '*'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={user ? 'নতুন পাসওয়ার্ড লিখুন' : 'পাসওয়ার্ড লিখুন'}
              className="bg-white border-gray-300"
              required={!user}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
            <Label htmlFor="isActive" className="text-gray-700 font-medium flex items-center">
              <ToggleLeft className="inline w-4 h-4 mr-2" />
              {getStatusText('active')} অ্যাকাউন্ট
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              {getStatusText('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {user ? 'আপডেট' : 'তৈরি করুন'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
