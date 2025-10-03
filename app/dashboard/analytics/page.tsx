'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  BookOpen, 
  DollarSign,
  Calendar,
  Download,
  Eye,
  MousePointer,
  Clock,
  Star,
  MessageCircle,
  Mail,
  Settings,
  Globe,
  Code,
  Search
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaCurrency, formatBanglaDate } from '@/lib/utils/banglaNumbers';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { GTMManager } from '@/components/analytics/GTMManager';
import { PageSEOManager } from '@/components/analytics/PageSEOManager';
import { HeadTagManager } from '@/components/seo/HeadTagManager';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    monthlyRevenue: number;
    studentGrowth: number;
    revenueGrowth: number;
    courseCompletionRate: number;
    averageRating: number;
  };
  monthlyData: {
    month: string;
    students: number;
    revenue: number;
    courses: number;
  }[];
  topCourses: {
    name: string;
    students: number;
    revenue: number;
    rating: number;
  }[];
  recentActivity: {
    type: string;
    description: string;
    time: string;
    value?: number;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchAnalytics = async () => {
      setTimeout(() => {
        setData({
          overview: {
            totalStudents: 1247,
            totalCourses: 45,
            totalRevenue: 2500000,
            monthlyRevenue: 450000,
            studentGrowth: 12.5,
            revenueGrowth: 18.3,
            courseCompletionRate: 78.5,
            averageRating: 4.7
          },
          monthlyData: [
            { month: 'জুলাই', students: 120, revenue: 180000, courses: 3 },
            { month: 'আগস্ট', students: 135, revenue: 210000, courses: 4 },
            { month: 'সেপ্টেম্বর', students: 150, revenue: 240000, courses: 5 },
            { month: 'অক্টোবর', students: 165, revenue: 280000, courses: 6 },
            { month: 'নভেম্বর', students: 180, revenue: 320000, courses: 7 },
            { month: 'ডিসেম্বর', students: 200, revenue: 380000, courses: 8 }
          ],
          topCourses: [
            { name: 'Full Stack Web Development', students: 245, revenue: 3675000, rating: 4.8 },
            { name: 'Python Data Science', students: 198, revenue: 2376000, rating: 4.6 },
            { name: 'React.js Advanced', students: 156, revenue: 1560000, rating: 4.7 },
            { name: 'UI/UX Design', students: 134, revenue: 1072000, rating: 4.5 },
            { name: 'Node.js Backend', students: 112, revenue: 1344000, rating: 4.4 }
          ],
          recentActivity: [
            { type: 'enrollment', description: 'নতুন শিক্ষার্থী এনরোল', time: '২ ঘণ্টা আগে', value: 5 },
            { type: 'payment', description: 'পেমেন্ট রিসিভ', time: '৪ ঘণ্টা আগে', value: 15000 },
            { type: 'course', description: 'নতুন কোর্স প্রকাশ', time: '১ দিন আগে', value: 1 },
            { type: 'completion', description: 'কোর্স সম্পন্ন', time: '২ দিন আগে', value: 3 },
            { type: 'review', description: 'নতুন রিভিউ', time: '৩ দিন আগে', value: 4.8 }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchAnalytics();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <Users className="h-4 w-4 text-blue-500" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'course': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'completion': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'review': return <MessageCircle className="h-4 w-4 text-orange-500" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Analytics & SEO Management
          </h1>
          <p className="text-gray-600">
            Manage analytics, SEO settings, and track performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-white/20 border-white/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="gtm" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>GTM & Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Page SEO</span>
          </TabsTrigger>
          <TabsTrigger value="head" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>Head Tags</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট শিক্ষার্থী</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(data.overview.totalStudents)}
            </div>
            <div className="flex items-center text-xs mt-1">
              {data.overview.studentGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={data.overview.studentGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                {data.overview.studentGrowth > 0 ? '+' : ''}{data.overview.studentGrowth}%
              </span>
              <span className="text-gray-500 ml-1">গত মাসে</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মাসিক আয়</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              <CurrencyDisplay amount={data.overview.monthlyRevenue} size={24} />
            </div>
            <div className="flex items-center text-xs mt-1">
              {data.overview.revenueGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={data.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                {data.overview.revenueGrowth > 0 ? '+' : ''}{data.overview.revenueGrowth}%
              </span>
              <span className="text-gray-500 ml-1">গত মাসে</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">কোর্স সম্পূর্ণতা</CardTitle>
            <BookOpen className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {data.overview.courseCompletionRate}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                style={{ width: `${data.overview.courseCompletionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">গড় রেটিং</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {data.overview.averageRating}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span>৫ এর মধ্যে</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Growth Chart */}
        <Card className="bg-white/20 backdrop-blur-sm border-white/30">
          <CardHeader>
            <CardTitle>মাসিক বৃদ্ধি</CardTitle>
            <CardDescription>
              শিক্ষার্থী এবং আয়ের মাসিক বৃদ্ধি
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                  <div>
                    <p className="font-medium text-gray-800">{month.month}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{formatBanglaNumber(month.students)} শিক্ষার্থী</span>
                      <span>{formatBanglaNumber(month.courses)} কোর্স</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      <CurrencyDisplay amount={month.revenue} size={16} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="bg-white/20 backdrop-blur-sm border-white/30">
          <CardHeader>
            <CardTitle>শীর্ষ কোর্স</CardTitle>
            <CardDescription>
              সবচেয়ে জনপ্রিয় কোর্সসমূহ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{course.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{formatBanglaNumber(course.students)} শিক্ষার্থী</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      <CurrencyDisplay amount={course.revenue} size={16} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
          <CardDescription>
            প্ল্যাটফর্মের সাম্প্রতিক কার্যক্রম
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                {activity.value && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {typeof activity.value === 'number' && activity.value < 10 
                        ? activity.value 
                        : formatBanglaNumber(activity.value)
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* GTM & Analytics Tab */}
        <TabsContent value="gtm">
          <GTMManager />
        </TabsContent>

        {/* Page SEO Tab */}
        <TabsContent value="seo">
          <PageSEOManager />
        </TabsContent>

        {/* Head Tags Management Tab */}
        <TabsContent value="head">
          <HeadTagManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
