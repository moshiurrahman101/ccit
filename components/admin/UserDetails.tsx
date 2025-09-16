'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Edit, 
  Key,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatBanglaDate } from '@/lib/utils/banglaNumbers';

interface UserDetailsProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'mentor' | 'marketing' | 'support';
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onEdit: () => void;
  onClose: () => void;
}

export function UserDetails({ user, onEdit, onClose }: UserDetailsProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      case 'support': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'অ্যাডমিন';
      case 'mentor': return 'মেন্টর';
      case 'marketing': return 'মার্কেটিং';
      case 'support': return 'সাপোর্ট';
      default: return role;
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না');
      return;
    }

    if (newPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/users/${user._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      setError('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium text-orange-600">
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Badge className={getRoleColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">ইমেইল</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">ফোন</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">ভূমিকা</p>
                <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">অবস্থা</p>
                <p className="text-sm text-gray-600">
                  {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">যোগদান</p>
                <p className="text-sm text-gray-600">
                  {formatBanglaDate(new Date(user.createdAt))}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">সর্বশেষ আপডেট</p>
                <p className="text-sm text-gray-600">
                  {formatBanglaDate(new Date(user.updatedAt))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>পাসওয়ার্ড পরিবর্তন</span>
          </CardTitle>
          <CardDescription>
            ব্যবহারকারীর পাসওয়ার্ড পরিবর্তন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                বন্ধ
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                পাসওয়ার্ড পরিবর্তন
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          বন্ধ
        </Button>
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          সম্পাদনা
        </Button>
      </div>
    </div>
  );
}
