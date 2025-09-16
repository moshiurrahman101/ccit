'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/dashboard/RoleGuard';

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

interface BatchTableProps {
  batches: Batch[];
  onRefresh: () => void;
  onEdit: (batch: Batch) => void;
  onAdd: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBatches: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onFilter: (field: string, value: string) => void;
  isLoading: boolean;
}

export default function BatchTable({
  batches,
  onRefresh,
  onEdit,
  onAdd,
  pagination,
  onPageChange,
  onSearch,
  onFilter,
  isLoading
}: BatchTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; batch: Batch | null }>({
    isOpen: false,
    batch: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'আসন্ন';
      case 'ongoing': return 'চলমান';
      case 'completed': return 'সম্পন্ন';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'ongoing': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    onFilter('status', value === 'all' ? '' : value);
  };

  const handleDelete = async (batch: Batch) => {
    setDeleteDialog({ isOpen: true, batch });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.batch) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/batches/${deleteDialog.batch._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('ব্যাচ মুছে ফেলা হয়েছে');
        onRefresh();
        setDeleteDialog({ isOpen: false, batch: null });
      } else {
        toast.error(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ব্যাচ ব্যবস্থাপনা</h2>
          <p className="text-gray-600">মোট {pagination.totalBatches} টি ব্যাচ</p>
        </div>
        <AdminOnly>
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <BookOpen className="h-4 w-4 mr-2" />
            নতুন ব্যাচ
          </Button>
        </AdminOnly>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ব্যাচের নাম বা বিবরণ দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="অবস্থা" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব</SelectItem>
              <SelectItem value="upcoming">আসন্ন</SelectItem>
              <SelectItem value="ongoing">চলমান</SelectItem>
              <SelectItem value="completed">সম্পন্ন</SelectItem>
              <SelectItem value="cancelled">বাতিল</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ব্যাচের নাম</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>শিক্ষার্থী</TableHead>
                <TableHead>অবস্থা</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>কোন ব্যাচ পাওয়া যায়নি</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{batch.name}</p>
                        {batch.description && (
                          <p className="text-sm text-gray-500 mt-1">{batch.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <p>{formatDate(batch.startDate)}</p>
                          <p className="text-xs">থেকে</p>
                          <p>{formatDate(batch.endDate)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {batch.currentStudents} / {batch.maxStudents}
                          </p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(batch.currentStudents, batch.maxStudents)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {getProgressPercentage(batch.currentStudents, batch.maxStudents)}% পূর্ণ
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(batch.status)} text-white flex items-center gap-1 w-fit`}>
                        {getStatusIcon(batch.status)}
                        {getStatusLabel(batch.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={batch.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                        {batch.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminOnly>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(batch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(batch)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={batch.currentStudents > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </AdminOnly>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            পৃষ্ঠা {pagination.currentPage} এর {pagination.totalPages} ({pagination.totalBatches} টি)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              পূর্ববর্তী
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              পরবর্তী
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ isOpen: open, batch: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ব্যাচ মুছে ফেলুন</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              আপনি কি নিশ্চিত যে আপনি <strong>{deleteDialog.batch?.name}</strong> ব্যাচটি মুছে ফেলতে চান?
            </p>
            <p className="text-sm text-red-600 mt-2">
              এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, batch: null })}
              disabled={isDeleting}
            >
              বাতিল
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  মুছে ফেলছে...
                </>
              ) : (
                'মুছে ফেলুন'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
