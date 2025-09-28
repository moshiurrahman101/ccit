'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Bell, CheckCircle, Plus, Send } from 'lucide-react';

export function SupportDashboard() {
  // Mock data - replace with real data from API
  const stats = {
    pendingTickets: 12,
    resolvedTickets: 48,
    avgResponseTime: 2.5,
    satisfactionRate: 94
  };

  const supportTickets = [
    { 
      id: 1, 
      user: 'রাহুল আহমেদ', 
      subject: 'কোর্স অ্যাক্সেস সমস্যা', 
      priority: 'urgent', 
      status: 'open',
      time: '২ ঘণ্টা আগে'
    },
    { 
      id: 2, 
      user: 'সুমাইয়া খান', 
      subject: 'পেমেন্ট ইস্যু', 
      priority: 'medium', 
      status: 'open',
      time: '৪ ঘণ্টা আগে'
    },
    { 
      id: 3, 
      user: 'আরিফ হোসেন', 
      subject: 'টেকনিক্যাল সাপোর্ট', 
      priority: 'low', 
      status: 'resolved',
      time: '১ দিন আগে'
    }
  ];

  const announcements = [
    { id: 1, title: 'নতুন কোর্স লঞ্চ', content: 'React.js Advanced কোর্সটি এখন উপলব্ধ...', date: '২ ঘণ্টা আগে', status: 'published' },
    { id: 2, title: 'সিস্টেম মেইনটেনেন্স', content: 'আগামীকাল রাত ১২টা থেকে ২টা পর্যন্ত...', date: '১ দিন আগে', status: 'published' },
    { id: 3, title: 'সামার অফার', content: 'সব কোর্সে ৩০% ছাড়...', date: '৩ দিন আগে', status: 'draft' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Welcome Section */}
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
            <div className="text-2xl font-bold">{stats.pendingTickets}</div>
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
            <div className="text-2xl font-bold">{stats.resolvedTickets}</div>
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
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
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
            <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
            <p className="text-xs text-gray-600">
              +2% উন্নতি
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>সাপোর্ট টিকেট</CardTitle>
            <CardDescription>
              শিক্ষার্থী এবং ব্যবহারকারীদের প্রশ্নের উত্তর দিন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{ticket.user}</p>
                    <p className="text-sm text-gray-600">{ticket.time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <Button size="sm" className="mt-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                      উত্তর
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>অ্যানাউন্সমেন্ট</CardTitle>
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
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{announcement.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                      {announcement.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500">প্রকাশিত: {announcement.date}</p>
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
            সাপোর্ট কার্যক্রমের জন্য দ্রুত কাজগুলি
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              টিকেট উত্তর
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              ঘোষণা পাঠান
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              FAQ আপডেট
            </Button>
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              সাপোর্ট স্ট্যাট
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}