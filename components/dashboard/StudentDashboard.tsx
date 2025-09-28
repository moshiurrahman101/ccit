'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Award, Download, Calendar, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, BarChart3, CreditCard } from 'lucide-react';
import { formatBanglaNumber, formatBanglaPercentage, formatBanglaDate } from '@/lib/utils/banglaNumbers';

export function StudentDashboard() {
  // Mock data - replace with real data from API
  const enrolledCourses = [
    {
      id: 1,
      title: 'Full Stack Web Development',
      progress: 75,
      nextClass: '2024-01-15T10:00:00Z',
      assignments: 3,
      completed: 8,
      batchName: 'Batch-01 (সকাল)',
      isOnline: false,
      venue: 'ধানমন্ডি, ঢাকা',
      attendanceRate: 85
    },
    {
      id: 2,
      title: 'Python Programming & Data Science',
      progress: 45,
      nextClass: '2024-01-16T14:00:00Z',
      assignments: 2,
      completed: 5,
      batchName: 'Batch-02 (বিকাল)',
      isOnline: true,
      meetingLink: 'Zoom Link',
      attendanceRate: 92
    }
  ];

  const attendanceData = [
    {
      date: '2024-01-15',
      course: 'Full Stack Web Development',
      status: 'present',
      checkInTime: '09:55 AM',
      checkOutTime: '12:05 PM',
      notes: 'সময়মতো উপস্থিত'
    },
    {
      date: '2024-01-13',
      course: 'Full Stack Web Development',
      status: 'late',
      checkInTime: '10:15 AM',
      checkOutTime: '12:00 PM',
      notes: '১৫ মিনিট দেরি'
    },
    {
      date: '2024-01-11',
      course: 'Full Stack Web Development',
      status: 'present',
      checkInTime: '09:50 AM',
      checkOutTime: '12:10 PM',
      notes: 'সময়মতো উপস্থিত'
    },
    {
      date: '2024-01-09',
      course: 'Full Stack Web Development',
      status: 'absent',
      checkInTime: null,
      checkOutTime: null,
      notes: 'অসুস্থতার কারণে অনুপস্থিত'
    }
  ];

  const attendanceStats = {
    totalClasses: 24,
    present: 20,
    absent: 3,
    late: 1,
    excused: 0,
    attendanceRate: 83
  };

  const recentActivity = [
    { id: 1, action: 'Assignment submitted', course: 'Full Stack Web Development', time: '2 hours ago' },
    { id: 2, action: 'Video watched', course: 'Python Programming', time: '1 day ago' },
    { id: 3, action: 'Quiz completed', course: 'Full Stack Web Development', time: '2 days ago' }
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          আপনার কোর্স এবং অগ্রগতি
        </h2>
        <p className="text-gray-600">
          আপনার নিবন্ধিত কোর্সগুলি দেখুন এবং আপনার শিক্ষার অগ্রগতি ট্র্যাক করুন
        </p>
      </div>

      {/* Quick Enrollment Section */}
      <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <BookOpen className="h-5 w-5" />
            নতুন কোর্সে এনরোল করুন
          </CardTitle>
          <CardDescription className="text-orange-700">
            আমাদের নতুন ব্যাচসমূহ দেখুন এবং আপনার পছন্দের কোর্সে যোগ দিন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => window.open('/batches', '_blank')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              ব্যাচ ব্রাউজ করুন
            </Button>
            <Button 
              variant="outline" 
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => window.location.href = '/dashboard/accounts'}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              পেমেন্ট দেখুন
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">নিবন্ধিত কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(3)}</div>
            <p className="text-xs text-gray-600">
              +{formatBanglaNumber(1)} নতুন এই মাসে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পরবর্তী ক্লাস</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(2)}</div>
            <p className="text-xs text-gray-600">
              আগামীকাল সকাল {formatBanglaNumber(10)}টা
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">প্রাপ্ত সার্টিফিকেট</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(2)}</div>
            <p className="text-xs text-gray-600">
              সম্পূর্ণ কোর্স
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">উপস্থিতি হার</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaPercentage(attendanceStats.attendanceRate)}</div>
            <p className="text-xs text-gray-600">
              {formatBanglaNumber(attendanceStats.present)}/{formatBanglaNumber(attendanceStats.totalClasses)} ক্লাস
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>আপনার কোর্স</CardTitle>
            <CardDescription>
              আপনার নিবন্ধিত কোর্সগুলি দেখুন এবং কোর্সের ম্যাটেরিয়াল অ্যাক্সেস করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{course.title}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex-1">
                        <Progress value={course.progress} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">{formatBanglaPercentage(course.progress)} সম্পূর্ণ</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatBanglaNumber(course.assignments)} অ্যাসাইনমেন্ট
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {formatBanglaNumber(course.completed)} সম্পূর্ণ
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {formatBanglaPercentage(course.attendanceRate)} উপস্থিতি
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">ব্যাচ:</span> {course.batchName}
                      {course.isOnline ? (
                        <span className="ml-2 text-blue-600">(অনলাইন)</span>
                      ) : (
                        <span className="ml-2 text-green-600">(অফলাইন - {course.venue})</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    কোর্স দেখুন
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
            <CardDescription>
              আপনার সাম্প্রতিক কোর্স কার্যক্রম এবং অ্যাসাইনমেন্ট
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.course} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>উপস্থিতি রেকর্ড</CardTitle>
          <CardDescription>
            আপনার সাম্প্রতিক ক্লাসের উপস্থিতি এবং সময়
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((attendance, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    attendance.status === 'present' ? 'bg-green-100' :
                    attendance.status === 'late' ? 'bg-yellow-100' :
                    attendance.status === 'absent' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {attendance.status === 'present' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : attendance.status === 'late' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    ) : attendance.status === 'absent' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{attendance.course}</h3>
                    <p className="text-sm text-gray-600">{formatBanglaDate(new Date(attendance.date))}</p>
                    <p className="text-sm text-gray-600">{attendance.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={
                    attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                    attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    attendance.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }>
                    {attendance.status === 'present' ? 'উপস্থিত' :
                     attendance.status === 'late' ? 'দেরিতে' :
                     attendance.status === 'absent' ? 'অনুপস্থিত' : 'ছুটি'}
                  </Badge>
                  {attendance.checkInTime && (
                    <p className="text-sm text-gray-500 mt-1">
                      {attendance.checkInTime} - {attendance.checkOutTime}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>দ্রুত কাজ</CardTitle>
          <CardDescription>
            আপনার দৈনন্দিন কাজগুলি দ্রুত সম্পন্ন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              <BookOpen className="w-4 h-4 mr-2" />
              কোর্স ব্রাউজ করুন
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              সার্টিফিকেট ডাউনলোড
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              ক্লাস শিডিউল
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}