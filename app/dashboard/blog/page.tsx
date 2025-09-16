'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Eye as EyeIcon,
  ThumbsUp,
  MessageCircle,
  Globe,
  Lock,
  Clock
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaDate } from '@/lib/utils/banglaNumbers';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  featuredImage?: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchPosts = async () => {
      setTimeout(() => {
        setPosts([
          {
            _id: '1',
            title: 'React.js এ Advanced Hooks ব্যবহারের গাইড',
            slug: 'react-advanced-hooks-guide',
            excerpt: 'React.js এ useCallback, useMemo, useRef এবং অন্যান্য advanced hooks এর ব্যবহার শিখুন',
            content: 'Full content here...',
            author: 'সুমাইয়া খান',
            category: 'Web Development',
            tags: ['React', 'JavaScript', 'Hooks', 'Frontend'],
            status: 'published',
            views: 1250,
            likes: 45,
            comments: 12,
            publishedAt: '2024-01-15',
            createdAt: '2024-01-10',
            updatedAt: '2024-01-15'
          },
          {
            _id: '2',
            title: 'Python Data Science: Pandas এর সাথে শুরু করুন',
            slug: 'python-data-science-pandas',
            excerpt: 'Python Data Science এর জন্য Pandas লাইব্রেরি ব্যবহার করে ডেটা ম্যানিপুলেশন শিখুন',
            content: 'Full content here...',
            author: 'রাহুল আহমেদ',
            category: 'Data Science',
            tags: ['Python', 'Pandas', 'Data Science', 'Analytics'],
            status: 'published',
            views: 890,
            likes: 32,
            comments: 8,
            publishedAt: '2024-01-12',
            createdAt: '2024-01-08',
            updatedAt: '2024-01-12'
          },
          {
            _id: '3',
            title: 'UI/UX Design Principles: Modern Design Trends',
            slug: 'ui-ux-design-principles',
            excerpt: 'আধুনিক UI/UX ডিজাইনের মূলনীতি এবং ২০২৪ সালের ডিজাইন ট্রেন্ডস',
            content: 'Full content here...',
            author: 'আরিফ হোসেন',
            category: 'Design',
            tags: ['UI/UX', 'Design', 'Figma', 'Adobe XD'],
            status: 'draft',
            views: 0,
            likes: 0,
            comments: 0,
            createdAt: '2024-01-18',
            updatedAt: '2024-01-20'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchPosts();
  }, []);

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    archived: posts.filter(p => p.status === 'archived').length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
    totalComments: posts.reduce((sum, p) => sum + p.comments, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'প্রকাশিত';
      case 'draft': return 'খসড়া';
      case 'archived': return 'আর্কাইভ';
      default: return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Web Development': return 'bg-blue-100 text-blue-800';
      case 'Data Science': return 'bg-purple-100 text-purple-800';
      case 'Design': return 'bg-pink-100 text-pink-800';
      case 'Mobile Development': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          ব্লগ ব্যবস্থাপনা
        </h1>
        <p className="text-gray-600">
          ব্লগ পোস্ট তৈরি করুন এবং পরিচালনা করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট পোস্ট</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.total)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">প্রকাশিত</CardTitle>
            <Globe className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.published)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট ভিউ</CardTitle>
            <EyeIcon className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.totalViews)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট লাইক</CardTitle>
            <ThumbsUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.totalLikes)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="পোস্ট খুঁজুন..."
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
            <SelectItem value="published">প্রকাশিত</SelectItem>
            <SelectItem value="draft">খসড়া</SelectItem>
            <SelectItem value="archived">আর্কাইভ</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 bg-white/20 border-white/30">
            <SelectValue placeholder="ক্যাটাগরি" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">সব ক্যাটাগরি</SelectItem>
            <SelectItem value="Web Development">Web Development</SelectItem>
            <SelectItem value="Data Science">Data Science</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Mobile Development">Mobile Development</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          <Plus className="w-4 h-4 mr-2" />
          নতুন পোস্ট
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id} className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getStatusColor(post.status)}>
                      {getStatusLabel(post.status)}
                    </Badge>
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                    {post.status === 'published' && (
                      <Badge className="bg-green-100 text-green-800">
                        <Globe className="h-3 w-3 mr-1" />
                        লাইভ
                      </Badge>
                    )}
                    {post.status === 'draft' && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Lock className="h-3 w-3 mr-1" />
                        খসড়া
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {post.status === 'published' && post.publishedAt
                        ? formatBanglaDate(new Date(post.publishedAt))
                        : formatBanglaDate(new Date(post.createdAt))
                      }
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {formatBanglaNumber(post.views)}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {formatBanglaNumber(post.likes)}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {formatBanglaNumber(post.comments)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button size="sm" variant="outline" className="bg-white/20 border-white/30">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/20 border-white/30">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/20 border-white/30 text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
