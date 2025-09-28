'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Eye,
  Key,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaDate } from '@/lib/utils/banglaNumbers';
import { UserForm } from './UserForm';
import { UserDetails } from './UserDetails';
import { BulkActions } from './BulkActions';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'marketing' | 'support';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin: number;
    mentor: number;
    marketing: number;
    support: number;
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: { admin: 0, mentor: 0, marketing: 0, support: 0 }
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats');
      const data = await response.json();

      if (response.ok) {
        setStats({
          total: data.total,
          active: data.active,
          inactive: data.inactive,
          byRole: data.byRole
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারী মুছে ফেলতে চান?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'ব্যবহারকারী মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('ব্যবহারকারী মুছতে সমস্যা হয়েছে');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      });

      if (response.ok) {
        fetchUsers();
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'ব্যবহারকারীর অবস্থা পরিবর্তন করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('ব্যবহারকারীর অবস্থা পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  const handleUserFormSuccess = () => {
    setShowUserForm(false);
    setEditingUser(null);
    fetchUsers();
    fetchStats();
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
    setSelectAll(!selectAll);
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      case 'support': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'অ্যাডমিন';
      case 'mentor': return 'মেন্টর';
      case 'marketing': return 'মার্কেটিং';
      case 'support': return 'সাপোর্ট';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ব্যবহারকারী ব্যবস্থাপনা
        </h2>
        <p className="text-gray-600">
          অ্যাডমিন, মেন্টর, মার্কেটিং এবং সাপোর্ট ব্যবহারকারী পরিচালনা করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয়</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.active)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">নিষ্ক্রিয়</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.inactive)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অ্যাডমিন</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.byRole.admin || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedUsers={selectedUsers}
        onClearSelection={handleClearSelection}
        onRefresh={() => {
          fetchUsers();
          fetchStats();
        }}
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ব্যবহারকারী খুঁজুন..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <Select value={roleFilter} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="ভূমিকা" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">সব ভূমিকা</SelectItem>
            <SelectItem value="admin">অ্যাডমিন</SelectItem>
            <SelectItem value="mentor">মেন্টর</SelectItem>
            <SelectItem value="marketing">মার্কেটিং</SelectItem>
            <SelectItem value="support">সাপোর্ট</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="অবস্থা" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">সব অবস্থা</SelectItem>
            <SelectItem value="active">সক্রিয়</SelectItem>
            <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          onClick={() => setShowUserForm(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          নতুন ব্যবহারকারী
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>ব্যবহারকারী তালিকা</CardTitle>
          <CardDescription>
            অ্যাডমিন, মেন্টর, মার্কেটিং এবং সাপোর্ট ব্যবহারকারীর বিস্তারিত তালিকা
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              কোন ব্যবহারকারী পাওয়া যায়নি
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All Header */}
              <div className="flex items-center space-x-4 p-4 border-b">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">সব নির্বাচন করুন</span>
              </div>

              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={() => handleSelectUser(user._id)}
                    />
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-orange-600">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      যোগদান: {formatBanglaDate(new Date(user.createdAt))}
                    </p>
                    <p className="text-xs text-gray-500">
                      আপডেট: {formatBanglaDate(new Date(user.updatedAt))}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                পৃষ্ঠা {currentPage} এর {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'ব্যবহারকারী সম্পাদনা' : 'নতুন ব্যবহারকারী'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'ব্যবহারকারীর তথ্য আপডেট করুন' : 'নতুন ব্যবহারকারী তৈরি করুন'}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSuccess={handleUserFormSuccess}
            onCancel={() => {
              setShowUserForm(false);
              setEditingUser(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ব্যবহারকারী বিস্তারিত</DialogTitle>
            <DialogDescription>
              ব্যবহারকারীর সম্পূর্ণ তথ্য দেখুন
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserDetails
              user={selectedUser}
              onEdit={() => {
                setShowUserDetails(false);
                handleEditUser(selectedUser);
              }}
              onClose={() => setShowUserDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
