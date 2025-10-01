'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function DebugUpdateEnrollmentPage() {
  const [studentId, setStudentId] = useState('68da85325d8c3b1cb6170a8d');
  const [batchId, setBatchId] = useState('68ceda1b24d6e204a4d297b9');
  const [status, setStatus] = useState('approved');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [loading, setLoading] = useState(false);

  const updateEnrollmentStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/update-enrollment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          batchId,
          status,
          paymentStatus
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Enrollment updated successfully! Status: ${data.enrollment.status}`);
        console.log('Updated enrollment:', data.enrollment);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Failed to update enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Update Enrollment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch ID
            </label>
            <Input
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Batch ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={updateEnrollmentStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Updating...' : 'Update Enrollment Status'}
          </Button>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Quick Actions:</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatus('approved');
                  setPaymentStatus('paid');
                }}
                className="mr-2"
              >
                Approve & Mark Paid
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatus('pending');
                  setPaymentStatus('pending');
                }}
              >
                Reset to Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
