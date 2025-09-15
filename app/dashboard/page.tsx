'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { MentorDashboard } from '@/components/dashboard/MentorDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { MarketingDashboard } from '@/components/dashboard/MarketingDashboard';
import { SupportDashboard } from '@/components/dashboard/SupportDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            অ্যাক্সেস অনুমতি নেই
          </h1>
          <p className="text-gray-600">
            ড্যাশবোর্ড দেখতে লগইন করুন
          </p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'mentor':
        return <MentorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'support':
        return <SupportDashboard />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              অজানা ভূমিকা
            </h1>
            <p className="text-gray-600">
              আপনার ভূমিকার জন্য ড্যাশবোর্ড পাওয়া যায়নি
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
}
