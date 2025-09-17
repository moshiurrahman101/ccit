'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Mail, 
  Settings, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mock data - replace with real API calls
  const stats = {
    totalStudents: 1250,
    totalCourses: 45,
    totalRevenue: 2500000,
    pendingApprovals: 23,
    monthlyRevenue: 450000,
    activeMentors: 28,
    newsletterSubscribers: 5000,
    newEnrollments: 45
  };

  const recentActivities = [
    {
      id: 1,
      type: 'enrollment',
      message: 'নতুন এনরোলমেন্ট: আহমেদ রহমান',
      time: '১০ মিনিট আগে'
    },
    {
      id: 2,
      type: 'course',
      message: 'নতুন কোর্স তৈরি হয়েছে: React Native',
      time: '১ ঘন্টা আগে'
    },
    {
      id: 3,
      type: 'certificate',
      message: 'সার্টিফিকেট জারি হয়েছে: JavaScript Fundamentals',
      time: '২ ঘন্টা আগে'
    },
    {
      id: 4,
      type: 'newsletter',
      message: 'নতুন নিউজলেটার সাবস্ক্রাইবার: ৫ জন',
      time: '৩ ঘন্টা আগে'
    }
  ];

  return (
    <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +১২% গত মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট কোর্স</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeMentors} সক্রিয় মেন্টর
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">৳{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +৮% গত মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">নিউজলেটার সাবস্ক্রাইবার</CardTitle>
              <Mail className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.newsletterSubscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +২৩ নতুন আজ
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                সাম্প্রতিক কার্যক্রম
              </CardTitle>
              <CardDescription>
                প্ল্যাটফর্মের সাম্প্রতিক কার্যক্রমসমূহ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>দ্রুত কার্যক্রম</CardTitle>
              <CardDescription>
                সাধারণ ব্যবস্থাপনা কার্যক্রম
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col" asChild>
                <a href="/admin/users">
                  <Users className="w-6 h-6 mb-2" />
                  ব্যবহারকারী ব্যবস্থাপনা
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" asChild>
                <a href="/admin/courses">
                  <BookOpen className="w-6 h-6 mb-2" />
                  কোর্স ব্যবস্থাপনা
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" asChild>
                <a href="/admin/newsletter">
                  <Mail className="w-6 h-6 mb-2" />
                  নিউজলেটার
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" asChild>
                <a href="/admin/settings">
                  <Settings className="w-6 h-6 mb-2" />
                  সেটিংস
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-orange-500" />
                অপেক্ষমান অনুমোদন
              </CardTitle>
              <CardDescription>
                অনুমোদনের জন্য অপেক্ষমান এনরোলমেন্টসমূহ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingApprovals}</div>
                <p className="text-gray-600 mb-4">অপেক্ষমান অনুমোদন</p>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  অনুমোদন দেখুন
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                মাসিক আয়
              </CardTitle>
              <CardDescription>
                গত ৬ মাসের আয়ের চার্ট
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">চার্ট এখানে দেখানো হবে</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
