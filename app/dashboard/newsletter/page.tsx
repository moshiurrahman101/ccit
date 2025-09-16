'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaDate } from '@/lib/utils/banglaNumbers';

interface Newsletter {
  _id: string;
  title: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  createdAt: string;
  updatedAt: string;
}

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: string;
  lastOpened?: string;
}

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('newsletters');

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        setNewsletters([
          {
            _id: '1',
            title: 'সাপ্তাহিক টেক আপডেট',
            subject: 'এই সপ্তাহের গুরুত্বপূর্ণ টেকনোলজি আপডেট',
            content: 'Newsletter content here...',
            status: 'sent',
            sentAt: '2024-01-15T10:00:00Z',
            recipients: 5000,
            opened: 3200,
            clicked: 450,
            unsubscribed: 12,
            createdAt: '2024-01-10',
            updatedAt: '2024-01-15'
          },
          {
            _id: '2',
            title: 'নতুন কোর্স ঘোষণা',
            subject: 'আমাদের নতুন Python কোর্সে অংশ নিন',
            content: 'Newsletter content here...',
            status: 'scheduled',
            scheduledAt: '2024-01-25T09:00:00Z',
            recipients: 0,
            opened: 0,
            clicked: 0,
            unsubscribed: 0,
            createdAt: '2024-01-20',
            updatedAt: '2024-01-20'
          },
          {
            _id: '3',
            title: 'মাসিক রিপোর্ট',
            subject: 'জানুয়ারি মাসের অর্জনসমূহ',
            content: 'Newsletter content here...',
            status: 'draft',
            recipients: 0,
            opened: 0,
            clicked: 0,
            unsubscribed: 0,
            createdAt: '2024-01-18',
            updatedAt: '2024-01-22'
          }
        ]);

        setSubscribers([
          {
            _id: '1',
            email: 'ahmed@example.com',
            name: 'আহমেদ রহমান',
            status: 'active',
            subscribedAt: '2024-01-01',
            lastOpened: '2024-01-15'
          },
          {
            _id: '2',
            email: 'fatema@example.com',
            name: 'ফাতেমা খাতুন',
            status: 'active',
            subscribedAt: '2024-01-05',
            lastOpened: '2024-01-14'
          },
          {
            _id: '3',
            email: 'karim@example.com',
            status: 'unsubscribed',
            subscribedAt: '2023-12-15',
            lastOpened: '2024-01-10'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const stats = {
    totalNewsletters: newsletters.length,
    sent: newsletters.filter(n => n.status === 'sent').length,
    scheduled: newsletters.filter(n => n.status === 'scheduled').length,
    draft: newsletters.filter(n => n.status === 'draft').length,
    totalSubscribers: subscribers.length,
    activeSubscribers: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    totalRecipients: newsletters.reduce((sum, n) => sum + n.recipients, 0),
    totalOpened: newsletters.reduce((sum, n) => sum + n.opened, 0),
    totalClicked: newsletters.reduce((sum, n) => sum + n.clicked, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'পাঠানো হয়েছে';
      case 'scheduled': return 'সময় নির্ধারিত';
      case 'draft': return 'খসড়া';
      case 'failed': return 'ব্যর্থ';
      default: return status;
    }
  };

  const getSubscriberStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unsubscribed': return 'bg-red-100 text-red-800';
      case 'bounced': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriberStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'সক্রিয়';
      case 'unsubscribed': return 'সাবস্ক্রিপশন বাতিল';
      case 'bounced': return 'বাউন্স';
      default: return status;
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
          নিউজলেটার ব্যবস্থাপনা
        </h1>
        <p className="text-gray-600">
          নিউজলেটার তৈরি করুন এবং সাবস্ক্রাইবার পরিচালনা করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট নিউজলেটার</CardTitle>
            <Mail className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.totalNewsletters)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">সাবস্ক্রাইবার</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.activeSubscribers)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট পাঠানো</CardTitle>
            <Send className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.totalRecipients)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">ওপেন রেট</CardTitle>
            <BarChart3 className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {stats.totalRecipients > 0 
                ? `${Math.round((stats.totalOpened / stats.totalRecipients) * 100)}%`
                : '0%'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-white/20">
        <button
          onClick={() => setActiveTab('newsletters')}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === 'newsletters'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          নিউজলেটার
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === 'subscribers'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          সাবস্ক্রাইবার
        </button>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={activeTab === 'newsletters' ? 'নিউজলেটার খুঁজুন...' : 'সাবস্ক্রাইবার খুঁজুন...'}
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
            {activeTab === 'newsletters' ? (
              <>
                <SelectItem value="sent">পাঠানো হয়েছে</SelectItem>
                <SelectItem value="scheduled">সময় নির্ধারিত</SelectItem>
                <SelectItem value="draft">খসড়া</SelectItem>
                <SelectItem value="failed">ব্যর্থ</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="active">সক্রিয়</SelectItem>
                <SelectItem value="unsubscribed">সাবস্ক্রিপশন বাতিল</SelectItem>
                <SelectItem value="bounced">বাউন্স</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'newsletters' ? 'নতুন নিউজলেটার' : 'সাবস্ক্রাইবার যোগ করুন'}
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'newsletters' ? (
        <div className="space-y-4">
          {newsletters.map((newsletter) => (
            <Card key={newsletter._id} className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(newsletter.status)}>
                        {getStatusLabel(newsletter.status)}
                      </Badge>
                      {newsletter.status === 'scheduled' && newsletter.scheduledAt && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatBanglaDate(new Date(newsletter.scheduledAt))}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {newsletter.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3">
                      {newsletter.subject}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{formatBanglaNumber(newsletter.recipients)} প্রাপক</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>{formatBanglaNumber(newsletter.opened)} খোলা</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <span>{formatBanglaNumber(newsletter.clicked)} ক্লিক</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <XCircle className="h-4 w-4 mr-2" />
                        <span>{formatBanglaNumber(newsletter.unsubscribed)} আনসাবস্ক্রাইব</span>
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
                    {newsletter.status === 'draft' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Send className="w-4 h-4 mr-1" />
                        পাঠান
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {subscribers.map((subscriber) => (
            <Card key={subscriber._id} className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-800">{subscriber.email}</h3>
                      <Badge className={getSubscriberStatusColor(subscriber.status)}>
                        {getSubscriberStatusLabel(subscriber.status)}
                      </Badge>
                    </div>
                    {subscriber.name && (
                      <p className="text-sm text-gray-600 mb-1">{subscriber.name}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>সাবস্ক্রাইব: {formatBanglaDate(new Date(subscriber.subscribedAt))}</span>
                      {subscriber.lastOpened && (
                        <span>শেষ খোলা: {formatBanglaDate(new Date(subscriber.lastOpened))}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="bg-white/20 border-white/30">
                      <Eye className="w-4 h-4" />
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
      )}
    </div>
  );
}
