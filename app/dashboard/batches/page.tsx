'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import BatchTable from '@/components/dashboard/BatchTable';
import BatchForm from '@/components/dashboard/BatchForm';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { toast } from 'sonner';

interface Batch {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBatches: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalBatches: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async (page = 1, search = '', status = '') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`/api/batches?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setBatches(data.batches);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'ব্যাচের তথ্য লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    fetchBatches(1, search, filters.status);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchBatches(1, newFilters.search, newFilters.status);
  };

  const handlePageChange = (page: number) => {
    fetchBatches(page, filters.search, filters.status);
  };

  const handleAdd = () => {
    setEditingBatch(null);
    setFormOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchBatches(pagination.currentPage, filters.search, filters.status);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingBatch(null);
  };

  const getStatusCounts = () => {
    const upcoming = batches.filter(b => b.status === 'upcoming').length;
    const ongoing = batches.filter(b => b.status === 'ongoing').length;
    const completed = batches.filter(b => b.status === 'completed').length;
    const cancelled = batches.filter(b => b.status === 'cancelled').length;
    const active = batches.filter(b => b.isActive).length;
    return { upcoming, ongoing, completed, cancelled, active, total: batches.length };
  };

  const statusCounts = getStatusCounts();

  if (isLoading && batches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">ব্যাচের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ব্যাচ ব্যবস্থাপনা</h1>
          <p className="text-gray-600">সকল ব্যাচের তথ্য দেখুন এবং পরিচালনা করুন</p>
        </div>
        <AdminOnly>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            নতুন ব্যাচ
          </button>
        </AdminOnly>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যাচ</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আসন্ন</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">চলমান</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সম্পন্ন</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">বাতিল</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.cancelled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয়</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Table */}
      <BatchTable
        batches={batches}
        onRefresh={() => fetchBatches(pagination.currentPage, filters.search, filters.status)}
        onEdit={handleEdit}
        onAdd={handleAdd}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={isLoading}
      />

      {/* Batch Form Modal */}
      <AdminOnly>
        <BatchForm
          batch={editingBatch}
          isOpen={formOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </AdminOnly>
    </div>
  );
}