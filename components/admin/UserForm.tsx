'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'marketing' | 'support';
  phone?: string;
  isActive: boolean;
}

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as 'admin' | 'mentor' | 'marketing' | 'support' | '',
    phone: '',
    isActive: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        phone: user.phone || '',
        isActive: user.isActive
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = user ? `/api/admin/users/${user._id}` : '/api/admin/users';
      const method = user ? 'PUT' : 'POST';
      
      const body: Record<string, unknown> = { ...formData };
      if (user && !body.password) {
        delete body.password; // Don't update password if empty
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      setError('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">নাম *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="ব্যবহারকারীর নাম"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">ইমেইল *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="example@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          পাসওয়ার্ড {user ? '(খালি রাখলে পরিবর্তন হবে না)' : '*'}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={user ? 'নতুন পাসওয়ার্ড' : 'পাসওয়ার্ড'}
            required={!user}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">ভূমিকা *</Label>
        <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">অ্যাডমিন</SelectItem>
            <SelectItem value="mentor">মেন্টর</SelectItem>
            <SelectItem value="marketing">মার্কেটিং</SelectItem>
            <SelectItem value="support">সাপোর্ট</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">ফোন নম্বর</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="01XXXXXXXXX"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleChange('isActive', checked)}
        />
        <Label htmlFor="isActive">সক্রিয় অ্যাকাউন্ট</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          বাতিল
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {user ? 'আপডেট' : 'তৈরি করুন'}
        </Button>
      </div>
    </form>
  );
}
