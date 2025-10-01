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
  Shield,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'mentor' | 'student' | 'marketing' | 'support';
  isActive: boolean;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
  onEdit: (user: User) => void;
  onAdd: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onFilter: (field: string, value: string) => void;
  isLoading: boolean;
}

const roleLabels = {
  admin: 'অ্যাডমিন',
  mentor: 'মেন্টর',
  student: 'শিক্ষার্থী',
  marketing: 'মার্কেটিং',
  support: 'সাপোর্ট'
};

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  mentor: 'bg-blue-100 text-blue-800',
  student: 'bg-orange-100 text-orange-800',
  marketing: 'bg-green-100 text-green-800',
  support: 'bg-purple-100 text-purple-800'
};

export default function UserTable({
  users,
  onRefresh,
  onEdit,
  onAdd,
  pagination,
  onPageChange,
  onSearch,
  onFilter,
  isLoading
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    onFilter('role', value === 'all' ? '' : value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    onFilter('status', value === 'all' ? '' : value);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteDialog({
      isOpen: true,
      user
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.user) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/users/${deleteDialog.user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে');
        onRefresh();
        setDeleteDialog({ isOpen: false, user: null });
      } else {
        toast.error(data.error || 'ব্যবহারকারী মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, user: null });
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

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ব্যবহারকারী খুঁজুন..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-gray-300"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-40 bg-white border-gray-300">
              <SelectValue placeholder="ভূমিকা" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="all">সব ভূমিকা</SelectItem>
              <SelectItem value="admin">অ্যাডমিন</SelectItem>
              <SelectItem value="mentor">মেন্টর</SelectItem>
              <SelectItem value="student">শিক্ষার্থী</SelectItem>
              <SelectItem value="marketing">মার্কেটিং</SelectItem>
              <SelectItem value="support">সাপোর্ট</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-gray-300">
              <SelectValue placeholder="স্ট্যাটাস" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="all">সব</SelectItem>
              <SelectItem value="active">{getStatusText('active')}</SelectItem>
              <SelectItem value="inactive">{getStatusText('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add User Button */}
        <AdminOnly>
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            নতুন ব্যবহারকারী
          </Button>
        </AdminOnly>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-700 font-semibold">ব্যবহারকারী</TableHead>
              <TableHead className="text-gray-700 font-semibold">ভূমিকা</TableHead>
              <TableHead className="text-gray-700 font-semibold">যোগাযোগ</TableHead>
              <TableHead className="text-gray-700 font-semibold">স্ট্যাটাস</TableHead>
              <TableHead className="text-gray-700 font-semibold">তৈরি হয়েছে</TableHead>
              <TableHead className="text-gray-700 font-semibold text-right">কর্ম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">{getStatusText('dashboard_loading')}</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">কোন ব্যবহারকারী নেই</p>
                    <p className="text-sm">এখনও কোন ব্যবহারকারী যোগ করা হয়নি</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user._id.slice(-8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-3 h-3 mr-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-2" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {getStatusText(user.isActive ? 'active' : 'inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-3 h-3 mr-2" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <AdminOnly>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(user)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AdminOnly>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            মোট {pagination.totalUsers} জন ব্যবহারকারী
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
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="ব্যবহারকারী মুছুন"
        description="আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীকে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।"
        itemName={deleteDialog.user?.name}
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
}
