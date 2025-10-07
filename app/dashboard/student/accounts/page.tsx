'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Receipt,
  History,
  AlertCircle
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaDate, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import ResponsivePaymentForm from '@/components/dashboard/ResponsivePaymentForm';
import { toast } from 'sonner';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  batchId: {
    _id: string;
    name: string;
    regularPrice: number;
    discountPrice?: number;
  };
  studentId: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  payments: Payment[];
}

interface Payment {
  _id: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'bank_transfer' | 'cash';
  senderNumber: string;
  transactionId?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
}

export default function AccountsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
      };
      
      const token = getCookie('auth-token') || localStorage.getItem('auth-token');
      
      if (!token) {
        setError('অনুমোদন টোকেন পাওয়া যায়নি। অনুগ্রহ করে আবার লগইন করুন।');
        setIsLoading(false);
        return;
      }

      console.log('Fetching invoices...');
      const response = await fetch('/api/students/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 200));
        setError('সার্ভার থেকে অপ্রত্যাশিত প্রতিক্রিয়া। API এন্ডপয়েন্ট পাওয়া যায়নি।');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        console.log('Fetched invoices:', data.invoices);
        setInvoices(data.invoices || []);
      } else {
        console.error('Error response status:', response.status);
        console.error('Error response data:', data);
        setError(data.error || data.message || 'ইনভয়েস লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError(`নেটওয়ার্ক ত্রুটি: ${error instanceof Error ? error.message : 'অজানা ত্রুটি'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInvoice) return;
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
    await fetchInvoices();
    toast.success('পেমেন্ট সফলভাবে জমা হয়েছে!');
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
      };
      
      const token = getCookie('auth-token');

      const response = await fetch(`/api/invoices/${invoiceId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'পরিশোধিত';
      case 'partial': return 'আংশিক পরিশোধিত';
      case 'pending': return 'অপেক্ষমান';
      case 'overdue': return 'মেয়াদ উত্তীর্ণ';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'যাচাইকৃত ✓';
      case 'pending': return 'অপেক্ষমান';
      case 'rejected': return 'প্রত্যাখ্যান';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'bank_transfer': return 'ব্যাংক ট্রান্সফার';
      case 'cash': return 'নগদ';
      default: return method;
    }
  };

  const totalOwed = invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">অ্যাকাউন্টস ম্যানেজমেন্ট</h1>
        <p className="text-gray-600 mt-2">আপনার পেমেন্ট এবং বিলিং তথ্য দেখুন ও পরিচালনা করুন</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Invoices</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট বকেয়া</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <CurrencyDisplay amount={totalOwed} size={24} />
            </div>
            <p className="text-xs text-gray-600">
              পরিশোধ প্রয়োজন
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পরিশোধিত</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CurrencyDisplay amount={totalPaid} size={24} />
            </div>
            <p className="text-xs text-gray-600">
              সফল পেমেন্ট
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ইনভয়েস</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatBanglaNumber(invoices.length)}
            </div>
            <p className="text-xs text-gray-600">
              মোট বিল
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices and Payments */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            ইনভয়েস
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            পেমেন্ট হিস্ট্রি
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">লোড হচ্ছে...</p>
            </div>
          ) : invoices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ইনভয়েস নেই</h3>
                <p className="text-gray-600">আপনার কোন বিল পাওয়া যায়নি</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{invoice.batchId.name}</CardTitle>
                        <p className="text-sm text-gray-600">ইনভয়েস #: {invoice.invoiceNumber}</p>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">মোট পরিমাণ</p>
                        <CurrencyDisplay amount={invoice.amount} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">পরিশোধিত</p>
                        <CurrencyDisplay amount={invoice.paidAmount} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">বকেয়া</p>
                        <CurrencyDisplay amount={invoice.remainingAmount} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">মেয়াদ</p>
                        <p className="font-semibold">{formatBanglaDate(invoice.dueDate)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {invoice.remainingAmount > 0 && (
                        <Link href="/dashboard/student/payment">
                          <Button 
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            পেমেন্ট করুন
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/invoices/${invoice._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          দেখুন
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice(invoice._id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        ডাউনলোড
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>পেমেন্ট হিস্ট্রি</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.flatMap(invoice => 
                  invoice.payments.map(payment => (
                    <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <CurrencyDisplay amount={payment.amount} />
                          <p className="text-sm text-gray-600">{invoice.batchId.name}</p>
                          <p className="text-xs text-gray-500">{formatBanglaDate(payment.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getPaymentStatusColor(payment.status)}>
                          {getPaymentStatusText(payment.status)}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">{getPaymentMethodText(payment.method)}</p>
                        <p className="text-xs text-gray-500">{payment.senderNumber}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Removed inline payment modal and form in favor of dedicated page */}
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs">
          <div>Selected Invoice: {selectedInvoice ? 'Yes' : 'No'}</div>
          <div>Show Dialog: {showPaymentDialog ? 'Yes' : 'No'}</div>
          <div>Invoices Count: {invoices.length}</div>
        </div>
      )}
    </div>
  );
}
