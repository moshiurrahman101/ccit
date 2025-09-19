'use client';

import { useState, useEffect } from 'react';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Clock,
  DollarSign,
  Star,
  Calendar,
  Video,
  FileText,
  Globe,
  Home
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaCurrency, formatBanglaDate } from '@/lib/utils/banglaNumbers';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: number; // in hours
  students: number;
  rating: number;
  status: 'active' | 'draft' | 'archived';
  type: 'online' | 'offline' | 'hybrid';
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchCourses = async () => {
      setTimeout(() => {
        setCourses([
          {
            _id: '1',
            title: 'Full Stack Web Development',
            description: 'Complete web development course with React, Node.js, and MongoDB',
            instructor: 'সুমাইয়া খান',
            price: 15000,
            duration: 120,
            students: 45,
            rating: 4.8,
            status: 'active',
            type: 'online',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
            tags: ['React', 'Node.js', 'MongoDB', 'JavaScript']
          },
          {
            _id: '2',
            title: 'Python Data Science',
            description: 'Learn data science with Python, Pandas, and Machine Learning',
            instructor: 'রাহুল আহমেদ',
            price: 12000,
            duration: 100,
            students: 32,
            rating: 4.6,
            status: 'active',
            type: 'offline',
            createdAt: '2024-01-05',
            updatedAt: '2024-01-18',
            tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas']
          },
          {
            _id: '3',
            title: 'UI/UX Design Fundamentals',
            description: 'Learn modern UI/UX design principles and tools',
            instructor: 'আরিফ হোসেন',
            price: 8000,
            duration: 60,
            students: 28,
            rating: 4.7,
            status: 'draft',
            type: 'hybrid',
            createdAt: '2024-01-10',
            updatedAt: '2024-01-20',
            tags: ['Design', 'Figma', 'Adobe XD', 'Prototyping']
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchCourses();
  }, []);

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    draft: courses.filter(c => c.status === 'draft').length,
    archived: courses.filter(c => c.status === 'archived').length,
    totalStudents: courses.reduce((sum, c) => sum + c.students, 0),
    totalRevenue: courses.reduce((sum, c) => sum + (c.price * c.students), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return getStatusText('active');
      case 'draft': return 'খসড়া';
      case 'archived': return 'আর্কাইভ';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'online': return 'অনলাইন';
      case 'offline': return 'অফলাইন';
      case 'hybrid': return 'হাইব্রিড';
      default: return type;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          কোর্স ব্যবস্থাপনা
        </h1>
        <p className="text-gray-600">
          সব কোর্স দেখুন এবং পরিচালনা করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট কোর্স</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.total)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{getStatusText('active')} কোর্স</CardTitle>
            <BookOpen className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.active)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট শিক্ষার্থী</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.totalStudents)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট আয়</CardTitle>
            <DollarSign className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              <CurrencyDisplay amount={stats.totalRevenue} size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="কোর্স খুঁজুন..."
            className="pl-10 bg-white/20 border-white/30 text-gray-800 placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white/20 border-white/30">
            <SelectValue placeholder="অবস্থা" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">সব অবস্থা</SelectItem>
            <SelectItem value="active">{getStatusText('active')}</SelectItem>
            <SelectItem value="draft">খসড়া</SelectItem>
            <SelectItem value="archived">আর্কাইভ</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-white/20 border-white/30">
            <SelectValue placeholder="ধরন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">সব ধরন</SelectItem>
            <SelectItem value="online">অনলাইন</SelectItem>
            <SelectItem value="offline">অফলাইন</SelectItem>
            <SelectItem value="hybrid">হাইব্রিড</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          <Plus className="w-4 h-4 mr-2" />
          নতুন কোর্স
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course._id} className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 mb-3">
                    {course.description}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(course.status)}>
                    {getStatusLabel(course.status)}
                  </Badge>
                  <Badge className={getTypeColor(course.type)}>
                    {getTypeLabel(course.type)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {formatBanglaNumber(course.students)} শিক্ষার্থী
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatBanglaNumber(course.duration)} ঘণ্টা
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <CurrencyDisplay amount={course.price} size={14} />
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {course.rating}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ইনস্ট্রাক্টর: {course.instructor}</span>
                <span>{formatBanglaDate(new Date(course.updatedAt))}</span>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-white/20 border-white/30">
                  <Eye className="w-4 h-4 mr-1" />
                  দেখুন
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-white/20 border-white/30">
                  <Edit className="w-4 h-4 mr-1" />
                  সম্পাদনা
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
