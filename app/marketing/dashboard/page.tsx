'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Eye, Edit, LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function MarketingDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has marketing role
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'marketing') {
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
              <h1 className="text-xl font-semibold text-gray-900">মার্কেটিং ড্যাশবোর্ড</h1>
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
            মার্কেটিং এবং কন্টেন্ট ম্যানেজমেন্ট
          </h2>
          <p className="text-gray-600">
            ব্লগ পোস্ট, SEO ট্যাগ এবং ল্যান্ডিং পেজ পরিচালনা করুন
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ভিজিটর</CardTitle>
              <Eye className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,543</div>
              <p className="text-xs text-gray-600">
                +12% এই মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">নতুন রেজিস্ট্রেশন</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-gray-600">
                +23% এই সপ্তাহে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ব্লগ পোস্ট</CardTitle>
              <Edit className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-gray-600">
                ৩টি ড্রাফ্ট
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">কনভার্সন রেট</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-gray-600">
                +0.5% উন্নতি
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>ব্লগ ম্যানেজমেন্ট</CardTitle>
              <CardDescription>
                নতুন ব্লগ পোস্ট তৈরি করুন এবং বিদ্যমান পোস্টগুলি সম্পাদনা করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন ব্লগ পোস্ট
                </Button>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">ফ্রিল্যান্সিং শুরু করার গাইড</h3>
                      <p className="text-sm text-gray-600">প্রকাশিত: ১৫ জানুয়ারি</p>
                    </div>
                    <Button size="sm" variant="outline">
                      সম্পাদনা
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">React.js শেখার সেরা উপায়</h3>
                      <p className="text-sm text-gray-600">প্রকাশিত: ১২ জানুয়ারি</p>
                    </div>
                    <Button size="sm" variant="outline">
                      সম্পাদনা
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO এবং মেটা ট্যাগ</CardTitle>
              <CardDescription>
                ওয়েবসাইটের SEO অপটিমাইজেশন এবং মেটা ট্যাগ ম্যানেজ করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <Edit className="w-4 h-4 mr-2" />
                  SEO সেটিংস
                </Button>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">হোমপেজ মেটা</h3>
                    <p className="text-sm text-gray-600">Title: Creative Canvas IT - Best IT Training</p>
                    <p className="text-sm text-gray-600">Description: Bangladesh&apos;s leading IT training platform...</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">কোর্স পেজ মেটা</h3>
                    <p className="text-sm text-gray-600">Title: IT Courses - Learn Programming & Design</p>
                    <p className="text-sm text-gray-600">Description: Professional IT courses for career growth...</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>ওয়েবসাইট অ্যানালিটিক্স</CardTitle>
            <CardDescription>
              ট্র্যাফিক এবং ব্যবহারকারী আচরণ বিশ্লেষণ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl font-bold text-orange-500 mb-2">1,245</div>
                <p className="text-sm text-gray-600">মাসিক নতুন ভিজিটর</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl font-bold text-orange-500 mb-2">4.2</div>
                <p className="text-sm text-gray-600">গড় সেশন সময় (মিনিট)</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl font-bold text-orange-500 mb-2">67%</div>
                <p className="text-sm text-gray-600">মোবাইল ট্র্যাফিক</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
