'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Mail, 
  TrendingUp, 
  Activity,
  GraduationCap,
  FileText,
  CreditCard,
  BarChart3,
  MessageSquare,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaCurrency, formatBanglaDate } from '@/lib/utils/banglaNumbers';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeMentors: number;
  newsletterSubscribers: number;
  pendingEnrollments: number;
  todayClasses: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'payment' | 'course' | 'message';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

interface UpcomingClass {
  id: string;
  title: string;
  mentor: string;
  time: string;
  students: number;
  type: 'online' | 'offline';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeMentors: 0,
    newsletterSubscribers: 0,
    pendingEnrollments: 0,
    todayClasses: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchStats = async () => {
      // Simulate API call
      setTimeout(() => {
        setStats({
          totalStudents: 1247,
          totalCourses: 45,
          totalRevenue: 2500000,
          monthlyRevenue: 450000,
          activeMentors: 28,
          newsletterSubscribers: 5000,
          pendingEnrollments: 23,
          todayClasses: 8
        });
        setLoading(false);
      }, 1000);
    };

    fetchStats();
  }, []);

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'enrollment',
      title: 'নতুন এনরোলমেন্ট',
      description: 'আহমেদ রহমান React.js কোর্সে এনরোল করেছেন',
      time: '২ ঘণ্টা আগে',
      status: 'success'
    },
    {
      id: '2',
      type: 'payment',
      title: 'পেমেন্ট রিসিভ',
      description: 'সুমাইয়া খান থেকে ৫,০০০ টাকা পেমেন্ট পেয়েছেন',
      time: '৪ ঘণ্টা আগে',
      status: 'success'
    },
    {
      id: '3',
      type: 'course',
      title: 'নতুন কোর্স',
      description: 'Node.js Advanced কোর্স প্রকাশিত হয়েছে',
      time: '১ দিন আগে',
      status: 'info'
    },
    {
      id: '4',
      type: 'message',
      title: 'নতুন মেসেজ',
      description: 'আরিফ হোসেন একটি প্রশ্ন করেছেন',
      time: '২ দিন আগে',
      status: 'warning'
    }
  ];

  const upcomingClasses: UpcomingClass[] = [
    {
      id: '1',
      title: 'React.js Advanced',
      mentor: 'সুমাইয়া খান',
      time: 'আজ সকাল ১০:০০',
      students: 45,
      type: 'online'
    },
    {
      id: '2',
      title: 'Full Stack Development',
      mentor: 'রাহুল আহমেদ',
      time: 'আজ বিকাল ৩:০০',
      students: 32,
      type: 'offline'
    },
    {
      id: '3',
      title: 'Python Data Science',
      mentor: 'আরিফ হোসেন',
      time: 'কাল সকাল ১১:০০',
      students: 28,
      type: 'online'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <GraduationCap className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/20 backdrop-blur-sm border-white/30">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-white/30 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          স্বাগতম! 👋
        </h1>
        <p className="text-gray-600">
          আপনার ড্যাশবোর্ডে সবকিছু একসাথে দেখুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট শিক্ষার্থী</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.totalStudents)}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +১২% গত মাসে
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">সক্রিয় কোর্স</CardTitle>
            <BookOpen className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.totalCourses)}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +৩ নতুন এই মাসে
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মাসিক আয়</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              <CurrencyDisplay amount={stats.monthlyRevenue} size={24} />
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +১৫% গত মাসে
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">সক্রিয় মেন্টর</CardTitle>
            <GraduationCap className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.activeMentors)}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +২ নতুন
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 bg-white/20 backdrop-blur-sm border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              <span>সাম্প্রতিক কার্যক্রম</span>
            </CardTitle>
            <CardDescription>
              আপনার সিস্টেমের সাম্প্রতিক কার্যক্রম দেখুন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card className="bg-white/20 backdrop-blur-sm border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <span>আসন্ন ক্লাস</span>
            </CardTitle>
            <CardDescription>
              আজ এবং আগামীকালের ক্লাসসমূহ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-800">{classItem.title}</h4>
                  <Badge className={classItem.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                    {classItem.type === 'online' ? 'অনলাইন' : 'অফলাইন'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">মেন্টর: {classItem.mentor}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {classItem.time}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatBanglaNumber(classItem.students)} শিক্ষার্থী
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle>দ্রুত কাজ</CardTitle>
          <CardDescription>
            প্রায়ই ব্যবহৃত ফিচারসমূহ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/20 hover:bg-white/30 border-white/30">
              <Users className="h-6 w-6" />
              <span className="text-sm">নতুন শিক্ষার্থী</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/20 hover:bg-white/30 border-white/30">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">নতুন কোর্স</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/20 hover:bg-white/30 border-white/30">
              <Mail className="h-6 w-6" />
              <span className="text-sm">নিউজলেটার</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/20 hover:bg-white/30 border-white/30">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">রিপোর্ট</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}