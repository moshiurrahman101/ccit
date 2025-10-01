'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, Shield, UserCheck, UserX, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
import UserTable from '@/components/dashboard/UserTable';
import UserForm from '@/components/dashboard/UserForm';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'mentor' | 'student' | 'marketing' | 'support';
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1, search = '', role = '', status = '') => {
    setIsLoading(true);
    try {
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status })
      });

      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'ব্যবহারকারীদের তথ্য আনতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    fetchUsers(1, search, filters.role, filters.status);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchUsers(1, newFilters.search, newFilters.role, newFilters.status);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, filters.search, filters.role, filters.status);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: User) => {
    router.push(`/dashboard/users/${user._id}/edit`);
  };

  const handleFormSuccess = () => {
    fetchUsers(pagination.currentPage, filters.search, filters.role, filters.status);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const getRoleCounts = () => {
    const admin = users.filter(u => u.role === 'admin').length;
    const mentor = users.filter(u => u.role === 'mentor').length;
    const student = users.filter(u => u.role === 'student').length;
    const marketing = users.filter(u => u.role === 'marketing').length;
    const support = users.filter(u => u.role === 'support').length;
    const active = users.filter(u => u.isActive).length;
    const inactive = users.filter(u => !u.isActive).length;
    return { admin, mentor, student, marketing, support, active, inactive, total: users.length };
  };

  const roleCounts = getRoleCounts();

  if (isLoading && users.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">ব্যবহারকারী ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-1">সিস্টেমের সব ব্যবহারকারী পরিচালনা করুন</p>
        </div>
        <AdminOnly>
          <button
            onClick={handleAdd}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>নতুন ব্যবহারকারী</span>
          </button>
        </AdminOnly>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">মোট ব্যবহারকারী</p>
                <p className="text-2xl font-bold">{roleCounts.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{getStatusText('active')}</p>
                <p className="text-2xl font-bold">{roleCounts.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">{getStatusText('inactive')}</p>
                <p className="text-2xl font-bold">{roleCounts.inactive}</p>
              </div>
              <UserX className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">অ্যাডমিন</p>
                <p className="text-2xl font-bold">{roleCounts.admin}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">ভূমিকা অনুযায়ী বিতরণ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{roleCounts.student}</p>
              <p className="text-sm text-orange-800">শিক্ষার্থী</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{roleCounts.mentor}</p>
              <p className="text-sm text-blue-800">মেন্টর</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{roleCounts.marketing}</p>
              <p className="text-sm text-green-800">মার্কেটিং</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{roleCounts.support}</p>
              <p className="text-sm text-purple-800">সাপোর্ট</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{roleCounts.admin}</p>
              <p className="text-sm text-red-800">অ্যাডমিন</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <UserTable
        users={users}
        onRefresh={() => fetchUsers(pagination.currentPage, filters.search, filters.role, filters.status)}
        onEdit={handleEdit}
        onAdd={handleAdd}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={isLoading}
      />

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
