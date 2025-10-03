'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, Users, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusText } from '@/lib/utils/statusDictionary';
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
  courseCode: string;
  courseShortcut: string;
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  mentors: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
  }[];
}

interface Batch {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    courseCode: string;
    courseShortcut: string;
    coverPhoto?: string;
    regularPrice: number;
    discountPrice?: number;
  };
  batchCode: string;
  name: string;
  description?: string;
  courseType: 'online' | 'offline';
  mentorId: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
  };
  additionalMentors: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
  }[];
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
}

export default function CourseBatchesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    batch: Batch | null;
  }>({
    isOpen: false,
    batch: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchBatches();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCourse(data.course);
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
      console.error('Error fetching course:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    }
  };

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch(`/api/batches?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setBatches(data.batches);
      } else {
        if (response.status === 401) {
          toast.error('সেশন শেষ হয়ে গেছে। আবার লগইন করুন');
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        } else {
          toast.error(data.error || 'ব্যাচের তথ্য লোড করতে সমস্যা হয়েছে');
        }
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
        fetchBatches();
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

  const getStatusCounts = () => {
    const draft = batches.filter(b => b.status === 'draft').length;
    const published = batches.filter(b => b.status === 'published').length;
    const upcoming = batches.filter(b => b.status === 'upcoming').length;
    const ongoing = batches.filter(b => b.status === 'ongoing').length;
    const completed = batches.filter(b => b.status === 'completed').length;
    const cancelled = batches.filter(b => b.status === 'cancelled').length;
    const active = batches.filter(b => b.isActive).length;
    return { draft, published, upcoming, ongoing, completed, cancelled, active, total: batches.length };
  };

  const statusCounts = getStatusCounts();

  if (isLoading && !course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">{getStatusText('dashboard_loading')}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">কোর্স পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">{course.courseCode} - {course.courseShortcut}</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/courses/${courseId}/batches/new`)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          নতুন ব্যাচ
        </Button>
      </div>

      {/* Course Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {course.coverPhoto ? (
              <img
                className="h-16 w-24 rounded-lg object-cover"
                src={course.coverPhoto}
                alt={course.title}
              />
            ) : (
              <div className="h-16 w-24 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">C</span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-600 mb-2">{course.courseCode} - {course.courseShortcut}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>মূল্য: ৳{course.regularPrice.toLocaleString()}</span>
                {course.discountPrice && (
                  <span className="text-green-600">ছাড়: ৳{course.discountPrice.toLocaleString()}</span>
                )}
                <span>মেন্টর: {course.mentors.length} জন</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যাচ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">চলমান</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.ongoing}</div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">ব্যাচসমূহ</h2>
              <p className="text-sm text-gray-600">এই কোর্সের সকল ব্যাচ</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ব্যাচ কোড</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মেন্টর</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ধরন</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষার্থী</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">{batch.batchCode}</div>
                      <div className="text-xs text-gray-500">{batch.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {batch.mentorId ? (
                        <>
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
                        </>
                      ) : (
                        <div className="text-sm text-red-600">মেন্টর পাওয়া যায়নি</div>
                      )}
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
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      {batch.currentStudents}/{batch.maxStudents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="text-sm">{new Date(batch.startDate).toLocaleDateString('bn-BD')}</div>
                      <div className="text-xs text-gray-500">থেকে</div>
                      <div className="text-sm">{new Date(batch.endDate).toLocaleDateString('bn-BD')}</div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/batches/${batch._id}/edit`)}
                      >
                        সম্পাদনা
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(batch)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              আপনি কি নিশ্চিত যে আপনি <strong>&quot;{deleteDialog.batch?.batchCode}&quot;</strong> ব্যাচটি মুছে ফেলতে চান? 
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
