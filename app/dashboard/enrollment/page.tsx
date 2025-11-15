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
  Filter, 
  Eye,
  CheckCircle,
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { formatBanglaNumber } from '@/lib/utils/banglaNumbers';
import { toast } from 'sonner';
import DeleteConfirmationDialog from '@/components/dashboard/DeleteConfirmationDialog';

interface Enrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  batch: {
      _id: string;
      name: string;
    courseType: string;
    regularPrice: number;
    discountPrice?: number;
  };
  course: {
    _id: string;
    title: string;
  };
  enrollmentDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed';
  amount: number;
  progress: number;
  lastAccessed: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  studentId: string;
  batchId: string;
  studentName: string;
  batchName: string;
  regularPrice: number;
  discountPrice?: number;
  finalAmount: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  dueDate: string;
  createdAt: string;
  payments: Array<{
    amount: number;
    method: string;
    transactionId: string;
    senderNumber: string;
    date: string;
  }>;
}

export default function AdminEnrollmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'enrollments' | 'invoices'>('enrollments');
  
  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'enrollment' | 'invoice', id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchEnrollments();
      fetchInvoices();
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/admin/enrollments', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices', {
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
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteEnrollment = (enrollmentId: string, studentName: string) => {
    setItemToDelete({ type: 'enrollment', id: enrollmentId, name: studentName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteInvoice = (invoiceId: string, invoiceNumber: string) => {
    setItemToDelete({ type: 'invoice', id: invoiceId, name: invoiceNumber });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const endpoint = itemToDelete.type === 'enrollment' 
        ? `/api/admin/enrollments?id=${itemToDelete.id}`
        : `/api/admin/invoices?id=${itemToDelete.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        }
      });

      if (response.ok) {
        if (itemToDelete.type === 'enrollment') {
          await fetchEnrollments();
        } else {
          await fetchInvoices();
        }
        toast.success(`${itemToDelete.type === 'enrollment' ? 'এনরোলমেন্ট' : 'ইনভয়েস'} সফলভাবে মুছে ফেলা হয়েছে!`);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `${itemToDelete.type === 'enrollment' ? 'এনরোলমেন্ট' : 'ইনভয়েস'} মুছতে সমস্যা হয়েছে`);
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast.error(`${itemToDelete.type === 'enrollment' ? 'এনরোলমেন্ট' : 'ইনভয়েস'} মুছতে সমস্যা হয়েছে`);
    } finally {
      setIsDeleting(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Unknown';
    switch (status) {
      case 'approved': return 'অনুমোদিত';
      case 'pending': return 'অপেক্ষমান';
      case 'rejected': return 'প্রত্যাখ্যাত';
      case 'completed': return 'সম্পন্ন';
      case 'paid': return 'পরিশোধিত';
      case 'partial': return 'আংশিক';
      case 'failed': return 'ব্যর্থ';
      case 'overdue': return 'মেয়াদোত্তীর্ণ';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0';
    return new Intl.NumberFormat('en-BD').format(price);
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      (enrollment.student?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (enrollment.student?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (enrollment.batch?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || enrollment.paymentStatus === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      (invoice.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (invoice.batchName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (invoice.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
          <span>এনরোলমেন্ট ব্যবস্থাপনা লোড হচ্ছে...</span>
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
        <h1 className="text-3xl font-bold text-gray-900">এনরোলমেন্ট ব্যবস্থাপনা</h1>
        <p className="text-gray-600 mt-2">শিক্ষার্থী এনরোলমেন্ট ও পেমেন্ট অনুমোদন ব্যবস্থাপনা</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট এনরোলমেন্ট</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(enrollments.length)}</div>
            <p className="text-xs text-gray-600">সকল এনরোলমেন্ট</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অনুমোদনের অপেক্ষায়</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBanglaNumber(enrollments.filter(e => e.status === 'pending').length)}
            </div>
            <p className="text-xs text-gray-600">পর্যালোচনার অপেক্ষায়</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অনুমোদিত</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBanglaNumber(enrollments.filter(e => e.status === 'approved').length)}
            </div>
            <p className="text-xs text-gray-600">সক্রিয় শিক্ষার্থী</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{formatPrice(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.finalAmount, 0))}
            </div>
            <p className="text-xs text-gray-600">পরিশোধিত ইনভয়েস</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'enrollments'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <GraduationCap className="h-4 w-4 inline mr-2" />
            এনরোলমেন্ট ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            ইনভয়েস ({invoices.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card>
            <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                placeholder="নাম, ইমেইল বা কোর্স দিয়ে খুঁজুন..."
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
                <SelectItem value="approved">অনুমোদিত</SelectItem>
                <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
                <SelectItem value="completed">সম্পন্ন</SelectItem>
                  </SelectContent>
                </Select>

            {activeTab === 'enrollments' && (
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger>
                  <SelectValue placeholder="পেমেন্ট দিয়ে ফিল্টার করুন" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">সব পেমেন্ট স্ট্যাটাস</SelectItem>
                  <SelectItem value="pending">অপেক্ষমান</SelectItem>
                  <SelectItem value="paid">পরিশোধিত</SelectItem>
                  <SelectItem value="partial">আংশিক</SelectItem>
                  <SelectItem value="failed">ব্যর্থ</SelectItem>
                  </SelectContent>
                </Select>
            )}

            <Button onClick={() => { fetchEnrollments(); fetchInvoices(); }} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              রিফ্রেশ
            </Button>
              </div>
            </CardContent>
          </Card>

      {/* Content based on active tab */}
      {activeTab === 'enrollments' ? (
        <div>
          {filteredEnrollments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">কোন এনরোলমেন্ট পাওয়া যায়নি</h3>
                <p className="text-gray-600">আপনার বর্তমান ফিল্টারের সাথে মিলে যায় এমন কোন এনরোলমেন্ট নেই।</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <Card key={enrollment._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-shrink-0">
                            {enrollment.student?.avatar ? (
                              <img
                                src={enrollment.student.avatar}
                                alt={enrollment.student?.name || 'Student'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{enrollment.student?.name || 'Unknown Student'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {enrollment.student?.email || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {enrollment.student?.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(enrollment.status)}>
                              {getStatusText(enrollment.status)}
                            </Badge>
                            <Badge className={getStatusColor(enrollment.paymentStatus)}>
                              {getStatusText(enrollment.paymentStatus)}
                            </Badge>
                      </div>
                    </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">কোর্স</p>
                            <p className="text-sm text-gray-900">{enrollment.batch?.name || 'Unknown Course'}</p>
                            <p className="text-xs text-gray-500">{enrollment.batch?.courseType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">পরিমাণ</p>
                            <p className="text-sm text-gray-900">৳{formatPrice(enrollment.amount || 0)}</p>
                            {enrollment.batch?.discountPrice && (
                              <p className="text-xs text-gray-500">
                                Regular: ৳{formatPrice(enrollment.batch.regularPrice || 0)}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">এনরোলমেন্ট তারিখ</p>
                            <p className="text-sm text-gray-900">{formatDate(enrollment.enrollmentDate)}</p>
                            <p className="text-xs text-gray-500">
                              Last accessed: {formatDate(enrollment.lastAccessed)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleDeleteEnrollment(enrollment._id, enrollment.student?.name || 'Unknown Student')}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            মুছে ফেলুন
                          </Button>
                        </div>

                        {enrollment.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                              <strong>প্রত্যাখ্যানের কারণ:</strong> {enrollment.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {filteredInvoices.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">কোন ইনভয়েস পাওয়া যায়নি</h3>
                <p className="text-gray-600">আপনার বর্তমান ফিল্টারের সাথে মিলে যায় এমন কোন ইনভয়েস নেই।</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Invoice #{invoice.invoiceNumber || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-600">{invoice.studentName || 'Unknown Student'}</p>
                            <p className="text-sm text-gray-600">{invoice.batchName || 'Unknown Batch'}</p>
                          </div>
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusText(invoice.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">পরিমাণ</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ৳{formatPrice(invoice.finalAmount || 0)}
                            </p>
                            {invoice.discountPrice && (
                              <p className="text-xs text-gray-500">
                                Discount: ৳{formatPrice((invoice.regularPrice || 0) - (invoice.discountPrice || 0))}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">মেয়াদ</p>
                            <p className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">তৈরি</p>
                            <p className="text-sm text-gray-900">{formatDate(invoice.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">পেমেন্ট</p>
                            <p className="text-sm text-gray-900">{invoice.payments?.length || 0} payment(s)</p>
                          </div>
                        </div>

                        {invoice.payments && invoice.payments.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">পেমেন্ট ইতিহাস</p>
                            <div className="space-y-2">
                              {invoice.payments.map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="text-sm font-medium">৳{formatPrice(payment.amount || 0)}</p>
                                    <p className="text-xs text-gray-500">{payment.method || 'N/A'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">{payment.transactionId || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            বিস্তারিত দেখুন
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF ডাউনলোড
                          </Button>
                          <Button 
                            onClick={() => handleDeleteInvoice(invoice._id, invoice.invoiceNumber || 'Unknown Invoice')}
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'enrollment' ? 'এনরোলমেন্ট মুছে ফেলুন' : 'ইনভয়েস মুছে ফেলুন'}
        description={`আপনি কি নিশ্চিত যে আপনি ${itemToDelete?.type === 'enrollment' ? 'এই এনরোলমেন্ট' : 'এই ইনভয়েস'} মুছে ফেলতে চান?`}
        itemName={itemToDelete?.name || 'Unknown'}
        isLoading={isDeleting}
      />
    </div>
  );
}
