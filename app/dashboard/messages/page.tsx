'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Trash2, 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  User,
  MessageCircle
} from 'lucide-react';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high';
  adminNotes?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageStats {
  new: number;
  read: number;
  replied: number;
  closed: number;
  total: number;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    new: 0,
    read: 0,
    replied: 0,
    closed: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await fetch(`/api/admin/contact-messages?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages);
        setStats(data.stats);
      } else {
        console.error('Error fetching messages:', data.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessage = async (messageId: string, updates: any) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchMessages();
        if (selectedMessage?._id === messageId) {
          setSelectedMessage({ ...selectedMessage, ...updates });
        }
      } else {
        console.error('Error updating message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('আপনি কি এই বার্তাটি মুছে ফেলতে চান?')) return;

    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMessages();
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        console.error('Error deleting message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />;
      case 'read': return <Eye className="h-4 w-4" />;
      case 'replied': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">যোগাযোগের বার্তা</h1>
          <p className="text-gray-600">ব্যবহারকারীদের বার্তা দেখুন এবং ব্যবস্থাপনা করুন</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট বার্তা</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">নতুন</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পড়া হয়েছে</CardTitle>
              <Eye className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.read}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">উত্তর দেওয়া</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">বন্ধ</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="বার্তা খুঁজুন..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="স্ট্যাটাস" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                      <SelectItem value="new">নতুন</SelectItem>
                      <SelectItem value="read">পড়া হয়েছে</SelectItem>
                      <SelectItem value="replied">উত্তর দেওয়া</SelectItem>
                      <SelectItem value="closed">বন্ধ</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.priority || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="প্রাধান্য" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব প্রাধান্য</SelectItem>
                      <SelectItem value="high">উচ্চ</SelectItem>
                      <SelectItem value="medium">মধ্যম</SelectItem>
                      <SelectItem value="low">নিম্ন</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card 
                    key={message._id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedMessage?._id === message._id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getStatusColor(message.status)}`}>
                              {getStatusIcon(message.status)}
                              <span className="ml-1">{message.status}</span>
                            </Badge>
                            <Badge className={`${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{message.subject}</h3>
                          <p className="text-sm text-gray-600 mb-2">{message.message.substring(0, 100)}...</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{message.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{message.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(message.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Message Details */}
          <div className="space-y-4">
            {selectedMessage ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">বার্তার বিবরণ</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMessage(selectedMessage._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">বিষয়</label>
                      <p className="text-gray-900">{selectedMessage.subject}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">নাম</label>
                      <p className="text-gray-900">{selectedMessage.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">ইমেইল</label>
                      <p className="text-gray-900">{selectedMessage.email}</p>
                    </div>
                    
                    {selectedMessage.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">ফোন</label>
                        <p className="text-gray-900">{selectedMessage.phone}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">বার্তা</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">প্রেরণের সময়</label>
                      <p className="text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">দ্রুত কার্যক্রম</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant={selectedMessage.status === 'read' ? 'default' : 'outline'}
                        onClick={() => updateMessage(selectedMessage._id, { status: 'read' })}
                        disabled={isUpdating}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        পড়া
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedMessage.status === 'replied' ? 'default' : 'outline'}
                        onClick={() => updateMessage(selectedMessage._id, { status: 'replied' })}
                        disabled={isUpdating}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        উত্তর
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedMessage.status === 'closed' ? 'default' : 'outline'}
                        onClick={() => updateMessage(selectedMessage._id, { status: 'closed' })}
                        disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        বন্ধ
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedMessage.status === 'new' ? 'default' : 'outline'}
                        onClick={() => updateMessage(selectedMessage._id, { status: 'new' })}
                        disabled={isUpdating}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        নতুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">অ্যাডমিন নোট</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="নোট লিখুন..."
                      rows={4}
                    />
                    <Button
                      onClick={() => updateMessage(selectedMessage._id, { adminNotes })}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'নোট সংরক্ষণ করুন'}
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">একটি বার্তা নির্বাচন করুন</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}