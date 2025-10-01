'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import MentorBatchForm from '@/components/dashboard/MentorBatchForm';

export default function NewMentorBatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = () => {
    toast.success('Batch created successfully!');
    router.push('/dashboard/mentor/batches');
  };

  const handleClose = () => {
    router.push('/dashboard/mentor/batches');
  };

  if (!user || user.role !== 'mentor') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be a mentor to access this page.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mentor/batches">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Batch</h1>
          <p className="text-gray-600">Create a new batch for your students</p>
        </div>
      </div>

      {/* Batch Form */}
      <Card>
        <CardContent className="pt-6">
          <MentorBatchForm
            batch={null}
            isOpen={isFormOpen}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
