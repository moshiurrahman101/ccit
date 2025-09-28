'use client';

import { useState, useEffect } from 'react';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaCurrency, formatBanglaDate } from '@/lib/utils/banglaNumbers';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';

interface Payment {
  _id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'bank' | 'cash';
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  createdAt: string;
  processedBy?: string;
  notes?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchPayments = async () => {
      setTimeout(() => {
        setPayments([
          {
            _id: '1',
            studentName: 'আহমেদ রহমান',
            studentEmail: 'ahmed@example.com',
            courseName: 'Full Stack Web Development',
            amount: 15000,
            method: 'bkash',
            transactionId: 'BKASH123456789',
            status: 'completed',
            paymentDate: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-15T10:00:00Z',
            processedBy: 'সুমাইয়া খান'
          },
          {
            _id: '2',
            studentName: 'ফাতেমা খাতুন',
            studentEmail: 'fatema@example.com',
            courseName: 'Python Data Science',
            amount: 12000,
            method: 'nagad',
            transactionId: 'NAGAD987654321',
            status: 'pending',
            paymentDate: '2024-01-20T14:15:00Z',
            createdAt: '2024-01-20T14:00:00Z'
          },
          {
            _id: '3',
            studentName: 'করিম উদ্দিন',
            studentEmail: 'karim@example.com',
            courseName: 'UI/UX Design',
            amount: 8000,
            method: 'bank',
            transactionId: 'BANK456789123',
            status: 'failed',
            paymentDate: '2024-01-18T09:45:00Z',
            createdAt: '2024-01-18T09:30:00Z',
            notes: 'Insufficient funds'
          },
          {
            _id: '4',
            studentName: 'রাহুল আহমেদ',
            studentEmail: 'rahul@example.com',
            courseName: 'React.js Advanced',
            amount: 10000,
            method: 'cash',
            transactionId: 'CASH789123456',
            status: 'completed',
            paymentDate: '2024-01-22T16:20:00Z',
            createdAt: '2024-01-22T16:00:00Z',
            processedBy: 'আরিফ হোসেন'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchPayments();
  }, []);

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    completedAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    todayAmount: payments.filter(p => 
      new Date(p.paymentDate).toDateString() === new Date().toDateString()
    ).reduce((sum, p) => sum + p.amount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'সম্পন্ন';
      case 'pending': return getStatusText('pending');
      case 'failed': return 'ব্যর্থ';
      case 'refunded': return 'ফেরত';
      default: return status;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'bkash': return 'bg-pink-100 text-pink-800';
      case 'nagad': return 'bg-green-100 text-green-800';
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'cash': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'bank': return 'Bank Transfer';
      case 'cash': return 'Cash';
      default: return method;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded': return <ArrowDownRight className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
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
          পেমেন্ট ও ফিন্যান্স
        </h1>
        <p className="text-gray-600">
          সব পেমেন্ট দেখুন এবং ফিন্যান্সিয়াল রিপোর্ট তৈরি করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট পেমেন্ট</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.total)}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +১২% গত মাসে
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">মোট আয়</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              <CurrencyDisplay amount={stats.totalAmount} size={24} />
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +১৫% গত মাসে
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">আজকের আয়</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              <CurrencyDisplay amount={stats.todayAmount} size={24} />
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +৮% গতকাল
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">সম্পন্ন পেমেন্ট</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatBanglaNumber(stats.completed)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% সফলতা
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="পেমেন্ট খুঁজুন..."
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
            <SelectItem value="completed">সম্পন্ন</SelectItem>
            <SelectItem value="pending">{getStatusText('pending')}</SelectItem>
            <SelectItem value="failed">ব্যর্থ</SelectItem>
            <SelectItem value="refunded">ফেরত</SelectItem>
          </SelectContent>
        </Select>

        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-40 bg-white/20 border-white/30">
            <SelectValue placeholder="পদ্ধতি" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">সব পদ্ধতি</SelectItem>
            <SelectItem value="bkash">bKash</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          <Download className="w-4 h-4 mr-2" />
          রিপোর্ট ডাউনলোড
        </Button>
      </div>

      {/* Payments List */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle>পেমেন্ট তালিকা</CardTitle>
          <CardDescription>
            সব পেমেন্টের বিস্তারিত তথ্য
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment._id} className="flex items-center justify-between p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{payment.studentName}</h3>
                    <p className="text-sm text-gray-600">{payment.studentEmail}</p>
                    <p className="text-sm text-gray-500">{payment.courseName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusLabel(payment.status)}
                      </Badge>
                      <Badge className={getMethodColor(payment.method)}>
                        {getMethodLabel(payment.method)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-800">
                    <CurrencyDisplay amount={payment.amount} size={18} />
                  </div>
                  <p className="text-sm text-gray-600">
                    ID: {payment.transactionId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBanglaDate(new Date(payment.paymentDate))}
                  </p>
                  {payment.processedBy && (
                    <p className="text-xs text-gray-500">
                      প্রসেস: {payment.processedBy}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="bg-white/20 border-white/30">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {payment.status === 'pending' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      অ্যাপ্রুভ
                    </Button>
                  )}
                  {payment.status === 'completed' && (
                    <Button size="sm" variant="outline" className="bg-white/20 border-white/30 text-red-600 hover:text-red-700">
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                      রিফান্ড
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
