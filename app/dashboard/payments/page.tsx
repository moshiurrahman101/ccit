'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye,
  CheckCircle,
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  CreditCard,
  RefreshCw,
  AlertCircle,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmationDialog from '@/components/dashboard/DeleteConfirmationDialog';
import PaymentVerificationModal from '@/components/dashboard/PaymentVerificationModal';

interface Payment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  batchId: {
    _id: string;
    name: string;
    courseType: string;
  };
  invoiceId: {
    _id: string;
    invoiceNumber: string;
    finalAmount: number;
    paidAmount: number;
    status: string;
  };
  amount: number;
  paymentMethod: string;
  senderNumber: string;
  transactionId?: string;
  paymentType: 'full' | 'partial' | 'installment';
  status: 'pending' | 'verified' | 'rejected' | 'refunded';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: {
    name: string;
    email: string;
  };
  verificationNotes?: string;
  rejectionReason?: string;
  paymentScreenshot?: string;
  bankReceipt?: string;
}

export default function AdminPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [paymentToVerify, setPaymentToVerify] = useState<Payment | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchPayments();
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/payments', {
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
      toast.error('পেমেন্ট তথ্য আনতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (notes?: string) => {
    if (!paymentToVerify) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        },
        body: JSON.stringify({
          paymentId: paymentToVerify._id,
          action: 'verify',
          verificationNotes: notes
        })
      });

      if (response.ok) {
        await fetchPayments();
        toast.success('পেমেন্ট সফলভাবে যাচাই করা হয়েছে!');
        setVerificationModalOpen(false);
        setPaymentToVerify(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'পেমেন্ট যাচাই করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('পেমেন্ট যাচাই করতে সমস্যা হয়েছে');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectPayment = async (reason: string) => {
    if (!paymentToVerify) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        },
        body: JSON.stringify({
          paymentId: paymentToVerify._id,
          action: 'reject',
          rejectionReason: reason
        })
      });

      if (response.ok) {
        await fetchPayments();
        toast.success('পেমেন্ট প্রত্যাখ্যান করা হয়েছে!');
        setVerificationModalOpen(false);
        setPaymentToVerify(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'পেমেন্ট প্রত্যাখ্যান করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('পেমেন্ট প্রত্যাখ্যান করতে সমস্যা হয়েছে');
    } finally {
      setIsVerifying(false);
    }
  };

  const openVerificationModal = (payment: Payment) => {
    setPaymentToVerify(payment);
    setVerificationModalOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/payments/${paymentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });
      
      if (response.ok) {
        await fetchPayments();
        toast.success('পেমেন্ট সফলভাবে মুছে ফেলা হয়েছে!');
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'পেমেন্ট মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('পেমেন্ট মুছতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'যাচাইকৃত';
      case 'pending': return 'অপেক্ষমান';
      case 'rejected': return 'প্রত্যাখ্যাত';
      case 'refunded': return 'ফেরত';
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

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '০';
    const formatted = new Intl.NumberFormat('en-BD').format(price);
    // Convert English numerals to Bengali numerals
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return formatted.replace(/\d/g, (digit) => bengaliNumerals[parseInt(digit)]);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      (payment.studentId?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (payment.studentId?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (payment.transactionId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (payment.senderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || payment.verificationStatus === verificationFilter;
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
          <span>পেমেন্ট ব্যবস্থাপনা লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">পেমেন্ট ব্যবস্থাপনা</h1>
        <p className="text-gray-600 mt-2">শিক্ষার্থী পেমেন্ট যাচাই ও অনুমোদন ব্যবস্থাপনা</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পেমেন্ট</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-gray-600">সকল পেমেন্ট</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">যাচাইয়ের অপেক্ষায়</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.verificationStatus === 'pending').length}
            </div>
            <p className="text-xs text-gray-600">যাচাইয়ের অপেক্ষায়</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">যাচাইকৃত</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.verificationStatus === 'verified').length}
            </div>
            <p className="text-xs text-gray-600">যাচাইকৃত পেমেন্ট</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পরিমাণ</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{formatPrice(payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0))}
            </div>
            <p className="text-xs text-gray-600">যাচাইকৃত পেমেন্ট</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="নাম, ইমেইল বা ট্রানজেকশন আইডি দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="স্ট্যাটাস দিয়ে ফিল্টার করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="pending">অপেক্ষমান</SelectItem>
                <SelectItem value="verified">যাচাইকৃত</SelectItem>
                <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
                <SelectItem value="refunded">ফেরত</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="যাচাই স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব যাচাই স্ট্যাটাস</SelectItem>
                <SelectItem value="pending">অপেক্ষমান</SelectItem>
                <SelectItem value="verified">যাচাইকৃত</SelectItem>
                <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchPayments} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              রিফ্রেশ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div>
        {filteredPayments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">কোন পেমেন্ট পাওয়া যায়নি</h3>
              <p className="text-gray-600">আপনার বর্তমান ফিল্টারের সাথে মিলে যায় এমন কোন পেমেন্ট নেই।</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-shrink-0">
                          {payment.studentId?.avatar ? (
                            <img
                              src={payment.studentId.avatar}
                              alt={payment.studentId?.name || 'Student'}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{payment.studentId?.name || 'Unknown Student'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {payment.studentId?.email || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {payment.studentId?.phone || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusText(payment.status)}
                          </Badge>
                          <Badge className={getStatusColor(payment.verificationStatus)}>
                            {getStatusText(payment.verificationStatus)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">পরিমাণ</p>
                          <p className="text-lg font-semibold text-gray-900">৳{formatPrice(payment.amount)}</p>
                          <p className="text-xs text-gray-500">{getPaymentMethodText(payment.paymentMethod)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">প্রেরক নম্বর</p>
                          <p className="text-sm text-gray-900">{payment.senderNumber}</p>
                          {payment.transactionId && (
                            <p className="text-xs text-gray-500">TXN: {payment.transactionId}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">পেমেন্ট টাইপ</p>
                          <p className="text-sm text-gray-900 capitalize">{payment.paymentType}</p>
                          <p className="text-xs text-gray-500">Invoice: {payment.invoiceId?.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">জমা দেওয়ার তারিখ</p>
                          <p className="text-sm text-gray-900">{formatDate(payment.submittedAt)}</p>
                          {payment.verifiedAt && (
                            <p className="text-xs text-gray-500">Verified: {formatDate(payment.verifiedAt)}</p>
                          )}
                        </div>
                      </div>

                      {payment.verificationStatus === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openVerificationModal(payment)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            যাচাই করুন
                          </Button>
                        </div>
                      )}

                      {payment.verificationStatus === 'verified' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">যাচাইকৃত</span>
                          {payment.verifiedAt && (
                            <span className="text-xs text-gray-500">
                              {formatDate(payment.verifiedAt)}
                            </span>
                          )}
                        </div>
                      )}

                      {payment.verificationStatus === 'rejected' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">প্রত্যাখ্যাত</span>
                          {payment.verifiedAt && (
                            <span className="text-xs text-gray-500">
                              {formatDate(payment.verifiedAt)}
                            </span>
                          )}
                        </div>
                      )}

                      {payment.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">
                            <strong>প্রত্যাখ্যানের কারণ:</strong> {payment.rejectionReason}
                          </p>
                        </div>
                      )}

                      {payment.verificationNotes && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">
                            <strong>যাচাই নোট:</strong> {payment.verificationNotes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => {
                            setPaymentToDelete(payment);
                            setDeleteDialogOpen(true);
                          }}
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          মুছে ফেলুন
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPaymentToDelete(null);
        }}
        onConfirm={handleDeletePayment}
        title="পেমেন্ট মুছে ফেলুন"
        description="আপনি কি নিশ্চিত যে এই পেমেন্ট রেকর্ড মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।"
        itemName={paymentToDelete?.studentId?.name || 'Unknown'}
        isLoading={isDeleting}
      />

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => {
          setVerificationModalOpen(false);
          setPaymentToVerify(null);
        }}
        onVerify={handleVerifyPayment}
        onReject={handleRejectPayment}
        isLoading={isVerifying}
        paymentId={paymentToVerify?._id}
        studentName={paymentToVerify?.studentId?.name}
        amount={paymentToVerify?.amount}
      />
    </div>
  );
}