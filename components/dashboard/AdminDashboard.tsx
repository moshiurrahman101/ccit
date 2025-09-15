'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, DollarSign, CheckCircle, Clock, AlertCircle, Mail } from 'lucide-react';

export function AdminDashboard() {
  // Mock data - replace with real data from API
  const stats = {
    totalStudents: 1250,
    totalCourses: 45,
    totalRevenue: 2500000,
    pendingApprovals: 23,
    monthlyRevenue: 450000,
    activeMentors: 28
  };

  const pendingEnrollments = [
    {
      id: 1,
      studentName: 'আহমেদ রহমান',
      courseName: 'Full Stack Web Development',
      amount: 15000,
      paymentMethod: 'bkash',
      transactionId: 'TRX123456',
      date: '2024-01-14T10:30:00Z'
    },
    {
      id: 2,
      studentName: 'ফাতেমা খাতুন',
      courseName: 'Python Programming',
      amount: 12000,
      paymentMethod: 'nagad',
      transactionId: 'TRX123457',
      date: '2024-01-14T09:15:00Z'
    }
  ];

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
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          এডমিন ড্যাশবোর্ড
        </h1>
        <p className="text-gray-600">
          প্ল্যাটফর্মের সামগ্রিক পরিসংখ্যান এবং ব্যবস্থাপনা
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +১২% গত মাসে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
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
            <CardTitle className="text-sm font-medium">অপেক্ষমান অনুমোদন</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              এনরোলমেন্ট অনুমোদন প্রয়োজন
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
              অপেক্ষমান এনরোলমেন্ট
            </CardTitle>
            <CardDescription>
              অনুমোদনের জন্য অপেক্ষমান এনরোলমেন্টসমূহ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{enrollment.studentName}</h3>
                    <p className="text-sm text-gray-600">{enrollment.courseName}</p>
                  </div>
                  <Badge variant="secondary">
                    {enrollment.paymentMethod.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p>ট্রানজেকশন ID: {enrollment.transactionId}</p>
                  <p>পরিমাণ: ৳{enrollment.amount.toLocaleString()}</p>
                  <p>তারিখ: {new Date(enrollment.date).toLocaleDateString('bn-BD')}</p>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    অনুমোদন
                  </Button>
                  <Button size="sm" variant="outline">
                    বিস্তারিত
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
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
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="w-6 h-6 mb-2" />
              ব্যবহারকারী ব্যবস্থাপনা
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <BookOpen className="w-6 h-6 mb-2" />
              কোর্স ব্যবস্থাপনা
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Mail className="w-6 h-6 mb-2" />
              নিউজলেটার
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <CheckCircle className="w-6 h-6 mb-2" />
              সার্টিফিকেট
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>মাসিক আয়</CardTitle>
            <CardDescription>
              গত ৬ মাসের আয়ের চার্ট
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">চার্ট এখানে দেখানো হবে</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
