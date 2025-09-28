'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Loader2 } from 'lucide-react';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      setIsInitialized(true);
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            ড্যাশবোর্ড লোড হচ্ছে...
          </h1>
          <p className="text-gray-600">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            অ্যাক্সেস ডিনাইড
          </h1>
          <p className="text-gray-600">
            অনুগ্রহ করে লগইন করুন
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <DashboardLayout user={user}>
        {children}
      </DashboardLayout>
    </div>
  );
}