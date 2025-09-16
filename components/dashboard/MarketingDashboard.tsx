'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Eye, Edit, Plus, Send } from 'lucide-react';

export function MarketingDashboard() {
  // Mock data - replace with real data from API
  const stats = {
    totalVisitors: 12543,
    newRegistrations: 89,
    blogPosts: 15,
    conversionRate: 3.2
  };

  const blogPosts = [
    { id: 1, title: 'ফ্রিল্যান্সিং শুরু করার সম্পূর্ণ গাইড', status: 'published', views: 1245, date: '১৫ জানুয়ারি' },
    { id: 2, title: 'React.js শেখার সেরা উপায়', status: 'published', views: 987, date: '১২ জানুয়ারি' },
    { id: 3, title: 'ডিজিটাল মার্কেটিংয়ে সফলতা', status: 'draft', views: 0, date: '১০ জানুয়ারি' }
  ];

  const campaigns = [
    { id: 1, name: 'নতুন কোর্স লঞ্চ', status: 'active', reach: 5421, engagement: 8.5 },
    { id: 2, name: 'সামার সেল অফার', status: 'completed', reach: 8932, engagement: 12.3 },
    { id: 3, name: 'ব্লগ নিউজলেটার', status: 'scheduled', reach: 0, engagement: 0 }
  ];

  return (
    <div>
      {/* Welcome Section */}
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
            <div className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{stats.newRegistrations}</div>
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
            <div className="text-2xl font-bold">{stats.blogPosts}</div>
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
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-gray-600">
              +0.5% উন্নতি
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Blog Management */}
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
              {blogPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-gray-600">প্রকাশিত: {post.date}</p>
                    <p className="text-sm text-gray-600">{post.views} ভিউ</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                    <Button size="sm" variant="outline" className="mt-2">
                      সম্পাদনা
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>মার্কেটিং ক্যাম্পেইন</CardTitle>
            <CardDescription>
              আপনার সক্রিয় এবং সম্পূর্ণ ক্যাম্পেইনগুলি
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">{campaign.reach.toLocaleString()} রিচ</p>
                    <p className="text-sm text-gray-600">{campaign.engagement}% এনগেজমেন্ট</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
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
            মার্কেটিং কার্যক্রমের জন্য দ্রুত কাজগুলি
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              <Edit className="w-4 h-4 mr-2" />
              ব্লগ পোস্ট লিখুন
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              SEO অপটিমাইজ
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              নিউজলেটার পাঠান
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              অ্যানালিটিক্স দেখুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}