'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Calendar, MessageCircle, Plus, Video } from 'lucide-react';
import { formatBanglaNumber } from '@/lib/utils/banglaNumbers';

export function MentorDashboard() {
  // Mock data - replace with real data from API
  const stats = {
    activeCourses: 4,
    totalStudents: 127,
    todayClasses: 3,
    pendingMessages: 8
  };

  const myCourses = [
    { id: 1, title: 'Full Stack Web Development', students: 45, nextClass: `আজ সকাল ${formatBanglaNumber(10)}:০০`, status: 'active' },
    { id: 2, title: 'React.js Advanced', students: 32, nextClass: `আজ বিকাল ${formatBanglaNumber(3)}:০০`, status: 'active' },
    { id: 3, title: 'Node.js Backend', students: 28, nextClass: `কাল সকাল ${formatBanglaNumber(11)}:০০`, status: 'active' }
  ];

  const recentMessages = [
    { id: 1, student: 'রাহুল আহমেদ', course: 'Full Stack Web Development', message: 'স্যার, React Hook সম্পর্কে আরও বিস্তারিত জানতে চাই...', time: `${formatBanglaNumber(2)} ঘণ্টা আগে` },
    { id: 2, student: 'সুমাইয়া খান', course: 'React.js Advanced', message: 'আমার প্রজেক্ট সাবমিট করতে সমস্যা হচ্ছে...', time: `${formatBanglaNumber(4)} ঘণ্টা আগে` },
    { id: 3, student: 'আরিফ হোসেন', course: 'Node.js Backend', message: 'Database connection এর জন্য সাহায্য চাই...', time: `${formatBanglaNumber(1)} দিন আগে` }
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          আপনার কোর্স এবং শিক্ষার্থী
        </h2>
        <p className="text-gray-600">
          আপনার কোর্সগুলি পরিচালনা করুন এবং শিক্ষার্থীদের সাথে যোগাযোগ রাখুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয় কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.activeCourses)}</div>
            <p className="text-xs text-gray-600">
              +{formatBanglaNumber(1)} নতুন এই মাসে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.totalStudents)}</div>
            <p className="text-xs text-gray-600">
              +{formatBanglaNumber(12)} নতুন এই সপ্তাহে
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের ক্লাস</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.todayClasses)}</div>
            <p className="text-xs text-gray-600">
              পরবর্তী: {formatBanglaNumber(10)}:০০ AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমান বার্তা</CardTitle>
            <MessageCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.pendingMessages)}</div>
            <p className="text-xs text-gray-600">
              শিক্ষার্থীদের প্রশ্ন
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* My Courses */}
        <Card>
          <CardHeader>
            <CardTitle>আপনার কোর্স</CardTitle>
            <CardDescription>
              আপনার কোর্সগুলি পরিচালনা করুন এবং নতুন কন্টেন্ট যোগ করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                <Plus className="w-4 h-4 mr-2" />
                নতুন কোর্স তৈরি করুন
              </Button>
              {myCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-600">{formatBanglaNumber(course.students)} জন শিক্ষার্থী</p>
                    <p className="text-sm text-gray-600">পরবর্তী ক্লাস: {course.nextClass}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    পরিচালনা
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক শিক্ষার্থী বার্তা</CardTitle>
            <CardDescription>
              শিক্ষার্থীদের প্রশ্ন এবং মন্তব্য
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">
                      {message.student.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{message.student}</h4>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{message.course}</p>
                    <p className="text-sm text-gray-600">{message.message}</p>
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
            আপনার দৈনন্দিন শিক্ষাদান কাজগুলি
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              <Video className="w-4 h-4 mr-2" />
              লাইভ ক্লাস শুরু
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              বার্তা উত্তর
            </Button>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              অ্যাসাইনমেন্ট চেক
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              শিডিউল ম্যানেজ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}