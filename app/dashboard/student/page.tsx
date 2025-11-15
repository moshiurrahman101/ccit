'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2, BookOpen, Calendar, FileText, MessageSquare, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');
  const [isCheckingApproval, setIsCheckingApproval] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'student' && user.role !== 'admin') {
        // Redirect non-student users to their appropriate dashboard
        switch (user.role) {
          case 'mentor':
            router.push('/dashboard/mentor');
            break;
          default:
            router.push('/dashboard');
            break;
        }
      } else if (user.role === 'student') {
        // Check approval status for students
        checkApprovalStatus();
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const checkApprovalStatus = async () => {
    try {
      setIsCheckingApproval(true);
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.user) {
        setApprovalStatus(data.user.approvalStatus || 'pending');
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  if (loading || isCheckingApproval) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span>শিক্ষার্থী ড্যাশবোর্ড লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (user?.role !== 'student' && user?.role !== 'admin') {
    return null; // Will redirect
  }

  // Show approval status for students
  if (user?.role === 'student' && approvalStatus !== 'approved') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">শিক্ষার্থী ড্যাশবোর্ড</h1>
          <p className="text-gray-600 mt-2">স্বাগতম, {user?.name}!</p>
        </div>

        {/* Approval Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {approvalStatus === 'pending' && (
            <>
              <div className="text-center mb-6">
                <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">অনুমোদনের অপেক্ষায়</h2>
                <p className="text-gray-600">
                  আপনার অ্যাকাউন্ট বর্তমানে প্রশাসকের অনুমোদনের অপেক্ষায় রয়েছে। 
                  অনুমোদন পাওয়ার পর আপনি আপনার ব্যাচ ব্যবস্থাপনা পেজে অ্যাক্সেস পাবেন।
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>দয়া করে অপেক্ষা করুন:</strong> প্রশাসকরা আপনার অ্যাকাউন্ট পর্যালোচনা করছেন। 
                  অনুমোদন পেলে আপনাকে ইমেইলের মাধ্যমে জানানো হবে।
                </p>
              </div>

              {/* Support Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">সহায়তা ও যোগাযোগ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm font-semibold">ই</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">সাপোর্ট ইমেইল</p>
                        <p className="font-medium text-gray-900">creativecanvasit@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm font-semibold">ফ</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">সাপোর্ট ফোন</p>
                        <p className="font-medium text-gray-900">০১৬০৩৭১৮৩৭৯</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 text-sm font-semibold">ট</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">টাইমলাইন</p>
                        <p className="font-medium text-yellow-600">২৪ ঘন্টার মধ্যে অনুমোদন</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">⏰ গুরুত্বপূর্ণ তথ্য</h4>
                <p className="text-orange-800 text-sm">
                  <strong>২৪ ঘন্টার মধ্যে অনুমোদন:</strong> সাধারণত ২৪ ঘন্টার মধ্যে আপনার অ্যাকাউন্ট অনুমোদন করা হয়। 
                  যদি ২৪ ঘন্টার পরেও অনুমোদন না পেয়ে থাকেন, তাহলে আমাদের সাথে যোগাযোগ করুন।
                </p>
              </div>
            </>
          )}

          {approvalStatus === 'rejected' && (
            <>
              <div className="text-center mb-6">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">অনুমোদন প্রত্যাখ্যান</h2>
                <p className="text-gray-600">
                  দুঃখিত, আপনার অ্যাকাউন্ট অনুমোদন করা হয়নি। 
                  আরও তথ্যের জন্য প্রশাসকের সাথে যোগাযোগ করুন।
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  <strong>পরবর্তী পদক্ষেপ:</strong> প্রশাসকের সাথে যোগাযোগ করে আপনার অ্যাকাউন্টের অবস্থা জানুন।
                </p>
              </div>

              {/* Support Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">সহায়তা ও যোগাযোগ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm font-semibold">ই</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">সাপোর্ট ইমেইল</p>
                        <p className="font-medium text-gray-900">creativecanvasit@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm font-semibold">ফ</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">সাপোর্ট ফোন</p>
                        <p className="font-medium text-gray-900">০১৬০৩৭১৮৩৭৯</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 text-sm font-semibold">আ</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">অ্যাকাউন্ট স্ট্যাটাস</p>
                        <p className="font-medium text-red-600">প্রত্যাখ্যান</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Information */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">সহায়তা প্রয়োজন?</h4>
                <p className="text-blue-800 text-sm">
                  যদি আপনার অ্যাকাউন্ট সম্পর্কে কোন প্রশ্ন থাকে বা পুনরায় আবেদন করতে চান, 
                  তাহলে আমাদের সাথে যোগাযোগ করুন। আমরা আপনার সমস্যা সমাধানে সাহায্য করব।
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">শিক্ষার্থী ড্যাশবোর্ড</h1>
        <p className="text-gray-600 mt-2">স্বাগতম, {user?.name}! আপনার শিক্ষার যাত্রা অব্যাহত রাখুন</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">আমার কোর্স</h3>
              <p className="text-gray-600">নিবন্ধিত কোর্স দেখুন</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">সময়সূচী</h3>
              <p className="text-gray-600">আসন্ন ক্লাসসমূহ</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">অ্যাসাইনমেন্ট</h3>
              <p className="text-gray-600">অ্যাসাইনমেন্ট দেখুন</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">আলোচনা</h3>
              <p className="text-gray-600">ক্লাস আলোচনা</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">দ্রুত কাজ</h3>
          <div className="space-y-3">
            <Link href="/dashboard/student/batches">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <div className="font-medium">আমার ব্যাচ</div>
                    <div className="text-sm text-gray-600">আপনার নিবন্ধিত কোর্স দেখুন</div>
                  </div>
                </div>
              </button>
            </Link>
            
            <Link href="/dashboard/student/enrollment">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium">নতুন কোর্সে এনরোল</div>
                    <div className="text-sm text-gray-600">কোর্স ব্রাউজ করুন ও এনরোল করুন</div>
                  </div>
                </div>
              </button>
            </Link>
            
            <Link href="/dashboard/student/payment">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium">পেমেন্ট জমা দিন</div>
                    <div className="text-sm text-gray-600">নতুন পেমেন্ট জমা দিন ও ট্র্যাক করুন</div>
                  </div>
                </div>
              </button>
            </Link>
            
            <Link href="/dashboard/student/accounts">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium">আমার অ্যাকাউন্ট</div>
                    <div className="text-sm text-gray-600">পেমেন্ট ও বিলিং ব্যবস্থাপনা</div>
                  </div>
                </div>
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">সাম্প্রতিক কার্যক্রম</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <div className="font-medium">কোন সাম্প্রতিক কার্যক্রম নেই</div>
              <div>আপনার সাম্প্রতিক শিক্ষার কার্যক্রম এখানে দেখা যাবে</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
