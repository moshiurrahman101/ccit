'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import PaymentVerificationModal from './PaymentVerificationModal';

interface PendingStudent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  approvalStatus: string;
}

interface PendingPayment {
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

export default function AdminApprovalSystem() {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [paymentToVerify, setPaymentToVerify] = useState<PendingPayment | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchPendingStudents(),
        fetchPendingPayments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('ডেটা আনতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingStudents = async () => {
    try {
      const response = await fetch('/api/admin/student-approvals');
      const data = await response.json();

      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching pending students:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments?verificationStatus=pending');
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const handleStudentApproval = async (userId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      setProcessingId(userId);
      
      const response = await fetch('/api/admin/student-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          rejectionReason
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`শিক্ষার্থী ${action === 'approve' ? 'অনুমোদন' : 'প্রত্যাখ্যান'} করা হয়েছে`);
        setStudents(students.filter(student => student._id !== userId));
      } else {
        toast.error(data.message || `শিক্ষার্থী ${action} করতে সমস্যা হয়েছে`);
      }
    } catch (error) {
      console.error(`Error ${action}ing student:`, error);
      toast.error(`শিক্ষার্থী ${action} করতে সমস্যা হয়েছে`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStudentReject = (userId: string) => {
    const reason = prompt('প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক):');
    if (reason !== null) {
      handleStudentApproval(userId, 'reject', reason);
    }
  };

  const handlePaymentVerify = async (notes?: string) => {
    if (!paymentToVerify) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentToVerify._id,
          action: 'verify',
          verificationNotes: notes
        })
      });

      if (response.ok) {
        await fetchPendingPayments();
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

  const handlePaymentReject = async (reason: string) => {
    if (!paymentToVerify) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentToVerify._id,
          action: 'reject',
          rejectionReason: reason
        })
      });

      if (response.ok) {
        await fetchPendingPayments();
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

  const openPaymentVerification = (payment: PendingPayment) => {
    setPaymentToVerify(payment);
    setVerificationModalOpen(true);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span>অনুমোদন সিস্টেম লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">অনুমোদন ব্যবস্থাপনা</h2>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমান শিক্ষার্থী</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-gray-600">অনুমোদনের অপেক্ষায়</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমান পেমেন্ট</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-gray-600">যাচাইয়ের অপেক্ষায়</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অনুমোদন</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length + payments.length}</div>
            <p className="text-xs text-gray-600">সামগ্রিক অপেক্ষমান</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পরিমাণ</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{formatPrice(payments.reduce((sum, p) => sum + p.amount, 0))}
            </div>
            <p className="text-xs text-gray-600">অপেক্ষমান পেমেন্ট</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            শিক্ষার্থী অনুমোদন ({students.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            পেমেন্ট যাচাই ({payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {students.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">কোন অপেক্ষমান শিক্ষার্থী নেই</h3>
                <p className="text-gray-600">সকল শিক্ষার্থী অনুমোদন করা হয়েছে</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <Card key={student._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {student.email}
                            </div>
                            {student.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {student.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(student.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStudentApproval(student._id, 'approve')}
                          disabled={processingId === student._id}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          {processingId === student._id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          অনুমোদন
                        </Button>
                        <Button
                          onClick={() => handleStudentReject(student._id)}
                          disabled={processingId === student._id}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          প্রত্যাখ্যান
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {payments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">কোন অপেক্ষমান পেমেন্ট নেই</h3>
                <p className="text-gray-600">সকল পেমেন্ট যাচাই করা হয়েছে</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
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
                          <Badge className={getStatusColor(payment.verificationStatus)}>
                            {getStatusText(payment.verificationStatus)}
                          </Badge>
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
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openPaymentVerification(payment)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            যাচাই করুন
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => {
          setVerificationModalOpen(false);
          setPaymentToVerify(null);
        }}
        onVerify={handlePaymentVerify}
        onReject={handlePaymentReject}
        isLoading={isVerifying}
        paymentId={paymentToVerify?._id}
        studentName={paymentToVerify?.studentId?.name}
        amount={paymentToVerify?.amount}
      />
    </div>
  );
}
