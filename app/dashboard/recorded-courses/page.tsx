'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, Plus, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { AdminOnly } from '@/components/dashboard/RoleGuard';
import { toast } from 'sonner';
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

interface RecordedCourse {
  _id: string;
  title: string;
  description: string;
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  videos: Array<{
    title: string;
    youtubeVideoId: string;
    order: number;
    isPreview: boolean;
  }>;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  createdAt: string;
}

export default function RecordedCoursesPage() {
  const [courses, setCourses] = useState<RecordedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    course: RecordedCourse | null;
  }>({
    isOpen: false,
    course: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch('/api/recorded-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        console.error('API Error:', data);
        if (response.status === 401) {
          toast.error('সেশন শেষ হয়ে গেছে। আবার লগইন করুন');
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        } else {
          toast.error(data.error || 'কোর্সের তথ্য লোড করতে সমস্যা হয়েছে');
          // Still try to set empty array to show the empty state
          setCourses([]);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('নেটওয়ার্ক সমস্যা');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (course: RecordedCourse) => {
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

      const response = await fetch(`/api/recorded-courses/${deleteDialog.course._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('কোর্স সফলভাবে মুছে ফেলা হয়েছে');
        setDeleteDialog({ isOpen: false, course: null });
        fetchCourses();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">রেকর্ড করা কোর্স</h1>
          <p className="text-gray-600">ইউটিউব ভিডিও সহ প্রাক-রেকর্ড করা কোর্স ব্যবস্থাপনা</p>
        </div>
        <AdminOnly>
          <Link
            href="/dashboard/recorded-courses/new"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            নতুন রেকর্ড করা কোর্স
          </Link>
        </AdminOnly>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">কোনো কোর্স নেই</h3>
            <p className="text-gray-600 mb-4">এখনই আপনার প্রথম রেকর্ড করা কোর্স তৈরি করুন</p>
            <AdminOnly>
              <Link href="/dashboard/recorded-courses/new">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন কোর্স তৈরি করুন
                </Button>
              </Link>
            </AdminOnly>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                {course.coverPhoto ? (
                  <img
                    src={course.coverPhoto}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-lg flex items-center justify-center">
                    <Video className="h-16 w-16 text-white" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                    course.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status === 'published' ? 'প্রকাশিত' :
                     course.status === 'archived' ? 'আর্কাইভ' : 'খসড়া'}
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ভিডিও সংখ্যা:</span>
                    <span className="font-semibold">{course.videos.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">মূল্য:</span>
                    <span className="font-semibold">
                      ৳{course.discountPrice || course.regularPrice}
                      {course.discountPrice && (
                        <span className="text-gray-500 line-through ml-2">
                          ৳{course.regularPrice}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Link
                      href={`/dashboard/recorded-courses/${course._id}/edit`}
                      className="flex-1 text-center px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                      সম্পাদনা
                    </Link>
                    <Link
                      href={`/recorded-courses/${course._id}`}
                      className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      দেখুন
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(course)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <AlertDialogCancel onClick={() => setDeleteDialog({ isOpen: false, course: null })} disabled={isDeleting}>
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

