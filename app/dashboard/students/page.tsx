'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import StudentTable from '@/components/dashboard/StudentTable';
import StudentForm from '@/components/dashboard/StudentForm';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { toast } from 'sonner';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  batch: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
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
    status: '',
    batch: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (page = 1, search = '', status = '', batch = '') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status }),
        ...(batch && { batch })
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
        toast.error(data.error || 'শিক্ষার্থীদের তথ্য লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    fetchStudents(1, search, filters.status, filters.batch);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchStudents(1, newFilters.search, newFilters.status, newFilters.batch);
  };

  const handlePageChange = (page: number) => {
    fetchStudents(page, filters.search, filters.status, filters.batch);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchStudents(pagination.currentPage, filters.search, filters.status, filters.batch);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingStudent(null);
  };

  const getStatusCounts = () => {
    const active = students.filter(s => s.status === 'active').length;
    const inactive = students.filter(s => s.status === 'inactive').length;
    const suspended = students.filter(s => s.status === 'suspended').length;
    return { active, inactive, suspended, total: students.length };
  };

  const statusCounts = getStatusCounts();

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">শিক্ষার্থীদের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">শিক্ষার্থী ব্যবস্থাপনা</h1>
          <p className="text-gray-600">সকল শিক্ষার্থীর তথ্য দেখুন এবং পরিচালনা করুন</p>
        </div>
        <AdminOnly>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            নতুন শিক্ষার্থী
          </button>
        </AdminOnly>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">
              +2 এই মাসে
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয়</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.active}</div>
            <p className="text-xs text-muted-foreground">
              {statusCounts.total > 0 ? Math.round((statusCounts.active / statusCounts.total) * 100) : 0}% মোটের
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">নিষ্ক্রিয়</CardTitle>
            <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {statusCounts.total > 0 ? Math.round((statusCounts.inactive / statusCounts.total) * 100) : 0}% মোটের
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">স্থগিত</CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.suspended}</div>
            <p className="text-xs text-muted-foreground">
              {statusCounts.total > 0 ? Math.round((statusCounts.suspended / statusCounts.total) * 100) : 0}% মোটের
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student Table */}
      <StudentTable
        students={students}
        batches={[]}
        onRefresh={() => fetchStudents(pagination.currentPage, filters.search, filters.status, filters.batch)}
        onEdit={handleEdit}
        onAdd={handleAdd}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={isLoading}
      />

      {/* Student Form Modal */}
      <AdminOnly>
        <StudentForm
          student={editingStudent}
          isOpen={formOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </AdminOnly>
    </div>
  );
}