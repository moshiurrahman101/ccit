'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar, CheckCircle, XCircle, Save, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatBanglaDate } from '@/lib/utils/banglaNumbers';

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Schedule {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface TakeAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
  batchName: string;
}

export default function TakeAttendanceDialog({
  isOpen,
  onClose,
  onSuccess,
  batchId,
  batchName
}: TakeAttendanceDialogProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedSchedule, setSelectedSchedule] = useState<string>('none');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({}); // true = present, false = absent

  useEffect(() => {
    if (isOpen) {
      fetchSchedulesAndStudents();
      // Set today's date automatically
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedSchedule('none');
    }
  }, [isOpen, batchId]);

  const fetchSchedulesAndStudents = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Fetch schedules and students from attendance API
      const response = await fetch(`/api/mentor/batches/${batchId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setSchedules(data.schedules || []);
      setStudents(data.students || []);

      // Initialize all students as present by default
      const initialData: Record<string, boolean> = {};
      data.students?.forEach((student: Student) => {
        initialData[student._id] = true; // Default to present
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load schedules and students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleMarkAll = (present: boolean) => {
    const newData: Record<string, boolean> = {};
    students.forEach(student => {
      newData[student._id] = present;
    });
    setAttendanceData(newData);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Convert attendance data to API format
      const attendance = students.map(student => ({
        studentId: student._id,
        status: attendanceData[student._id] ? 'present' : 'absent',
        notes: ''
      }));

      const response = await fetch(`/api/mentor/batches/${batchId}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduleId: selectedSchedule && selectedSchedule !== 'none' ? selectedSchedule : undefined,
          classDate: selectedDate,
          attendance
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to mark attendance');
      }

      toast.success('Attendance marked successfully');
      onSuccess();
      onClose();
      
      // Reset form
      const resetData: Record<string, boolean> = {};
      students.forEach(student => {
        resetData[student._id] = true;
      });
      setAttendanceData(resetData);
      setSelectedSchedule('none');
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceData).filter(v => v === true).length;
  const absentCount = students.length - presentCount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Take Attendance</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Batch Info */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Batch</p>
              <p className="font-semibold text-lg">{batchName}</p>
            </div>

            {/* Schedule and Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Schedule/Class</Label>
                <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scheduled class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Schedule (General)</SelectItem>
                    {schedules.map(schedule => (
                      <SelectItem key={schedule._id} value={schedule._id}>
                        {schedule.title} - {formatBanglaDate(schedule.date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Quick Actions:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll(true)}
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll(false)}
                >
                  Mark All Absent
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  Present: {presentCount}
                </span>
                <span className="text-red-600 font-medium">
                  Absent: {absentCount}
                </span>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Student Attendance</Label>
              <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-4">
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No students enrolled in this batch</p>
                  </div>
                ) : (
                  students.map(student => (
                    <Card key={student._id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-semibold">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${attendanceData[student._id] ? 'text-green-600' : 'text-red-600'}`}>
                              {attendanceData[student._id] ? 'Present' : 'Absent'}
                            </span>
                            <Switch
                              checked={attendanceData[student._id] ?? true}
                              onCheckedChange={() => handleToggleAttendance(student._id)}
                            />
                          </div>
                          {attendanceData[student._id] ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || students.length === 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit Attendance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

