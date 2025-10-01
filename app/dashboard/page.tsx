'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import AdminApprovalSystem from '@/components/dashboard/AdminApprovalSystem';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          // Admin stays on main dashboard
          break;
        case 'mentor':
          router.push('/dashboard/mentor');
          break;
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'marketing':
        case 'support':
          // These roles can access main dashboard
          break;
        default:
          router.push('/login');
          break;
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span>ড্যাশবোর্ড লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // This will only show for admin, marketing, and support users
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
        <p className="text-gray-600 mt-2">প্রধান প্রশাসনিক ড্যাশবোর্ডে স্বাগতম</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">সিস্টেম ওভারভিউ</h3>
          <p className="text-gray-600 mt-2">পুরো প্ল্যাটফর্ম ব্যবস্থাপনা</p>
            </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">ব্যবহারকারী ব্যবস্থাপনা</h3>
          <p className="text-gray-600 mt-2">সকল ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা</p>
            </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">কন্টেন্ট ব্যবস্থাপনা</h3>
          <p className="text-gray-600 mt-2">কোর্স ও ব্যাচ ব্যবস্থাপনা</p>
            </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">এনালিটিক্স</h3>
          <p className="text-gray-600 mt-2">প্ল্যাটফর্ম বিশ্লেষণ দেখুন</p>
            </div>
      </div>

      {/* Approval System Section */}
      <div className="bg-white rounded-lg shadow">
        <AdminApprovalSystem />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">দ্রুত কাজ</h3>
          <div className="space-y-3">
            <a href="/dashboard/enrollment" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-semibold">এম</span>
                </div>
                <div>
                  <div className="font-medium">এনরোলমেন্ট ব্যবস্থাপনা</div>
                  <div className="text-sm text-gray-600">শিক্ষার্থী এনরোলমেন্ট পর্যালোচনা ও অনুমোদন</div>
                </div>
              </div>
            </a>
            
            <a href="/dashboard/batches" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">কো</span>
                </div>
                <div>
                  <div className="font-medium">কোর্স ব্যবস্থাপনা</div>
                  <div className="text-sm text-gray-600">কোর্স ও ব্যাচ ব্যবস্থাপনা</div>
                </div>
              </div>
            </a>
            
            <a href="/dashboard/payments" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold">পে</span>
                </div>
                <div>
                  <div className="font-medium">পেমেন্ট ব্যবস্থাপনা</div>
                  <div className="text-sm text-gray-600">পেমেন্ট যাচাই ও অনুমোদন</div>
                </div>
              </div>
            </a>
          </div>
      </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">সাম্প্রতিক কার্যক্রম</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <div className="font-medium">কোন সাম্প্রতিক কার্যক্রম নেই</div>
              <div>সিস্টেম কার্যক্রম এখানে দেখা যাবে</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}