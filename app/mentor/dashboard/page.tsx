'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Calendar, MessageCircle, LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has mentor role
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'mentor') {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">মেন্টর ড্যাশবোর্ড</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">স্বাগতম, {user?.name}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                লগআউট
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-gray-600">
                +1 নতুন এই মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-gray-600">
                +12 নতুন এই সপ্তাহে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আজকের ক্লাস</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-600">
                পরবর্তী: ১০:০০ AM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অপেক্ষমান বার্তা</CardTitle>
              <MessageCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-600">
                শিক্ষার্থীদের প্রশ্ন
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Full Stack Web Development</h3>
                      <p className="text-sm text-gray-600">১২৭ জন শিক্ষার্থী</p>
                    </div>
                    <Button size="sm" variant="outline">
                      পরিচালনা
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">React.js Advanced</h3>
                      <p className="text-sm text-gray-600">৮৯ জন শিক্ষার্থী</p>
                    </div>
                    <Button size="sm" variant="outline">
                      পরিচালনা
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>আজকের সময়সূচী</CardTitle>
              <CardDescription>
                আপনার আজকের ক্লাস এবং মিটিং
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg bg-orange-50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">React.js ক্লাস</p>
                    <p className="text-xs text-gray-600">সকাল ১০:০০ - ১১:৩০</p>
                  </div>
                  <Button size="sm" variant="outline">
                    জয়েন
                  </Button>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Full Stack Project Review</p>
                    <p className="text-xs text-gray-600">বিকাল ৩:০০ - ৪:০০</p>
                  </div>
                  <Button size="sm" variant="outline">
                    জয়েন
                  </Button>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Student Q&A Session</p>
                    <p className="text-xs text-gray-600">সন্ধ্যা ৭:০০ - ৮:০০</p>
                  </div>
                  <Button size="sm" variant="outline">
                    জয়েন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-600">র</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">রাহুল আহমেদ</h4>
                    <span className="text-xs text-gray-500">২ ঘণ্টা আগে</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    স্যার, React Hook সম্পর্কে আরও বিস্তারিত জানতে চাই। useState এবং useEffect এর পার্থক্য কী?
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-600">স</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">সুমাইয়া খান</h4>
                    <span className="text-xs text-gray-500">৪ ঘণ্টা আগে</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    আমার প্রজেক্ট সাবমিট করতে সমস্যা হচ্ছে। কখন আপনার সাথে দেখা করতে পারি?
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
