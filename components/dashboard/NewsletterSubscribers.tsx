'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Search, 
  Download, 
  RefreshCw, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NewsletterSubscriber {
  _id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  isActive: boolean;
  source: string;
}

interface NewsletterData {
  subscribers: NewsletterSubscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function NewsletterSubscribers() {
  const [data, setData] = useState<NewsletterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('active');

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/newsletter/subscribe?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, searchTerm, statusFilter, fetchSubscribers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubscribers();
  };

  const exportToCSV = () => {
    if (!data?.subscribers) return;

    const csvContent = [
      ['Email', 'Name', 'Subscribed At', 'Status', 'Source'].join(','),
      ...data.subscribers.map(sub => [
        sub.email,
        sub.name || '',
        new Date(sub.subscribedAt).toLocaleDateString('bn-BD'),
        sub.isActive ? 'Active' : 'Inactive',
        sub.source
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">নিউজলেটার সাবস্ক্রাইবার</h2>
          <p className="text-gray-600">আপনার নিউজলেটার সাবস্ক্রাইবারদের তালিকা দেখুন</p>
        </div>
        <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          CSV ডাউনলোড
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data?.pagination.total || 0}</p>
                <p className="text-gray-600">মোট সাবস্ক্রাইবার</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.subscribers.filter(s => s.isActive).length || 0}
                </p>
                <p className="text-gray-600">সক্রিয় সাবস্ক্রাইবার</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.subscribers.filter(s => {
                    const date = new Date(s.subscribedAt);
                    const today = new Date();
                    const thisMonth = today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear();
                    return thisMonth;
                  }).length || 0}
                </p>
                <p className="text-gray-600">এই মাসে নতুন</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ইমেইল বা নাম দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button type="submit" variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
                <option value="all">সব</option>
              </select>
              <Button onClick={fetchSubscribers} variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>সাবস্ক্রাইবার তালিকা</CardTitle>
          <CardDescription>
            পৃষ্ঠা {data?.pagination.page} এর {data?.pagination.pages} ({data?.pagination.total} টি সাবস্ক্রাইবার)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">লোড হচ্ছে...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">ইমেইল</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">নাম</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">সাবস্ক্রাইব তারিখ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">স্ট্যাটাস</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">সোর্স</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{subscriber.email}</td>
                      <td className="py-3 px-4 text-gray-600">{subscriber.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(subscriber.subscribedAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={subscriber.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {subscriber.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{subscriber.source}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    আগের
                  </Button>

                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(data.pagination.pages, prev + 1))}
                    disabled={currentPage === data.pagination.pages}
                  >
                    পরের
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
