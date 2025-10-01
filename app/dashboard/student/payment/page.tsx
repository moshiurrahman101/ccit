'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate: string;
  batchId: {
    _id: string;
    name: string;
    courseType: string;
  };
}

interface Payment {
  _id: string;
  amount: number;
  paymentMethod: string;
  senderNumber: string;
  transactionId?: string;
  paymentType: string;
  status: string;
  verificationStatus: string;
  submittedAt: string;
  verifiedAt?: string;
  verificationNotes?: string;
  rejectionReason?: string;
}

export default function StudentPaymentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment form state
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    senderNumber: '',
    transactionId: '',
    paymentType: 'partial',
    notes: ''
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'student' && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchData();
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchInvoices(),
        fetchPayments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('ডেটা আনতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/student/invoices', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv._id === invoiceId);
    setSelectedInvoice(invoice || null);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        amount: invoice.remainingAmount.toString(),
        paymentType: invoice.remainingAmount === invoice.finalAmount ? 'full' : 'partial'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) {
      toast.error('অনুগ্রহ করে একটি ইনভয়েস নির্বাচন করুন');
      return;
    }

    if (!formData.amount || !formData.paymentMethod || !formData.senderNumber) {
      toast.error('অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > selectedInvoice.remainingAmount) {
      toast.error('পেমেন্টের পরিমাণ অবৈধ');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice._id,
          amount: amount,
          paymentMethod: formData.paymentMethod,
          senderNumber: formData.senderNumber,
          transactionId: formData.transactionId || undefined,
          paymentType: formData.paymentType,
          otherDocuments: formData.notes ? [formData.notes] : undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('পেমেন্ট সফলভাবে জমা দেওয়া হয়েছে!');
        setFormData({
          amount: '',
          paymentMethod: '',
          senderNumber: '',
          transactionId: '',
          paymentType: 'partial',
          notes: ''
        });
        setSelectedInvoice(null);
        await fetchData();
      } else {
        toast.error(data.message || 'পেমেন্ট জমা দিতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('পেমেন্ট জমা দিতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'যাচাইকৃত';
      case 'pending': return 'অপেক্ষমান';
      case 'rejected': return 'প্রত্যাখ্যাত';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      case 'bank': return 'Bank Transfer';
      case 'cash': return 'Cash';
      default: return method;
    }
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0';
    return new Intl.NumberFormat('en-BD').format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span>পেমেন্ট পেজ লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (user?.role !== 'student' && user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">পেমেন্ট ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-2">আপনার পেমেন্ট জমা দিন এবং ট্র্যাক করুন</p>
        </div>
        <Link href="/dashboard/student">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            ড্যাশবোর্ডে ফিরুন
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              নতুন পেমেন্ট জমা দিন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Invoice Selection */}
              <div className="space-y-2">
                <Label htmlFor="invoice">ইনভয়েস নির্বাচন করুন</Label>
                <Select onValueChange={handleInvoiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="একটি ইনভয়েস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber} - {invoice.batchId.name} (৳{formatPrice(invoice.remainingAmount)} বাকি)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInvoice && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">ইনভয়েস বিবরণ</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">ইনভয়েস নম্বর:</span>
                        <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">কোর্স:</span>
                        <p className="font-medium">{selectedInvoice.batchId.name}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">মোট পরিমাণ:</span>
                        <p className="font-medium">৳{formatPrice(selectedInvoice.finalAmount)}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">বাকি পরিমাণ:</span>
                        <p className="font-medium text-red-600">৳{formatPrice(selectedInvoice.remainingAmount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="my-4 h-px w-full bg-gray-200" />

                  {/* Payment Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">পেমেন্টের পরিমাণ (৳)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="পেমেন্টের পরিমাণ লিখুন"
                      min="1"
                      max={selectedInvoice.remainingAmount}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      সর্বোচ্চ: ৳{formatPrice(selectedInvoice.remainingAmount)}
                    </p>
                  </div>

                  {/* Payment Type */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentType">পেমেন্টের ধরন</Label>
                    <Select 
                      value={formData.paymentType} 
                      onValueChange={(value) => handleInputChange('paymentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">সম্পূর্ণ পেমেন্ট</SelectItem>
                        <SelectItem value="partial">আংশিক পেমেন্ট</SelectItem>
                        <SelectItem value="installment">কিস্তি পেমেন্ট</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">পেমেন্ট পদ্ধতি</Label>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(value) => handleInputChange('paymentMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bkash">
                          <div className="flex items-center gap-2">
                            <img src="/brand/bkash.webp" alt="bKash" className="h-4 w-4" />
                            bKash
                          </div>
                        </SelectItem>
                        <SelectItem value="nagad">
                          <div className="flex items-center gap-2">
                            <img src="/brand/nagad.webp" alt="Nagad" className="h-4 w-4" />
                            Nagad
                          </div>
                        </SelectItem>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <img src="/brand/cash.webp" alt="Cash" className="h-4 w-4" />
                            Cash
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sender Number */}
                  <div className="space-y-2">
                    <Label htmlFor="senderNumber">প্রেরক নম্বর</Label>
                    <Input
                      id="senderNumber"
                      value={formData.senderNumber}
                      onChange={(e) => handleInputChange('senderNumber', e.target.value)}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>

                  {/* Transaction ID */}
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">ট্রানজেকশন আইডি (ঐচ্ছিক)</Label>
                    <Input
                      id="transactionId"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange('transactionId', e.target.value)}
                      placeholder="ট্রানজেকশন আইডি"
                    />
                  </div>

                  

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">নোট (ঐচ্ছিক)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="অতিরিক্ত তথ্য বা নোট"
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        জমা দেওয়া হচ্ছে...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        পেমেন্ট জমা দিন
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              পেমেন্ট ইতিহাস
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">কোন পেমেন্ট পাওয়া যায়নি</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                        <Badge className={getStatusColor(payment.verificationStatus)}>
                          {getStatusText(payment.verificationStatus)}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(payment.submittedAt)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">পরিমাণ:</span>
                        <p className="font-medium">৳{formatPrice(payment.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">পদ্ধতি:</span>
                        <p className="font-medium">{getPaymentMethodText(payment.paymentMethod)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">প্রেরক:</span>
                        <p className="font-medium">{payment.senderNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">টাইপ:</span>
                        <p className="font-medium capitalize">{payment.paymentType}</p>
                      </div>
                    </div>

                    {payment.transactionId && (
                      <div className="text-sm">
                        <span className="text-gray-600">ট্রানজেকশন আইডি:</span>
                        <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {payment.transactionId}
                        </p>
                      </div>
                    )}

                    {payment.verificationNotes && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-sm text-green-800">
                          <strong>যাচাই নোট:</strong> {payment.verificationNotes}
                        </p>
                      </div>
                    )}

                    {payment.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-sm text-red-800">
                          <strong>প্রত্যাখ্যানের কারণ:</strong> {payment.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
