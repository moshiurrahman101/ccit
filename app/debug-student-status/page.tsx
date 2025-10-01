'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DebugStudentStatusPage() {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStudentStatus();
  }, []);

  const checkStudentStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/test-payment-approval?studentId=68da85325d8c3b1cb6170a8d&batchId=68ceda1b24d6e204a4d297b9');
      if (response.ok) {
        const data = await response.json();
        setStudentData(data.debug);
      }
    } catch (error) {
      console.error('Error checking student status:', error);
      toast.error('Failed to check student status');
    } finally {
      setLoading(false);
    }
  };

  const approveStudent = async () => {
    try {
      const response = await fetch('/api/debug/test-payment-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: '68da85325d8c3b1cb6170a8d',
          batchId: '68ceda1b24d6e204a4d297b9',
          action: 'approve_student'
        })
      });

      if (response.ok) {
        toast.success('Student approved successfully!');
        checkStudentStatus();
      } else {
        toast.error('Failed to approve student');
      }
    } catch (error) {
      console.error('Error approving student:', error);
      toast.error('Failed to approve student');
    }
  };

  const verifyPayment = async () => {
    try {
      const response = await fetch('/api/debug/test-payment-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: '68da85325d8c3b1cb6170a8d',
          batchId: '68ceda1b24d6e204a4d297b9',
          action: 'verify_payment'
        })
      });

      if (response.ok) {
        toast.success('Payment verified successfully!');
        checkStudentStatus();
      } else {
        toast.error('Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const resetAll = async () => {
    try {
      const response = await fetch('/api/debug/test-payment-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: '68da85325d8c3b1cb6170a8d',
          batchId: '68ceda1b24d6e204a4d297b9',
          action: 'reset_all'
        })
      });

      if (response.ok) {
        toast.success('Status reset successfully!');
        checkStudentStatus();
      } else {
        toast.error('Failed to reset status');
      }
    } catch (error) {
      console.error('Error resetting status:', error);
      toast.error('Failed to reset status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Status Debug</CardTitle>
          <p className="text-gray-600">Current status of student 68da85325d8c3b1cb6170a8d</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Status */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">User Status</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{studentData?.user?.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{studentData?.user?.email}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Approval Status:</span>
                  <Badge className={`ml-2 ${
                    studentData?.user?.approvalStatus === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {studentData?.user?.approvalStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Enrollment Status */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Enrollment Status</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={`ml-2 ${
                    studentData?.enrollment?.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {studentData?.enrollment?.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <Badge className={`ml-2 ${
                    studentData?.enrollment?.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {studentData?.enrollment?.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="ml-2 font-medium">৳{studentData?.enrollment?.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payments</h3>
            {studentData?.payments?.length > 0 ? (
              <div className="space-y-2">
                {studentData.payments.map((payment: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">৳{payment.amount}</span>
                        <span className="ml-2 text-sm text-gray-600">({payment.method})</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={
                          payment.status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {payment.status}
                        </Badge>
                        <Badge className={
                          payment.verificationStatus === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {payment.verificationStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No payments found</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button onClick={approveStudent} className="bg-green-600 hover:bg-green-700">
              Approve Student
            </Button>
            <Button onClick={verifyPayment} className="bg-blue-600 hover:bg-blue-700">
              Verify Payment
            </Button>
            <Button onClick={resetAll} variant="outline">
              Reset All
            </Button>
            <Button onClick={checkStudentStatus} variant="outline">
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
