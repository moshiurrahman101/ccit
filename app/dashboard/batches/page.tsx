'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, Users, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { toast } from 'sonner';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { Button } from '@/components/ui/button';
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

interface Batch {
  _id: string;
  name: string;
  description: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  mentorId: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
  };
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  modules: {
    title: string;
    description: string;
    duration: number;
    order: number;
  }[];
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  marketing: {
  slug: string;
  metaDescription?: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    batch: Batch | null;
  }>({
    isOpen: false,
    batch: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async (page = 1, search = '', status = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`/api/public/batches?${params}`);

      const data = await response.json();

      if (response.ok) {
        console.log('Batches loaded:', data.batches);
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

  const handleDeleteClick = (batch: Batch) => {
    setDeleteDialog({
      isOpen: true,
      batch
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.batch) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch(`/api/batches/${deleteDialog.batch._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('ব্যাচ সফলভাবে মুছে ফেলা হয়েছে');
        setDeleteDialog({ isOpen: false, batch: null });
        fetchBatches(pagination.currentPage, filters.search, filters.status);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'ব্যাচ মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, batch: null });
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
          <p className="text-gray-600">{getStatusText('dashboard_loading')}</p>
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
          <Link
            href="/dashboard/batches/new"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            নতুন ব্যাচ
          </Link>
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
            <CardTitle className="text-sm font-medium">{getStatusText('upcoming')}</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getStatusText('ongoing')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getStatusText('completed')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getStatusText('cancelled')}</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.cancelled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getStatusText('active')}</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">সব ব্যাচ</h2>
              <p className="text-sm text-gray-600">আপনার ব্যাচগুলো পরিচালনা এবং পর্যবেক্ষণ করুন</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ব্যাচ খুঁজুন..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="px-3 py-2 border rounded-md w-64"
              />
              <select
                value={filters.status}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">সব স্ট্যাটাস</option>
                <option value="draft">খসড়া</option>
                <option value="published">প্রকাশিত</option>
                <option value="upcoming">আসন্ন</option>
                <option value="ongoing">চলমান</option>
                <option value="completed">সম্পন্ন</option>
                <option value="cancelled">বাতিল</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ব্যাচ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মেন্টর</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ধরন</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মূল্য</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষার্থী</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কর্ম</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    কোনো ব্যাচ পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                <tr key={batch._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {batch.coverPhoto ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={batch.coverPhoto}
                          alt={batch.name}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-orange-600" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                        <div className="text-xs text-gray-500">{batch.courseType === 'online' ? 'অনলাইন' : 'অফলাইন'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {batch.mentorId.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={batch.mentorId.avatar}
                          alt={batch.mentorId.name}
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{batch.mentorId.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{batch.mentorId.name}</div>
                        <div className="text-sm text-gray-500">{batch.mentorId.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      batch.courseType === 'online' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {batch.courseType === 'online' ? 'অনলাইন' : 'অফলাইন'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">৳{batch.regularPrice.toLocaleString()}</div>
                      {batch.discountPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          ৳{batch.discountPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      {batch.currentStudents}/{batch.maxStudents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      batch.status === 'published' ? 'bg-green-100 text-green-800' :
                      batch.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      batch.status === 'ongoing' ? 'bg-orange-100 text-orange-800' :
                      batch.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      batch.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(batch.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/batches/${batch._id}/edit`}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        সম্পাদনা
                      </Link>
                      <a
                        href={`/batches/${batch.marketing.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        দেখুন
                      </a>
                      <button
                        onClick={() => handleDeleteClick(batch)}
                        className="inline-flex items-center justify-center px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded border border-red-600 hover:border-red-700 transition-colors"
                        title="Delete batch"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        মুছে ফেলুন
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {((pagination.currentPage - 1) * 10) + 1} থেকে {Math.min(pagination.currentPage * 10, pagination.totalBatches)} দেখানো হচ্ছে, মোট {pagination.totalBatches} টি ফলাফল
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  পূর্ববর্তী
                </button>
                <span className="text-sm text-gray-700">
                  পৃষ্ঠা {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog({ isOpen: false, batch: null });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ব্যাচ মুছে ফেলুন</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি কি নিশ্চিত যে আপনি <strong>&quot;{deleteDialog.batch?.name}&quot;</strong> ব্যাচটি মুছে ফেলতে চান? 
              এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  মুছে ফেলছি...
                </>
              ) : (
                'মুছে ফেলুন'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}