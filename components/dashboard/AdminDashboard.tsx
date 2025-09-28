'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Mail, TrendingUp, Plus, Settings } from 'lucide-react';
import { formatBanglaNumber, formatBanglaPercentage, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';

export function AdminDashboard() {
  // Mock data - replace with real data from API
  const stats = {
    totalUsers: 1247,
    totalCourses: 23,
    newsletterSubscribers: 3421,
    monthlyRevenue: 125000
  };

  const recentUsers = [
    { id: 1, name: 'রাহুল আহমেদ', email: 'rahul@example.com', role: 'student', joinDate: '2024-01-10' },
    { id: 2, name: 'সুমাইয়া খান', email: 'sumaiya@example.com', role: 'mentor', joinDate: '2024-01-09' },
    { id: 3, name: 'আরিফ হোসেন', email: 'arif@example.com', role: 'student', joinDate: '2024-01-08' }
  ];

  const recentCourses = [
    { id: 1, title: 'React.js Advanced', instructor: 'সুমাইয়া খান', students: 45, status: 'active' },
    { id: 2, title: 'Python Data Science', instructor: 'রাহুল আহমেদ', students: 32, status: 'active' },
    { id: 3, title: 'UI/UX Design', instructor: 'আরিফ হোসেন', students: 28, status: 'draft' }
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          অ্যাডমিন ড্যাশবোর্ড
        </h2>
        <p className="text-gray-600">
          সিস্টেম পরিচালনা করুন এবং ব্যবহারকারীদের দেখাশোনা করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.totalUsers)}</div>
            <p className="text-xs text-gray-600">
              +{formatBanglaPercentage(12)} এই মাসে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয় কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.totalCourses)}</div>
            <p className="text-xs text-gray-600">
              +{formatBanglaNumber(3)} নতুন এই মাসে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">নিউজলেটার সাবস্ক্রাইবার</CardTitle>
            <Mail className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.newsletterSubscribers)}</div>
            <p className="text-xs text-gray-600">
              +{formatBanglaPercentage(8)} এই মাসে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মাসিক আয়</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={stats.monthlyRevenue} size={24} />
            </div>
            <p className="text-xs text-gray-600">
              +{formatBanglaPercentage(15)} এই মাসে
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক ব্যবহারকারী</CardTitle>
            <CardDescription>
              নতুন নিবন্ধিত ব্যবহারকারীদের তালিকা
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{user.joinDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক কোর্স</CardTitle>
            <CardDescription>
              নতুন তৈরি এবং আপডেট করা কোর্সগুলি
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-600">মেন্টর: {course.instructor}</p>
                    <p className="text-sm text-gray-600">{formatBanglaNumber(course.students)} জন শিক্ষার্থী</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>দ্রুত কাজ</CardTitle>
          <CardDescription>
            সিস্টেম পরিচালনার জন্য দ্রুত কাজগুলি
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              <Plus className="w-4 h-4 mr-2" />
              নতুন ব্যবহারকারী
            </Button>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              কোর্স তৈরি করুন
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              নিউজলেটার পাঠান
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              সিস্টেম সেটিংস
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}