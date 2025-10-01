'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Enrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  batch: {
    _id: string;
    name: string;
  };
  status: string;
  paymentStatus: string;
  enrollmentDate: string;
  approvedAt?: string;
}

export default function DebugEnrollmentStatusPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/fix-enrollment-status');
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      } else {
        toast.error('Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, studentId: string, batchId: string, newStatus: string) => {
    try {
      setUpdating(enrollmentId);
      const response = await fetch('/api/debug/fix-enrollment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          batchId,
          status: newStatus
        })
      });

      if (response.ok) {
        await fetchEnrollments();
        toast.success(`Enrollment status updated to ${newStatus}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Failed to update enrollment');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          <span>Loading enrollments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Debug Enrollment Status</h1>
        <p className="text-gray-600 mt-2">Manually update enrollment status for testing</p>
      </div>

      <div className="grid gap-4">
        {enrollments.map((enrollment) => (
          <Card key={enrollment._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {enrollment.student.name}
                  </h3>
                  <p className="text-sm text-gray-600">{enrollment.student.email}</p>
                  <p className="text-sm text-gray-600">{enrollment.batch.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(enrollment.paymentStatus)}>
                      {enrollment.paymentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </p>
                  {enrollment.approvedAt && (
                    <p className="text-xs text-gray-500">
                      Approved: {new Date(enrollment.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => 
                      updateEnrollmentStatus(
                        enrollment._id, 
                        enrollment.student._id, 
                        enrollment.batch._id, 
                        value
                      )
                    }
                    disabled={updating === enrollment._id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {updating === enrollment._id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {enrollments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No enrollments found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
