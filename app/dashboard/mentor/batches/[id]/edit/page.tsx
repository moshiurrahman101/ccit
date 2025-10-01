'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import MentorBatchForm from '@/components/dashboard/MentorBatchForm';

interface Batch {
  _id: string;
  name: string;
  description: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  mentorId: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
    experience: number;
    expertise: string[];
  } | null;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  modules: {
    title: string;
    description: string;
    duration: number;
    order: number;
  }[];
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditMentorBatchPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const batchId = params.id as string;

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        if (!token) {
          toast.error('Authentication required');
          router.push('/dashboard/mentor/batches');
          return;
        }

        const response = await fetch(`/api/mentor/batches/${batchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            toast.error('Access denied. You can only edit your own batches.');
          } else if (response.status === 404) {
            toast.error('Batch not found');
          } else {
            toast.error('Failed to fetch batch');
          }
          router.push('/dashboard/mentor/batches');
          return;
        }

        const data = await response.json();
        setBatch(data.batch);
        setIsFormOpen(true);
      } catch (error) {
        console.error('Error fetching batch:', error);
        toast.error('Failed to fetch batch');
        router.push('/dashboard/mentor/batches');
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      fetchBatch();
    }
  }, [batchId, router]);

  const handleSuccess = () => {
    toast.success('Batch updated successfully!');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading batch...</span>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch Not Found</h2>
          <p className="text-gray-600 mb-4">The batch you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard/mentor/batches">
            <Button>Back to Batches</Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Batch</h1>
          <p className="text-gray-600">Update your batch information</p>
        </div>
      </div>

      {/* Batch Form */}
      <Card>
        <CardContent className="pt-6">
          <MentorBatchForm
            batch={batch as any}
            isOpen={isFormOpen}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
