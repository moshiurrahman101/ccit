'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { getStatusText } from '@/lib/utils/statusDictionary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  avatar?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  studentInfo?: {
    studentId?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nid?: string;
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address?: {
      city?: string;
      district?: string;
    };
    emergencyContact?: {
      name?: string;
      phone?: string;
      relation?: string;
    };
    education?: {
      level?: string;
      institution?: string;
      graduationYear?: number;
    };
    socialInfo?: {
      facebook?: string;
      linkedin?: string;
      github?: string;
    };
    paymentInfo?: {
      paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
      paymentNumber?: string;
      transactionId?: string;
      paidAmount?: number;
      dueAmount?: number;
      paymentStatus?: 'paid' | 'partial' | 'due' | 'overdue';
    };
    batchInfo?: {
      batchId?: string;
      batchName?: string;
      status?: 'enrolled' | 'active' | 'completed' | 'dropped' | 'suspended';
    };
    isOfflineStudent?: boolean;
    isVerified?: boolean;
  };
  createdAt: string;
}

interface StudentTableProps {
  students: Student[];
  onRefresh: () => void;
  onEdit: (student: Student) => void;
  onView: (student: Student) => void;
  onAdd: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onFilter: (field: string, value: string) => void;
  isLoading: boolean;
}

const statusLabels = {
  enrolled: getStatusText('enrolled'),
  active: getStatusText('active'),
  completed: getStatusText('completed'),
  dropped: getStatusText('dropped'),
  suspended: getStatusText('suspended')
};

const statusColors = {
  enrolled: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  dropped: 'bg-red-100 text-red-800',
  suspended: 'bg-yellow-100 text-yellow-800'
};

const paymentStatusLabels = {
  paid: getStatusText('paid'),
  partial: getStatusText('partial'),
  due: getStatusText('unpaid'),
  overdue: getStatusText('overdue')
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  due: 'bg-orange-100 text-orange-800',
  overdue: 'bg-red-100 text-red-800'
};

const approvalStatusLabels = {
  pending: 'অনুমোদনের অপেক্ষায়',
  approved: 'অনুমোদিত',
  rejected: 'প্রত্যাখ্যান'
};

const approvalStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function StudentTable({
  students,
  onRefresh,
  onEdit,
  onView,
  onAdd,
  pagination,
  onPageChange,
  onSearch,
  onFilter,
  isLoading
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleBatchFilter = (value: string) => {
    setBatchFilter(value);
    onFilter('batch', value === 'all' ? '' : value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    onFilter('status', value === 'all' ? '' : value);
  };

  const handlePaymentFilter = (value: string) => {
    setPaymentFilter(value);
    onFilter('paymentStatus', value === 'all' ? '' : value);
  };

  const handleGenderFilter = (value: string) => {
    setGenderFilter(value);
    onFilter('gender', value === 'all' ? '' : value);
  };

  const handleApprovalFilter = (value: string) => {
    setApprovalFilter(value);
    onFilter('approvalStatus', value === 'all' ? '' : value);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/students/${studentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'শিক্ষার্থী সফলভাবে মুছে ফেলা হয়েছে');
        onRefresh();
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
      } else {
        toast.error(data.error || 'শিক্ষার্থী মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleApproval = async (studentId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      setIsApproving(studentId);
      
      const response = await fetch('/api/admin/student-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentId,
          action,
          rejectionReason
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`শিক্ষার্থী ${action === 'approve' ? 'অনুমোদিত' : 'প্রত্যাখ্যান'} হয়েছে`);
        onRefresh();
      } else {
        toast.error(data.message || `শিক্ষার্থী ${action === 'approve' ? 'অনুমোদন' : 'প্রত্যাখ্যান'} করতে সমস্যা হয়েছে`);
      }
    } catch (error) {
      console.error(`Error ${action}ing student:`, error);
      toast.error(`শিক্ষার্থী ${action === 'approve' ? 'অনুমোদন' : 'প্রত্যাখ্যান'} করতে সমস্যা হয়েছে`);
    } finally {
      setIsApproving(null);
    }
  };

  const handleReject = (student: Student) => {
    const reason = prompt('প্রত্যাখ্যানের কারণ দিন (ঐচ্ছিক):');
    if (reason !== null) {
      handleApproval(student._id, 'reject', reason);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="শিক্ষার্থী খুঁজুন..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-gray-300"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32 bg-white border-gray-300">
                <SelectValue placeholder="স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="active">{getStatusText('active')}</SelectItem>
                <SelectItem value="inactive">{getStatusText('inactive')}</SelectItem>
                <SelectItem value="enrolled">{getStatusText('enrolled')}</SelectItem>
                <SelectItem value="completed">{getStatusText('completed')}</SelectItem>
                <SelectItem value="dropped">{getStatusText('dropped')}</SelectItem>
                <SelectItem value="suspended">{getStatusText('suspended')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={handlePaymentFilter}>
              <SelectTrigger className="w-32 bg-white border-gray-300">
                <SelectValue placeholder="পেমেন্ট" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all">সব পেমেন্ট</SelectItem>
                <SelectItem value="paid">{getStatusText('paid')}</SelectItem>
                <SelectItem value="partial">{getStatusText('partial')}</SelectItem>
                <SelectItem value="due">{getStatusText('unpaid')}</SelectItem>
                <SelectItem value="overdue">{getStatusText('overdue')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={handleGenderFilter}>
              <SelectTrigger className="w-24 bg-white border-gray-300">
                <SelectValue placeholder="লিঙ্গ" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all">সব</SelectItem>
                <SelectItem value="male">পুরুষ</SelectItem>
                <SelectItem value="female">মহিলা</SelectItem>
                <SelectItem value="other">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>

            <Select value={approvalFilter} onValueChange={handleApprovalFilter}>
              <SelectTrigger className="w-32 bg-white border-gray-300">
                <SelectValue placeholder="অনুমোদন" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all">সব অনুমোদন</SelectItem>
                <SelectItem value="pending">অনুমোদনের অপেক্ষায়</SelectItem>
                <SelectItem value="approved">অনুমোদিত</SelectItem>
                <SelectItem value="rejected">প্রত্যাখ্যান</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add Student Button */}
        <AdminOnly>
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            নতুন শিক্ষার্থী
          </Button>
        </AdminOnly>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-gray-700 font-semibold">শিক্ষার্থী</TableHead>
                <TableHead className="text-gray-700 font-semibold">স্টুডেন্ট আইডি</TableHead>
                <TableHead className="text-gray-700 font-semibold">ব্যাচ</TableHead>
                <TableHead className="text-gray-700 font-semibold">যোগাযোগ</TableHead>
                <TableHead className="text-gray-700 font-semibold">পেমেন্ট</TableHead>
                <TableHead className="text-gray-700 font-semibold">অনুমোদন</TableHead>
                <TableHead className="text-gray-700 font-semibold">স্ট্যাটাস</TableHead>
                <TableHead className="text-gray-700 font-semibold">তারিখ</TableHead>
                <TableHead className="text-gray-700 font-semibold text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">{getStatusText('dashboard_loading')}</p>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-gray-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">কোন শিক্ষার্থী নেই</p>
                      <p className="text-sm">এখনও কোন শিক্ষার্থী যোগ করা হয়নি</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <button
                            onClick={() => onView(student)}
                            className="font-medium text-gray-900 hover:text-orange-600 transition-colors text-left"
                          >
                            {student.name}
                          </button>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {student.studentInfo?.gender && (
                              <span className="capitalize">
                                {student.studentInfo.gender === 'male' ? 'পুরুষ' : 
                                 student.studentInfo.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}
                              </span>
                            )}
                            {student.studentInfo?.isVerified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                {getStatusText('verified')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {student.studentInfo?.studentId || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.studentInfo?.batchInfo?.batchName || 'N/A'}
                        </p>
                        {student.studentInfo?.isOfflineStudent && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                            অফলাইন
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-2" />
                          {student.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-2" />
                          {student.phone}
                        </div>
                        {student.studentInfo?.address?.city && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-3 h-3 mr-2" />
                            {student.studentInfo.address.city}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          className={
                            paymentStatusColors[student.studentInfo?.paymentInfo?.paymentStatus || 'due']
                          }
                        >
                          {paymentStatusLabels[student.studentInfo?.paymentInfo?.paymentStatus || 'due']}
                        </Badge>
                        {student.studentInfo?.paymentInfo?.paidAmount !== undefined && (
                          <div className="text-xs text-gray-600">
                            {formatCurrency(student.studentInfo.paymentInfo.paidAmount)}
                          </div>
                        )}
                        {student.studentInfo?.paymentInfo?.dueAmount !== undefined && 
                         student.studentInfo.paymentInfo.dueAmount > 0 && (
                          <div className="text-xs text-red-600">
                            বাকি: {formatCurrency(student.studentInfo.paymentInfo.dueAmount)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          className={
                            approvalStatusColors[student.approvalStatus || 'pending']
                          }
                        >
                          {approvalStatusLabels[student.approvalStatus || 'pending']}
                        </Badge>
                        {student.approvalDate && (
                          <div className="text-xs text-gray-600">
                            {formatDate(student.approvalDate)}
                          </div>
                        )}
                        {student.rejectionReason && (
                          <div className="text-xs text-red-600">
                            {student.rejectionReason}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant={student.isActive ? 'default' : 'secondary'}
                        >
                          {getStatusText(student.isActive ? 'active' : 'inactive')}
                        </Badge>
                        {student.studentInfo?.batchInfo?.status && (
                          <Badge 
                            className={statusColors[student.studentInfo.batchInfo.status]}
                          >
                            {statusLabels[student.studentInfo.batchInfo.status]}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-3 h-3 mr-2" />
                        {formatDate(student.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-200 hover:bg-gray-50"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => onView(student)}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              দেখুন
                            </DropdownMenuItem>
                            
                            <AdminOnly>
                              {student.approvalStatus === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleApproval(student._id, 'approve')}
                                    disabled={isApproving === student._id}
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    {isApproving === student._id ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    অনুমোদন করুন
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReject(student)}
                                    disabled={isApproving === student._id}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    প্রত্যাখ্যান করুন
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onEdit(student)}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                সম্পাদনা করুন
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(student)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                মুছে ফেলুন
                              </DropdownMenuItem>
                            </AdminOnly>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            মোট {pagination.totalStudents} জন শিক্ষার্থী
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="bg-white border-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
              পূর্ববর্তী
            </Button>
            <span className="text-sm text-gray-600 px-3">
              পৃষ্ঠা {pagination.currentPage} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="bg-white border-gray-300"
            >
              পরবর্তী
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                  শিক্ষার্থী মুছে ফেলুন
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  এই অ্যাকশনটি পূর্বাবস্থায় ফেরানো যাবে না
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">
              আপনি কি <span className="font-semibold text-gray-900">&ldquo;{studentToDelete?.name}&rdquo;</span> শিক্ষার্থী মুছে ফেলতে চান?
            </p>
            {studentToDelete && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">ইমেইল:</span> {studentToDelete.email}</p>
                  <p><span className="font-medium">ফোন:</span> {studentToDelete.phone}</p>
                  {studentToDelete.studentInfo?.studentId && (
                    <p><span className="font-medium">স্টুডেন্ট আইডি:</span> {studentToDelete.studentInfo.studentId}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              {getStatusText('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  মুছে ফেলছেন...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  মুছে ফেলুন
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
