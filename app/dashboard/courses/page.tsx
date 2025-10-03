'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, Users, Calendar, CheckCircle, Clock, Trash2, Plus } from 'lucide-react';
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

interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline' | 'both';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  mentors: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
  }[];
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  maxStudents: number;
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  category: 'web-development' | 'data-science' | 'mobile-development' | 'design' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'bengali' | 'english';
  courseCode: string;
  courseShortcut: string;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    level: ''
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    course: Course | null;
  }>({
    isOpen: false,
    course: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (page = 1, search = '', status = '', category = '', level = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status }),
        ...(category && { category }),
        ...(level && { level })
      });

      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch(`/api/courses?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses);
        setPagination(data.pagination);
      } else {
        if (response.status === 401) {
          toast.error('সেশন শেষ হয়ে গেছে। আবার লগইন করুন');
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        } else {
          toast.error(data.error || 'কোর্সের তথ্য লোড করতে সমস্যা হয়েছে');
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (course: Course) => {
    setDeleteDialog({
      isOpen: true,
      course
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.course) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch(`/api/courses/${deleteDialog.course._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('কোর্স সফলভাবে মুছে ফেলা হয়েছে');
        setDeleteDialog({ isOpen: false, course: null });
        fetchCourses(pagination.currentPage, filters.search, filters.status, filters.category, filters.level);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'কোর্স মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, course: null });
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    fetchCourses(1, search, filters.status, filters.category, filters.level);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchCourses(1, newFilters.search, newFilters.status, newFilters.category, newFilters.level);
  };

  const handlePageChange = (page: number) => {
    fetchCourses(page, filters.search, filters.status, filters.category, filters.level);
  };

  const getStatusCounts = () => {
    const draft = courses.filter(c => c.status === 'draft').length;
    const published = courses.filter(c => c.status === 'published').length;
    const archived = courses.filter(c => c.status === 'archived').length;
    const active = courses.filter(c => c.isActive).length;
    return { draft, published, archived, active, total: courses.length };
  };

  const getCategoryText = (category: string) => {
    const categories = {
      'web-development': 'ওয়েব ডেভেলপমেন্ট',
      'data-science': 'ডেটা সায়েন্স',
      'mobile-development': 'মোবাইল ডেভেলপমেন্ট',
      'design': 'ডিজাইন',
      'marketing': 'মার্কেটিং',
      'other': 'অন্যান্য'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getLevelText = (level: string) => {
    const levels = {
      'beginner': 'শুরু',
      'intermediate': 'মধ্যম',
      'advanced': 'উন্নত'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const statusCounts = getStatusCounts();

  if (isLoading && courses.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">কোর্স ব্যবস্থাপনা</h1>
          <p className="text-gray-600">সকল কোর্সের তথ্য দেখুন এবং পরিচালনা করুন</p>
        </div>
        <AdminOnly>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/batches/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন ব্যাচ
            </Link>
            <Link
              href="/dashboard/courses/new"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন কোর্স
            </Link>
          </div>
        </AdminOnly>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">খসড়া</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">প্রকাশিত</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয়</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">সব কোর্স</h2>
              <p className="text-sm text-gray-600">আপনার কোর্সগুলো পরিচালনা এবং পর্যবেক্ষণ করুন</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="কোর্স খুঁজুন..."
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
                <option value="archived">আর্কাইভ</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => handleFilter('category', e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">সব ক্যাটাগরি</option>
                <option value="web-development">ওয়েব ডেভেলপমেন্ট</option>
                <option value="data-science">ডেটা সায়েন্স</option>
                <option value="mobile-development">মোবাইল ডেভেলপমেন্ট</option>
                <option value="design">ডিজাইন</option>
                <option value="marketing">মার্কেটিং</option>
                <option value="other">অন্যান্য</option>
              </select>
              <select
                value={filters.level}
                onChange={(e) => handleFilter('level', e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">সব লেভেল</option>
                <option value="beginner">শুরু</option>
                <option value="intermediate">মধ্যম</option>
                <option value="advanced">উন্নত</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কোর্স</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মেন্টর</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ক্যাটাগরি</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মূল্য</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ধারণক্ষমতা</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কর্ম</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    কোনো কোর্স পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {course.coverPhoto ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={course.coverPhoto}
                          alt={course.title}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-orange-600" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500">{course.courseCode} - {course.courseShortcut}</div>
                        <div className="text-xs text-gray-500">{getLevelText(course.level)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {course.mentors.slice(0, 2).map((mentor, index) => (
                        <div key={mentor._id} className="flex items-center">
                          {mentor.avatar ? (
                            <img
                              className="h-6 w-6 rounded-full"
                              src={mentor.avatar}
                              alt={mentor.name}
                            />
                          ) : (
                            <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{mentor.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                          </div>
                        </div>
                      ))}
                      {course.mentors.length > 2 && (
                        <div className="text-xs text-gray-500">+{course.mentors.length - 2} আরো</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryText(course.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">৳{course.regularPrice.toLocaleString()}</div>
                      {course.discountPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          ৳{course.discountPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      {course.maxStudents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'published' ? 'bg-green-100 text-green-800' :
                      course.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status === 'published' ? 'প্রকাশিত' :
                       course.status === 'archived' ? 'আর্কাইভ' : 'খসড়া'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/courses/${course._id}/edit`}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        সম্পাদনা
                      </Link>
                      <Link
                        href={`/dashboard/batches/new?courseId=${course._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ব্যাচ তৈরি
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(course)}
                        className="inline-flex items-center justify-center px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded border border-red-600 hover:border-red-700 transition-colors"
                        title="Delete course"
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
                {((pagination.currentPage - 1) * 10) + 1} থেকে {Math.min(pagination.currentPage * 10, pagination.totalCourses)} দেখানো হচ্ছে, মোট {pagination.totalCourses} টি ফলাফল
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
          setDeleteDialog({ isOpen: false, course: null });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>কোর্স মুছে ফেলুন</AlertDialogTitle>
            <AlertDialogDescription>
              আপনি কি নিশ্চিত যে আপনি <strong>&quot;{deleteDialog.course?.title}&quot;</strong> কোর্সটি মুছে ফেলতে চান? 
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
