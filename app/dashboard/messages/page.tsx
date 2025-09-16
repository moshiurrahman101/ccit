'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Reply,
  Archive,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Mail,
  Phone,
  Video
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaDate } from '@/lib/utils/banglaNumbers';

interface Message {
  _id: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'student' | 'mentor' | 'admin' | 'support';
  recipientName: string;
  recipientEmail: string;
  subject: string;
  content: string;
  type: 'question' | 'support' | 'general' | 'urgent';
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  replies?: Message[];
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [replyText, setReplyText] = useState('');

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchMessages = async () => {
      setTimeout(() => {
        setMessages([
          {
            _id: '1',
            senderName: 'আহমেদ রহমান',
            senderEmail: 'ahmed@example.com',
            senderRole: 'student',
            recipientName: 'সুমাইয়া খান',
            recipientEmail: 'sumaiya@example.com',
            subject: 'React Hook সম্পর্কে প্রশ্ন',
            content: 'স্যার, React Hook ব্যবহার করার সময় কিছু সমস্যা হচ্ছে। useCallback এবং useMemo এর মধ্যে পার্থক্য কী?',
            type: 'question',
            status: 'unread',
            priority: 'medium',
            createdAt: '2024-01-20T10:30:00Z',
            updatedAt: '2024-01-20T10:30:00Z',
            replies: []
          },
          {
            _id: '2',
            senderName: 'ফাতেমা খাতুন',
            senderEmail: 'fatema@example.com',
            senderRole: 'student',
            recipientName: 'সাপোর্ট টিম',
            recipientEmail: 'support@ccit.com',
            subject: 'পেমেন্ট সমস্যা',
            content: 'আমার পেমেন্ট সফল হয়েছে কিন্তু কোর্সে অ্যাক্সেস পাচ্ছি না। অনুগ্রহ করে সাহায্য করুন।',
            type: 'support',
            status: 'replied',
            priority: 'high',
            createdAt: '2024-01-19T14:15:00Z',
            updatedAt: '2024-01-19T16:45:00Z',
            replies: [
              {
                _id: '2-1',
                senderName: 'সাপোর্ট টিম',
                senderEmail: 'support@ccit.com',
                senderRole: 'support',
                recipientName: 'ফাতেমা খাতুন',
                recipientEmail: 'fatema@example.com',
                subject: 'Re: পেমেন্ট সমস্যা',
                content: 'আপনার সমস্যা সমাধান করা হয়েছে। এখন কোর্সে অ্যাক্সেস পাবেন।',
                type: 'support',
                status: 'read',
                priority: 'high',
                createdAt: '2024-01-19T16:45:00Z',
                updatedAt: '2024-01-19T16:45:00Z'
              }
            ]
          },
          {
            _id: '3',
            senderName: 'করিম উদ্দিন',
            senderEmail: 'karim@example.com',
            senderRole: 'student',
            recipientName: 'রাহুল আহমেদ',
            recipientEmail: 'rahul@example.com',
            subject: 'Python কোর্সের অ্যাসাইনমেন্ট',
            content: 'স্যার, Python কোর্সের অ্যাসাইনমেন্ট সাবমিট করতে সমস্যা হচ্ছে।',
            type: 'question',
            status: 'read',
            priority: 'low',
            createdAt: '2024-01-18T09:20:00Z',
            updatedAt: '2024-01-18T09:20:00Z',
            replies: []
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchMessages();
  }, []);

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length,
    urgent: messages.filter(m => m.priority === 'urgent').length,
    high: messages.filter(m => m.priority === 'high').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unread': return 'অপঠিত';
      case 'read': return 'পঠিত';
      case 'replied': return 'উত্তর দেওয়া';
      case 'archived': return 'আর্কাইভ';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'question': return 'প্রশ্ন';
      case 'support': return 'সাপোর্ট';
      case 'general': return 'সাধারণ';
      case 'urgent': return 'জরুরি';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'জরুরি';
      case 'high': return 'উচ্চ';
      case 'medium': return 'মধ্যম';
      case 'low': return 'নিম্ন';
      default: return priority;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-green-100 text-green-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'support': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'শিক্ষার্থী';
      case 'mentor': return 'মেন্টর';
      case 'admin': return 'অ্যাডমিন';
      case 'support': return 'সাপোর্ট';
      default: return role;
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
          মেসেজ ও যোগাযোগ
        </h1>
        <p className="text-gray-600">
          শিক্ষার্থী এবং মেন্টরের সাথে যোগাযোগ করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট মেসেজ</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.total)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">অপঠিত</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.unread)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">উত্তর দেওয়া</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.replied)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">জরুরি</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.urgent)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="মেসেজ খুঁজুন..."
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
            <SelectItem value="unread">অপঠিত</SelectItem>
            <SelectItem value="read">পঠিত</SelectItem>
            <SelectItem value="replied">উত্তর দেওয়া</SelectItem>
            <SelectItem value="archived">আর্কাইভ</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-white/20 border-white/30">
            <SelectValue placeholder="ধরন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">সব ধরন</SelectItem>
            <SelectItem value="question">প্রশ্ন</SelectItem>
            <SelectItem value="support">সাপোর্ট</SelectItem>
            <SelectItem value="general">সাধারণ</SelectItem>
            <SelectItem value="urgent">জরুরি</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          <Send className="w-4 h-4 mr-2" />
          নতুন মেসেজ
        </Button>
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-4">
          {messages.map((message) => (
            <Card 
              key={message._id} 
              className={`bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer ${
                selectedMessage?._id === message._id ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => setSelectedMessage(message)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusLabel(message.status)}
                      </Badge>
                      <Badge className={getTypeColor(message.type)}>
                        {getTypeLabel(message.type)}
                      </Badge>
                      <Badge className={getPriorityColor(message.priority)}>
                        {getPriorityLabel(message.priority)}
                      </Badge>
                    </div>
                    
                    <h3 className="font-medium text-gray-800 mb-1">
                      {message.subject}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{message.senderName}</span>
                        <Badge className={`ml-2 ${getRoleColor(message.senderRole)}`}>
                          {getRoleLabel(message.senderRole)}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatBanglaDate(new Date(message.createdAt))}</span>
                      </div>
                      {message.replies && message.replies.length > 0 && (
                        <div className="flex items-center">
                          <Reply className="h-3 w-3 mr-1" />
                          <span>{formatBanglaNumber(message.replies.length)} উত্তর</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {message.status === 'unread' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <Button size="sm" variant="outline" className="bg-white/20 border-white/30">
                      <Reply className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message Details */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <Card className="bg-white/20 backdrop-blur-sm border-white/30 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                <CardDescription>
                  {selectedMessage.senderName} ({getRoleLabel(selectedMessage.senderRole)})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="text-sm text-gray-700">{selectedMessage.content}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">উত্তর দিন</h4>
                  <Textarea
                    placeholder="আপনার উত্তর লিখুন..."
                    className="bg-white/20 border-white/30 text-gray-800 placeholder:text-gray-500"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    <Send className="w-4 h-4 mr-2" />
                    উত্তর পাঠান
                  </Button>
                </div>

                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800">পূর্ববর্তী উত্তরসমূহ</h4>
                    {selectedMessage.replies.map((reply, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-800">{reply.senderName}</span>
                          <Badge className={getRoleColor(reply.senderRole)}>
                            {getRoleLabel(reply.senderRole)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatBanglaDate(new Date(reply.createdAt))}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/20 backdrop-blur-sm border-white/30">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">একটি মেসেজ নির্বাচন করুন</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
