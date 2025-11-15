'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, UserCheck, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatBanglaDate } from '@/lib/utils/banglaNumbers';

interface AttendanceRecord {
  _id: string;
  scheduleId?: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  classDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string | null;
  notes?: string;
  markedAt: string;
}

interface AttendanceStatistics {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

interface StudentAttendanceViewProps {
  batchId: string;
}

export default function StudentAttendanceView({ batchId }: StudentAttendanceViewProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics>({
    totalClasses: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchAttendance();
  }, [batchId, startDate, endDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      let url = `/api/student/batches/${batchId}/attendance`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const data = await response.json();
      setAttendance(data.attendance || []);
      setStatistics(data.statistics || {
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendancePercentage: 0
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'excused':
        return <UserCheck className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold">{statistics.attendancePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold">{statistics.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold">{statistics.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Late / Excused</p>
                <p className="text-2xl font-bold">{statistics.late + statistics.excused}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No attendance records found</p>
              <p className="text-sm">Your attendance will appear here once marked by your mentor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.map(record => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">
                          {record.scheduleId ? record.scheduleId.title : 'General Class'}
                        </p>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatBanglaDate(record.classDate)}
                        </div>
                        {record.scheduleId && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {record.scheduleId.startTime} - {record.scheduleId.endTime}
                          </div>
                        )}
                        {record.checkInTime && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Checked in: {new Date(record.checkInTime).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">Note: {record.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

