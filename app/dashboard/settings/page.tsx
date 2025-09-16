'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Mail,
  Save,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: 'আহমেদ রহমান',
      email: 'ahmed@example.com',
      phone: '01712345678',
      bio: 'Full Stack Developer with 5+ years of experience',
      avatar: ''
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false,
      loginNotifications: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      courseUpdates: true,
      paymentUpdates: true,
      systemUpdates: false
    },
    preferences: {
      language: 'bn',
      timezone: 'Asia/Dhaka',
      theme: 'light',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BDT'
    }
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings:`, settings[section as keyof typeof settings]);
    // Implement save functionality
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          সেটিংস
        </h1>
        <p className="text-gray-600">
          আপনার অ্যাকাউন্ট এবং পছন্দসমূহ কাস্টমাইজ করুন
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/20 backdrop-blur-sm border-white/30">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white/30">
            <User className="h-4 w-4 mr-2" />
            প্রোফাইল
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white/30">
            <Shield className="h-4 w-4 mr-2" />
            নিরাপত্তা
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white/30">
            <Bell className="h-4 w-4 mr-2" />
            নোটিফিকেশন
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-white/30">
            <Settings className="h-4 w-4 mr-2" />
            পছন্দ
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
              <CardDescription>
                আপনার ব্যক্তিগত তথ্য আপডেট করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">নাম</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value }
                    }))}
                    className="bg-white/20 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                    className="bg-white/20 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">ফোন নম্বর</Label>
                  <Input
                    id="phone"
                    value={settings.profile.phone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                    className="bg-white/20 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">প্রোফাইল ছবি</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="bg-white/20 border-white/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">বায়ো</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                      profile: { ...prev.profile, bio: e.target.value }
                    }))}
                  className="bg-white/20 border-white/30"
                  rows={3}
                />
              </div>
              <Button onClick={() => handleSave('profile')} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                <Save className="w-4 h-4 mr-2" />
                সংরক্ষণ করুন
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
              <CardDescription>
                আপনার পাসওয়ার্ড আপডেট করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={settings.security.currentPassword}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, currentPassword: e.target.value }
                    }))}
                    className="bg-white/20 border-white/30 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={settings.security.newPassword}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, newPassword: e.target.value }
                  }))}
                  className="bg-white/20 border-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={settings.security.confirmPassword}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, confirmPassword: e.target.value }
                  }))}
                  className="bg-white/20 border-white/30"
                />
              </div>
              <Button onClick={() => handleSave('security')} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                <Key className="w-4 h-4 mr-2" />
                পাসওয়ার্ড আপডেট করুন
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>নিরাপত্তা সেটিংস</CardTitle>
              <CardDescription>
                আপনার অ্যাকাউন্টের নিরাপত্তা বাড়ান
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>দুই-ফ্যাক্টর অথেনটিকেশন</Label>
                  <p className="text-sm text-gray-600">
                    আপনার অ্যাকাউন্টের নিরাপত্তা বাড়ান
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorEnabled: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>লগইন নোটিফিকেশন</Label>
                  <p className="text-sm text-gray-600">
                    নতুন ডিভাইস থেকে লগইনের সময় নোটিফিকেশন পান
                  </p>
                </div>
                <Switch
                  checked={settings.security.loginNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, loginNotifications: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>নোটিফিকেশন সেটিংস</CardTitle>
              <CardDescription>
                আপনি কোন নোটিফিকেশন পাবেন তা নির্ধারণ করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>ইমেইল নোটিফিকেশন</Label>
                    <p className="text-sm text-gray-600">
                      ইমেইলের মাধ্যমে নোটিফিকেশন পান
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailNotifications: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>পুশ নোটিফিকেশন</Label>
                    <p className="text-sm text-gray-600">
                      ব্রাউজারে পুশ নোটিফিকেশন পান
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushNotifications: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS নোটিফিকেশন</Label>
                    <p className="text-sm text-gray-600">
                      SMS এর মাধ্যমে নোটিফিকেশন পান
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsNotifications: checked }
                    }))}
                  />
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                <h4 className="font-medium text-gray-800 mb-4">নির্দিষ্ট নোটিফিকেশন</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>কোর্স আপডেট</Label>
                      <p className="text-sm text-gray-600">
                        কোর্স সম্পর্কিত আপডেট পান
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.courseUpdates}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, courseUpdates: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>পেমেন্ট আপডেট</Label>
                      <p className="text-sm text-gray-600">
                        পেমেন্ট সম্পর্কিত আপডেট পান
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.paymentUpdates}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, paymentUpdates: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>সিস্টেম আপডেট</Label>
                      <p className="text-sm text-gray-600">
                        সিস্টেম সম্পর্কিত আপডেট পান
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.systemUpdates}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, systemUpdates: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('notifications')} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                <Bell className="w-4 h-4 mr-2" />
                সংরক্ষণ করুন
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>পছন্দসমূহ</CardTitle>
              <CardDescription>
                আপনার পছন্দ অনুযায়ী সিস্টেম কাস্টমাইজ করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">ভাষা</Label>
                  <Select value={settings.preferences.language} onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, language: value }
                  }))}>
                    <SelectTrigger className="bg-white/20 border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">টাইমজোন</Label>
                  <Select value={settings.preferences.timezone} onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, timezone: value }
                  }))}>
                    <SelectTrigger className="bg-white/20 border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">থিম</Label>
                  <Select value={settings.preferences.theme} onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, theme: value }
                  }))}>
                    <SelectTrigger className="bg-white/20 border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">তারিখের ফরম্যাট</Label>
                  <Select value={settings.preferences.dateFormat} onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, dateFormat: value }
                  }))}>
                    <SelectTrigger className="bg-white/20 border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleSave('preferences')} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                <Settings className="w-4 h-4 mr-2" />
                সংরক্ষণ করুন
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
