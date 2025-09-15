'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Award, Download, Calendar, Video } from 'lucide-react';
import Link from 'next/link';

export function StudentDashboard() {
  // Mock data - replace with real data from API
  const enrolledCourses = [
    {
      id: 1,
      title: 'Full Stack Web Development',
      progress: 75,
      nextClass: '2024-01-15T10:00:00Z',
      assignments: 3,
      completed: 8
    },
    {
      id: 2,
      title: 'Python Programming & Data Science',
      progress: 45,
      nextClass: '2024-01-16T14:00:00Z',
      assignments: 2,
      completed: 5
    }
  ];

  const upcomingClasses = [
    {
      id: 1,
      title: 'React Hooks এবং State Management',
      course: 'Full Stack Web Development',
      date: '2024-01-15T10:00:00Z',
      type: 'live'
    },
    {
      id: 2,
      title: 'Data Visualization with Matplotlib',
      course: 'Python Programming & Data Science',
      date: '2024-01-16T14:00:00Z',
      type: 'live'
    }
  ];

  const certificates = [
    {
      id: 1,
      course: 'JavaScript Fundamentals',
      issueDate: '2024-01-01',
      downloadUrl: '#'
    }
  ];

  const notifications = [
    {
      id: 1,
      title: 'নতুন অ্যাসাইনমেন্ট',
      message: 'React Project Assignment জমা দেওয়ার সময়কাল ৩ দিন',
      type: 'warning',
      time: '২ ঘন্টা আগে'
    },
    {
      id: 2,
      title: 'ক্লাস রিমাইন্ডার',
      message: 'আজ সন্ধ্যা ৭টায় Python কোর্সের ক্লাস',
      type: 'info',
      time: '১ ঘন্টা আগে'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          আমার ড্যাশবোর্ড
        </h1>
        <p className="text-gray-600">
          আপনার কোর্স, ক্লাস এবং অগ্রগতি দেখুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">এনরোল করা কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              +১ গত মাসে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সম্পূর্ণ কোর্স</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">১</div>
            <p className="text-xs text-muted-foreground">
              সার্টিফিকেট পাওয়া গেছে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অ্যাসাইনমেন্ট</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">৫</div>
            <p className="text-xs text-muted-foreground">
              পেন্ডিং অ্যাসাইনমেন্ট
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট স্টাডি টাইম</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">৪৫ ঘন্টা</div>
            <p className="text-xs text-muted-foreground">
              এই মাসে
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>এনরোল করা কোর্সসমূহ</CardTitle>
            <CardDescription>
              আপনার বর্তমান কোর্স এবং অগ্রগতি
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{course.title}</h3>
                  <Badge variant="secondary">
                    {course.progress}% সম্পূর্ণ
                  </Badge>
                </div>
                <Progress value={course.progress} className="mb-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{course.completed} ক্লাস সম্পূর্ণ</span>
                  <span>{course.assignments} অ্যাসাইনমেন্ট বাকি</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href={`/courses/${course.id}`}>
                    কোর্স দেখুন
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle>আসন্ন ক্লাসসমূহ</CardTitle>
            <CardDescription>
              আপনার পরবর্তী ক্লাসের সময়সূচী
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{classItem.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{classItem.course}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(classItem.date).toLocaleDateString('bn-BD')} - 
                      {new Date(classItem.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Badge variant={classItem.type === 'live' ? 'default' : 'secondary'}>
                    {classItem.type === 'live' ? 'লাইভ' : 'রেকর্ডেড'}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href={`/classes/${classItem.id}`}>
                    <Video className="w-4 h-4 mr-1" />
                    ক্লাসে যোগ দিন
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card>
          <CardHeader>
            <CardTitle>সার্টিফিকেটসমূহ</CardTitle>
            <CardDescription>
              আপনার অর্জিত সার্টিফিকেট
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{cert.course}</h3>
                    <p className="text-sm text-gray-600">
                      জারি করা হয়েছে: {new Date(cert.issueDate).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={cert.downloadUrl}>
                      <Download className="w-4 h-4 mr-1" />
                      ডাউনলোড
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>নোটিফিকেশন</CardTitle>
            <CardDescription>
              গুরুত্বপূর্ণ আপডেট এবং রিমাইন্ডার
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
