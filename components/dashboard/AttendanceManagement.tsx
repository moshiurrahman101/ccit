'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, XCircle, Clock, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatBanglaDate } from '@/lib/utils/banglaNumbers';
import { useRouter } from 'next/navigation';

interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  scheduleId?: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  classDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface AttendanceManagementProps {
  batchId: string;
  batchName: string;
}

export default function AttendanceManagement({ batchId, batchName }: AttendanceManagementProps) {
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [batchId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/mentor/batches/${batchId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      setAttendanceRecords(data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSuccess = () => {
    fetchAttendanceData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'excused':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Take Attendance Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <p className="text-gray-600 mt-1">Mark and view student attendance for this batch</p>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/mentor/attendance?batchId=${batchId}`)}
          className="bg-orange-600 hover:bg-orange-700"
          size="lg"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Take Attendance
        </Button>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No attendance records yet</p>
              <p className="text-sm">Click "Take Attendance" to mark attendance for students</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceRecords
                .filter(record => record.student !== null && record.student !== undefined)
                .map(record => {
                  const student = record.student!; // Safe after filter
                  
                  return (
                    <div
                      key={record._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name || 'Student'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold">
                              {(student.name || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{student.name || 'Unknown Student'}</p>
                          <p className="text-sm text-gray-500">
                            {record.scheduleId ? record.scheduleId.title : 'General'} - {formatBanglaDate(record.classDate)}
                          </p>
                          {record.notes && (
                            <p className="text-sm text-gray-400 mt-1">{record.notes}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
