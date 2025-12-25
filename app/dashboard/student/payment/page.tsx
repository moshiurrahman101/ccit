'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as SelectPrimitive from '@radix-ui/react-select';
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
  batchName: string;
  courseType: 'batch' | 'course';
  batchId: {
    _id: string;
    name: string;
    courseType: string;
  } | null;
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
      } else if (user.role === 'student') {
        checkApprovalStatus();
      } else {
        fetchData();
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const checkApprovalStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.user) {
        const status = data.user.approvalStatus || 'pending';
        
        if (status !== 'approved') {
          router.push('/dashboard/student');
          return;
        }
        
        fetchData();
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    }
  };

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
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Auto-select payment type based on amount
      if (field === 'amount' && selectedInvoice) {
        const amount = parseFloat(value) || 0;
        const remainingAmount = selectedInvoice.remainingAmount;
        updated.paymentType = amount >= remainingAmount ? 'full' : 'partial';
      }
      
      return updated;
    });
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv._id === invoiceId);
    setSelectedInvoice(invoice || null);
    if (invoice) {
      // Check if it's a free batch (price is 0)
      if (invoice.finalAmount === 0) {
        // Auto-submit payment for free batches
        handleFreeBatchPayment(invoice);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        amount: invoice.remainingAmount.toString(),
        paymentType: invoice.remainingAmount === invoice.finalAmount ? 'full' : 'partial'
      }));
    }
  };

  const handleFreeBatchPayment = async (invoice: Invoice) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        },
        body: JSON.stringify({
          invoiceId: invoice._id,
          amount: 0,
          paymentMethod: 'free',
          senderNumber: 'N/A',
          transactionId: 'FREE_BATCH',
          paymentType: 'full',
          otherDocuments: ['Free batch - automatic payment']
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('ফ্রি ব্যাচের জন্য পেমেন্ট স্বয়ংক্রিয়ভাবে সম্পন্ন হয়েছে!');
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
      console.error('Error submitting free batch payment:', error);
      toast.error('পেমেন্ট জমা দিতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
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

      {/* Payment Instructions Section - At Top */}
      <Card className="bg-gradient-to-br from-blue-50 to-orange-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">পেমেন্ট নির্দেশাবলী</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Account Numbers */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <Label className="font-semibold text-blue-900 mb-3 block">পেমেন্ট করুন এই নম্বরে:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">bK</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">bKash নম্বর</p>
                    <p className="text-xl font-bold text-green-700 font-mono">01603718379</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-700 font-bold text-sm">NG</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nagad নম্বর</p>
                    <p className="text-xl font-bold text-purple-700 font-mono">01845202101</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">RK</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rocket নম্বর</p>
                    <p className="text-xl font-bold text-blue-700 font-mono">01845202101</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Steps */}
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <Label className="font-semibold text-orange-900 mb-3 block">পেমেন্ট করার ধাপসমূহ:</Label>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li className="flex items-start gap-2">
                <span className="font-semibold">১.</span>
                <span>উপরের নম্বরে পেমেন্ট করুন</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">২.</span>
                <span>পেমেন্টের পর ট্রানজেকশন আইডি সংগ্রহ করুন</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">৩.</span>
                <span>নিচের ফর্মে প্রেরক নম্বর এবং ট্রানজেকশন আইডি দিন</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">৪.</span>
                <span>"পেমেন্ট জমা দিন" বাটনে ক্লিক করুন</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">৫.</span>
                <span>অ্যাডমিন যাচাই করার পর আপনার পেমেন্ট নিশ্চিত করা হবে</span>
              </li>
            </ol>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">গুরুত্বপূর্ণ:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>শুধুমাত্র উপরের নম্বরে পেমেন্ট করুন</li>
                  <li>পেমেন্টের পর অবশ্যই ট্রানজেকশন আইডি সংরক্ষণ করুন</li>
                  <li>পেমেন্ট যাচাই হতে ২৪-৪৮ ঘন্টা সময় লাগতে পারে</li>
                  <li>কোন সমস্যা হলে সাপোর্টে যোগাযোগ করুন: creativecanvasit@gmail.com</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              নতুন পেমেন্ট জমা দিন
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Invoice Selection */}
              <div className="space-y-2 relative">
                <Label htmlFor="invoice">ইনভয়েস নির্বাচন করুন</Label>
                <Select onValueChange={handleInvoiceSelect} value={selectedInvoice?._id || undefined}>
                  <SelectTrigger className="w-full">
                    {selectedInvoice ? (
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                        <span className="font-medium truncate flex-1">{selectedInvoice.batchId?.name || selectedInvoice.batchName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 font-mono">{selectedInvoice.invoiceNumber}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-orange-600 font-semibold">৳{formatPrice(selectedInvoice.remainingAmount)}</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="একটি ইনভয়েস নির্বাচন করুন" />
                    )}
                  </SelectTrigger>
                  <SelectContent 
                    position="popper"
                    className="max-h-[400px] w-[var(--radix-select-trigger-width)] overflow-y-auto z-[100] p-2"
                    sideOffset={4}
                  >
                    {invoices.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-gray-500">
                        <p>কোন ইনভয়েস পাওয়া যায়নি</p>
                      </div>
                    ) : (
                      invoices.map((invoice) => (
                        <SelectItem 
                          key={invoice._id} 
                          value={invoice._id}
                          className="p-0 focus:bg-transparent data-[highlighted]:bg-transparent"
                        >
                          {/* Detailed card design for dropdown */}
                          <div className="w-full p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                                    <p className="font-semibold text-sm text-gray-900 truncate">
                                      {invoice.batchId?.name || invoice.batchName}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono ml-4">
                                    {invoice.invoiceNumber}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <div className="px-2 py-1 bg-orange-100 rounded-md">
                                    <p className="text-xs font-bold text-orange-700">
                                      ৳{formatPrice(invoice.remainingAmount)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-500">মোট:</span>
                                    <span className="font-medium text-gray-700">৳{formatPrice(invoice.finalAmount)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-500">পরিশোধিত:</span>
                                    <span className="font-medium text-green-600">৳{formatPrice(invoice.paidAmount)}</span>
                                  </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  invoice.status === 'paid' 
                                    ? 'bg-green-100 text-green-700' 
                                    : invoice.status === 'partial'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {invoice.status === 'paid' ? 'পরিশোধিত' : invoice.status === 'partial' ? 'আংশিক' : 'বাকি'}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                    )}
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
                        <p className="font-medium">{selectedInvoice.batchId?.name || selectedInvoice.batchName}</p>
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

                  {/* Payment Type - Auto-selected based on amount */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentType">পেমেন্টের ধরন</Label>
                    <Select 
                      value={formData.paymentType} 
                      onValueChange={(value) => handleInputChange('paymentType', value)}
                      disabled={true}
                    >
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">সম্পূর্ণ পেমেন্ট</SelectItem>
                        <SelectItem value="partial">আংশিক পেমেন্ট</SelectItem>
                        <SelectItem value="installment">কিস্তি পেমেন্ট</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {formData.paymentType === 'full' 
                        ? 'সম্পূর্ণ পরিমাণ দেওয়া হয়েছে - সম্পূর্ণ পেমেন্ট হিসেবে নির্বাচিত' 
                        : 'আংশিক পরিমাণ দেওয়া হয়েছে - আংশিক পেমেন্ট হিসেবে নির্বাচিত'}
                    </p>
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
