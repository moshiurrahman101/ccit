'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { AdminOnly } from '@/components/dashboard/RoleGuard';

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

interface StudentTableProps {
  students: Student[];
  batches: string[];
  onRefresh: () => void;
  onEdit: (student: Student) => void;
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

export default function StudentTable({
  students,
  batches,
  onRefresh,
  onEdit,
  onAdd,
  pagination,
  onPageChange,
  onSearch,
  onFilter,
  isLoading
}: StudentTableProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; student: Student | null }>({
    isOpen: false,
    student: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'সক্রিয়';
      case 'inactive': return 'নিষ্ক্রিয়';
      case 'suspended': return 'স্থগিত';
      default: return status;
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

  const handleBatchFilter = (value: string) => {
    setBatchFilter(value);
    onFilter('batch', value === 'all' ? '' : value);
  };

  const handleDelete = async (student: Student) => {
    if (!isAdmin) {
      toast.error('আপনার অনুমতি নেই');
      return;
    }

    setDeleteDialog({ isOpen: true, student });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.student) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${deleteDialog.student._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('শিক্ষার্থী মুছে ফেলা হয়েছে');
        onRefresh();
        setDeleteDialog({ isOpen: false, student: null });
      } else {
        toast.error(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">শিক্ষার্থী ব্যবস্থাপনা</h2>
          <p className="text-gray-600">মোট {pagination.totalStudents} জন শিক্ষার্থী</p>
        </div>
        <AdminOnly>
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            নতুন শিক্ষার্থী
          </Button>
        </AdminOnly>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="স্ট্যাটাস" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব</SelectItem>
              <SelectItem value="active">সক্রিয়</SelectItem>
              <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
              <SelectItem value="suspended">স্থগিত</SelectItem>
            </SelectContent>
          </Select>
          <Select value={batchFilter} onValueChange={handleBatchFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="ব্যাচ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  {batch}
                </SelectItem>
              ))}
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
                <TableHead>শিক্ষার্থী</TableHead>
                <TableHead>ইমেইল</TableHead>
                <TableHead>ফোন</TableHead>
                <TableHead>ব্যাচ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>যোগদান</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-gray-500">
                      <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>কোন শিক্ষার্থী পাওয়া যায়নি</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-600">{student.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-600">{student.phone}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.batch}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(student.status)} text-white`}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-600 text-sm">
                        {formatDate(student.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminOnly>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(student)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            পৃষ্ঠা {pagination.currentPage} এর {pagination.totalPages} ({pagination.totalStudents} জন)
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
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ isOpen: open, student: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>শিক্ষার্থী মুছে ফেলুন</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              আপনি কি নিশ্চিত যে আপনি <strong>{deleteDialog.student?.name}</strong> কে মুছে ফেলতে চান?
            </p>
            <p className="text-sm text-red-600 mt-2">
              এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, student: null })}
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
