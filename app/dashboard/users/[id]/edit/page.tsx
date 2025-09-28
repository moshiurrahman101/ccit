'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  ToggleLeft,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'mentor' | 'marketing' | 'support';
  isActive: boolean;
  createdAt: string;
}

const roleOptions = [
  { value: 'admin', label: 'অ্যাডমিন', description: 'সম্পূর্ণ অ্যাক্সেস' },
  { value: 'mentor', label: 'মেন্টর', description: 'কোর্স ও শিক্ষার্থী ব্যবস্থাপনা' },
  { value: 'marketing', label: 'মার্কেটিং', description: 'বাজারজাতকরণ ও প্রচারণা' },
  { value: 'support', label: 'সাপোর্ট', description: 'গ্রাহক সেবা ও সহায়তা' }
];

export default function EditUserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'mentor' as 'admin' | 'mentor' | 'marketing' | 'support',
    password: '',
    isActive: true
  });
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        role: data.user.role,
        password: '',
        isActive: data.user.isActive
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchUser();
  }, [isAuthenticated, currentUser, router, fetchUser]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const body: Record<string, unknown> = { ...formData };
      if (!body.password) {
        delete body.password; // Don't update password if empty
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('ব্যবহারকারীর তথ্য সফলভাবে আপডেট হয়েছে');
        setTimeout(() => {
          router.push('/dashboard/users');
        }, 2000);
      } else {
        setError(data.error || 'একটি সমস্যা হয়েছে');
        toast.error(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('নেটওয়ার্ক সমস্যা হয়েছে');
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            {getStatusText('dashboard_loading')}
          </h1>
          <p className="text-gray-600">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ব্যবহারকারী পাওয়া যায়নি
          </h1>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <Button onClick={() => router.push('/dashboard/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>
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
          onClick={() => router.push('/dashboard/users')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ফিরে যান
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ব্যবহারকারী সম্পাদনা</h1>
            <p className="text-gray-600 mt-2">
              {user?.name} এর তথ্য আপডেট করুন
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ব্যবহারকারীর তথ্য সফলভাবে আপডেট হয়েছে! পুনর্নির্দেশিত হচ্ছে...
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                ব্যবহারকারী তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={(e) => handleInputChange('name', e.target.value)}
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
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
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
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
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
                    পাসওয়ার্ড (খালি রাখলে পরিবর্তন হবে না)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                    className="bg-white border-gray-300"
                  />
                  <p className="text-sm text-gray-500">
                    পাসওয়ার্ড পরিবর্তন করতে চাইলে নতুন পাসওয়ার্ড লিখুন
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive" className="text-gray-700 font-medium flex items-center">
                    <ToggleLeft className="inline w-4 h-4 mr-2" />
                    {getStatusText('active')} অ্যাকাউন্ট
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/users')}
                    disabled={saving}
                    className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {getStatusText('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {saving ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>ব্যবহারকারী তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                    {roleOptions.find(r => r.value === user?.role)?.label}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">স্ট্যাটাস:</span>
                  <span className={user?.isActive ? 'text-green-600' : 'text-red-600'}>
                    {user?.isActive ? getStatusText('active') : getStatusText('inactive')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">তৈরি হয়েছে:</span>
                  <span className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-BD') : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Info */}
          <Card>
            <CardHeader>
              <CardTitle>পাসওয়ার্ড তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">পাসওয়ার্ড আপডেট</h4>
                  <p className="text-sm text-blue-800">
                    নতুন পাসওয়ার্ড দিতে চাইলে উপরের ফিল্ডে লিখুন। খালি রাখলে বর্তমান পাসওয়ার্ড অপরিবর্তিত থাকবে।
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-1">সতর্কতা</h4>
                  <p className="text-sm text-yellow-800">
                    পাসওয়ার্ড পরিবর্তন করলে ব্যবহারকারীকে নতুন পাসওয়ার্ড জানিয়ে দিন।
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
