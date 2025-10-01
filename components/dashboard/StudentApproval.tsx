'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PendingStudent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  approvalStatus: string;
}

export default function StudentApproval() {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/student-approvals');
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error('Failed to fetch pending students');
      }
    } catch (error) {
      console.error('Error fetching pending students:', error);
      toast.error('Failed to fetch pending students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (userId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      setProcessingId(userId);
      
      const response = await fetch('/api/admin/student-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          rejectionReason
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Student ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        // Remove the student from the list
        setStudents(students.filter(student => student._id !== userId));
      } else {
        toast.error(data.message || `Failed to ${action} student`);
      }
    } catch (error) {
      console.error(`Error ${action}ing student:`, error);
      toast.error(`Failed to ${action} student`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (userId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason !== null) {
      handleApproval(userId, 'reject', reason);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Student Approvals</h2>
        <button
          onClick={fetchPendingStudents}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No pending student approvals</div>
          <p className="text-gray-400 mt-2">All students have been processed</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.phone || 'No phone provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleApproval(student._id, 'approve')}
                        disabled={processingId === student._id}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === student._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(student._id)}
                        disabled={processingId === student._id}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
