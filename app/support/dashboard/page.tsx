'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Bell, CheckCircle, LogOut, Send } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function SupportDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has support role
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'support') {
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
              <h1 className="text-xl font-semibold text-gray-900">সাপোর্ট ড্যাশবোর্ড</h1>
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
            কাস্টমার সাপোর্ট এবং প্রশ্নোত্তর
          </h2>
          <p className="text-gray-600">
            শিক্ষার্থী এবং ব্যবহারকারীদের প্রশ্নের উত্তর দিন এবং সাপোর্ট টিকেট পরিচালনা করুন
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অপেক্ষমান টিকেট</CardTitle>
              <MessageCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-600">
                +3 নতুন আজ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সমাধান হয়েছে</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-gray-600">
                এই সপ্তাহে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">গড় প্রতিক্রিয়া সময়</CardTitle>
              <Bell className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5</div>
              <p className="text-xs text-gray-600">
                ঘণ্টা
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সন্তুষ্টি হার</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-gray-600">
                +2% উন্নতি
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>অপেক্ষমান সাপোর্ট টিকেট</CardTitle>
              <CardDescription>
                শিক্ষার্থী এবং ব্যবহারকারীদের প্রশ্নের উত্তর দিন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">কোর্স অ্যাক্সেস সমস্যা</h3>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">জরুরি</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">রাহুল আহমেদ</p>
                    <p className="text-sm text-gray-600">আমি কোর্সের কন্টেন্ট দেখতে পারছি না...</p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    উত্তর
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">পেমেন্ট ইস্যু</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">মধ্যম</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">সুমাইয়া খান</p>
                    <p className="text-sm text-gray-600">আমার পেমেন্ট সফল হয়েছে কিন্তু কোর্সে অ্যাক্সেস পাচ্ছি না...</p>
                  </div>
                  <Button size="sm" variant="outline">
                    উত্তর
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">টেকনিক্যাল সাপোর্ট</h3>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">নিম্ন</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">আরিফ হোসেন</p>
                    <p className="text-sm text-gray-600">ভিডিও প্লেয়ার কাজ করছে না...</p>
                  </div>
                  <Button size="sm" variant="outline">
                    উত্তর
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক অ্যানাউন্সমেন্ট</CardTitle>
              <CardDescription>
                নতুন ঘোষণা এবং আপডেট পাঠান
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <Send className="w-4 h-4 mr-2" />
                  নতুন অ্যানাউন্সমেন্ট
                </Button>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">নতুন কোর্স লঞ্চ</h3>
                    <p className="text-sm text-gray-600 mb-2">প্রকাশিত: ২ ঘণ্টা আগে</p>
                    <p className="text-sm text-gray-600">React.js Advanced কোর্সটি এখন উপলব্ধ...</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">সিস্টেম মেইনটেনেন্স</h3>
                    <p className="text-sm text-gray-600 mb-2">প্রকাশিত: ১ দিন আগে</p>
                    <p className="text-sm text-gray-600">আগামীকাল রাত ১২টা থেকে ২টা পর্যন্ত...</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Management */}
        <Card>
          <CardHeader>
            <CardTitle>সাধারণ প্রশ্নোত্তর (FAQ)</CardTitle>
            <CardDescription>
              সাধারণ প্রশ্নগুলি এবং তাদের উত্তর ম্যানেজ করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">সর্বাধিক জিজ্ঞাসিত প্রশ্ন</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">কোর্সে কীভাবে নিবন্ধন করব?</h4>
                    <p className="text-xs text-gray-600">কোর্স পেজে গিয়ে &ldquo;এনরোল নাও&rdquo; বাটনে ক্লিক করুন...</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">পেমেন্ট কীভাবে করব?</h4>
                    <p className="text-xs text-gray-600">বিকাশ বা নগাদের মাধ্যমে পেমেন্ট করতে পারবেন...</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">টেকনিক্যাল সাপোর্ট</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">ভিডিও প্লেয়ার কাজ করছে না</h4>
                    <p className="text-xs text-gray-600">ব্রাউজার ক্যাশে ক্লিয়ার করুন এবং আবার চেষ্টা করুন...</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">মোবাইলে অ্যাপ ডাউনলোড</h4>
                    <p className="text-xs text-gray-600">আমাদের মোবাইল অ্যাপ এখনও ডেভেলপমেন্ট পর্যায়ে...</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
