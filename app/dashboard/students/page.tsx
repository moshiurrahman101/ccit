'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2, GraduationCap, Users, CheckCircle, XCircle, AlertCircle, CreditCard, Plus } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
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
  role: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  studentInfo?: {
    studentId?: string;
    currentBatch?: string;
    enrollmentDate?: string;
    isActiveStudent?: boolean;
  };
  createdAt: string;
  updatedAt: string;
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
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    due: 0,
    overdue: 0,
    paid: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (page = 1, search = '', status = '') => {
    setIsLoading(true);
    try {
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status })
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
        if (data.stats) {
          setStats(data.stats);
        }
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
    fetchStudents(1, search, filters.status);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchStudents(1, newFilters.search, newFilters.status);
  };

  const handlePageChange = (page: number) => {
    fetchStudents(page, filters.search, filters.status);
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
    fetchStudents(pagination.currentPage, filters.search, filters.status);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingStudent(null);
  };

  // Stats are now fetched from API and stored in state

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{getStatusText('dashboard_loading')}</p>
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

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">অনুমোদনের অপেক্ষায়</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">অনুমোদিত</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">প্রত্যাখ্যান</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Student Table */}
      <StudentTable
        students={students}
        onRefresh={() => fetchStudents(pagination.currentPage, filters.search, filters.status)}
        onEdit={handleEdit as any}
        onView={handleView as any}
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
