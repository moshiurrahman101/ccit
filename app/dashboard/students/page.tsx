'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2, GraduationCap, Users, CheckCircle, XCircle, AlertCircle, CreditCard, Plus } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import StudentTable from '@/components/dashboard/StudentTable';
import StudentForm from '@/components/dashboard/StudentForm';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  avatar?: string;
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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function StudentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    batch: '',
    status: '',
    gender: '',
    paymentStatus: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (page = 1, search = '', batch = '', status = '', gender = '', paymentStatus = '') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(batch && { batch }),
        ...(status && { status }),
        ...(gender && { gender }),
        ...(paymentStatus && { paymentStatus })
      });

      const response = await fetch(`/api/students?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStudents(data.students);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'শিক্ষার্থীদের তথ্য আনতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    fetchStudents(1, search, filters.batch, filters.status, filters.gender, filters.paymentStatus);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchStudents(1, newFilters.search, newFilters.batch, newFilters.status, newFilters.gender, newFilters.paymentStatus);
  };

  const handlePageChange = (page: number) => {
    fetchStudents(page, filters.search, filters.batch, filters.status, filters.gender, filters.paymentStatus);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleView = (student: Student) => {
    router.push(`/dashboard/students/${student._id}`);
  };

  const handleFormSuccess = () => {
    fetchStudents(pagination.currentPage, filters.search, filters.batch, filters.status, filters.gender, filters.paymentStatus);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingStudent(null);
  };

  const getStudentStats = () => {
    const total = students.length;
    const active = students.filter(s => s.isActive).length;
    const inactive = students.filter(s => !s.isActive).length;
    const verified = students.filter(s => s.studentInfo?.isVerified).length;
    const paid = students.filter(s => s.studentInfo?.paymentInfo?.paymentStatus === 'paid').length;
    const due = students.filter(s => s.studentInfo?.paymentInfo?.paymentStatus === 'due').length;
    const overdue = students.filter(s => s.studentInfo?.paymentInfo?.paymentStatus === 'overdue').length;
    
    return { total, active, inactive, verified, paid, due, overdue };
  };

  const stats = getStudentStats();

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">শিক্ষার্থীদের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">শিক্ষার্থী ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-1">সব শিক্ষার্থীর তথ্য পরিচালনা করুন</p>
        </div>
        <AdminOnly>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link href="/dashboard/students/add">
              <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                ধাপে ধাপে যোগ করুন
              </Button>
            </Link>
            <Button
              onClick={handleAdd}
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              দ্রুত যোগ করুন
            </Button>
          </div>
        </AdminOnly>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">মোট শিক্ষার্থী</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">সক্রিয়</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">যাচাইকৃত</p>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
              <Users className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">পেইড</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">বাকি পেমেন্ট</p>
                <p className="text-2xl font-bold text-orange-600">{stats.due}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">অতিরিক্ত বাকি</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">নিষ্ক্রিয়</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Table */}
      <StudentTable
        students={students}
        onRefresh={() => fetchStudents(pagination.currentPage, filters.search, filters.batch, filters.status, filters.gender, filters.paymentStatus)}
        onEdit={handleEdit}
        onView={handleView}
        onAdd={handleAdd}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={isLoading}
      />

      {/* Student Form Modal */}
      <StudentForm
        student={editingStudent}
        isOpen={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
