'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, CheckCircle, XCircle, Save, Loader2, Users, ArrowLeft, Clock, UserCheck, List } from 'lucide-react';
import { toast } from 'sonner';
import { formatBanglaDate } from '@/lib/utils/banglaNumbers';

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}


interface Batch {
  _id: string;
  name: string;
  courseType: string;
}

interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  scheduleId?: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  classDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export default function MentorAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(searchParams.get('batchId') || '');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDateRecord, setSelectedDateRecord] = useState<{ date: string; scheduleId?: string } | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Record<string, boolean>>({});
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({}); // true = present, false = absent

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchSchedulesAndStudents();
      // Set today's date automatically
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [selectedBatchId]);

  const fetchBatches = async () => {
    try {
      setInitialLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/mentor/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }

      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSchedulesAndStudents = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Find selected batch
      const batch = batches.find(b => b._id === selectedBatchId);
      if (batch) {
        setSelectedBatch(batch);
      }

      // Fetch schedules and students from attendance API
      const response = await fetch(`/api/mentor/batches/${selectedBatchId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setStudents(data.students || []);
      setAttendanceRecords(data.attendance || []);

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
    if (!selectedBatchId) {
      toast.error('Please select a batch');
      return;
    }

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

      const response = await fetch(`/api/mentor/batches/${selectedBatchId}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classDate: selectedDate,
          attendance
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to mark attendance');
      }

      toast.success('Attendance marked successfully');
      
      // Refresh attendance records
      await fetchSchedulesAndStudents();
      
      // Switch to history view
      setShowHistory(true);
      
      // Reset form
      const resetData: Record<string, boolean> = {};
      students.forEach(student => {
        resetData[student._id] = true;
      });
      setAttendanceData(resetData);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceData).filter(v => v === true).length;
  const absentCount = students.length - presentCount;

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

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Mark and view student attendance for your batches</p>
        </div>
        {selectedBatchId && (
          <div className="flex gap-2">
            <Button
              variant={!showHistory ? "default" : "outline"}
              onClick={() => setShowHistory(false)}
              className={!showHistory ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Take Attendance
            </Button>
            <Button
              variant={showHistory ? "default" : "outline"}
              onClick={() => setShowHistory(true)}
              className={showHistory ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <List className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        )}
      </div>

      {/* Batch Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Batch <span className="text-red-500">*</span></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Batch</Label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a batch (required)" />
              </SelectTrigger>
              <SelectContent>
                {batches.map(batch => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedBatchId && (
              <p className="text-sm text-red-500">Batch selection is required to take attendance</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedBatchId && !showHistory && (
        <>
          {/* Batch Info */}
          {selectedBatch && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Batch</p>
              <p className="font-semibold text-lg">{selectedBatch.name}</p>
            </div>
          )}

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Class Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Allow past dates, but not future dates
                />
                <p className="text-sm text-gray-500">Select the date for which you want to mark attendance. Previous dates are allowed.</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Quick Actions:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll(true)}
                    disabled={loading || students.length === 0}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll(false)}
                    disabled={loading || students.length === 0}
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
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No students enrolled in this batch</p>
                  <p className="text-sm">Students will appear here once they enroll in this batch</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-4">
                  {students.map(student => (
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={saving || students.length === 0 || !selectedBatchId}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving Attendance...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Submit Attendance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Attendance History */}
      {selectedBatchId && showHistory && (
        <>
          {/* Batch Info */}
          {selectedBatch && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Batch</p>
              <p className="font-semibold text-lg">{selectedBatch.name}</p>
            </div>
          )}

          {!selectedDateRecord ? (
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
                  <div className="space-y-3">
                    {(() => {
                      // Group attendance by date and schedule
                      const groupedByDate: Record<string, {
                        date: string;
                        scheduleId?: string;
                        scheduleTitle?: string;
                        records: AttendanceRecord[];
                        present: number;
                        absent: number;
                        late: number;
                        excused: number;
                      }> = {};

                      attendanceRecords.forEach(record => {
                        const dateKey = record.classDate;
                        const scheduleKey = record.scheduleId?._id || 'general';
                        const key = `${dateKey}-${scheduleKey}`;

                        if (!groupedByDate[key]) {
                          groupedByDate[key] = {
                            date: record.classDate,
                            scheduleId: record.scheduleId?._id,
                            scheduleTitle: record.scheduleId?.title,
                            records: [],
                            present: 0,
                            absent: 0,
                            late: 0,
                            excused: 0
                          };
                        }

                        groupedByDate[key].records.push(record);
                        if (record.status === 'present') groupedByDate[key].present++;
                        else if (record.status === 'absent') groupedByDate[key].absent++;
                        else if (record.status === 'late') groupedByDate[key].late++;
                        else if (record.status === 'excused') groupedByDate[key].excused++;
                      });

                      return Object.values(groupedByDate)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((group, index) => (
                          <Card
                            key={index}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setSelectedDateRecord({
                                date: group.date,
                                scheduleId: group.scheduleId
                              });
                              // Initialize editing attendance data
                              const editData: Record<string, boolean> = {};
                              group.records.forEach(record => {
                                editData[record.student._id] = record.status === 'present' || record.status === 'late';
                              });
                              setEditingAttendance(editData);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                    <div>
                                      <p className="font-semibold text-lg">
                                        {formatBanglaDate(group.date)}
                                      </p>
                                      {group.scheduleTitle && (
                                        <p className="text-sm text-gray-600">{group.scheduleTitle}</p>
                                      )}
                                      {!group.scheduleTitle && (
                                        <p className="text-sm text-gray-600">General Class</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-600">
                                      <CheckCircle className="h-4 w-4 inline mr-1" />
                                      Present: {group.present}
                                    </span>
                                    <span className="text-red-600">
                                      <XCircle className="h-4 w-4 inline mr-1" />
                                      Absent: {group.absent}
                                    </span>
                                    {group.late > 0 && (
                                      <span className="text-yellow-600">
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        Late: {group.late}
                                      </span>
                                    )}
                                    {group.excused > 0 && (
                                      <span className="text-blue-600">
                                        <UserCheck className="h-4 w-4 inline mr-1" />
                                        Excused: {group.excused}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500 mb-1">Total Students</p>
                                  <p className="text-2xl font-bold">{group.records.length}</p>
                                  <p className="text-xs text-gray-400 mt-1">Click to edit</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Edit Attendance - {formatBanglaDate(selectedDateRecord.date)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {attendanceRecords.find(r => r.classDate === selectedDateRecord.date && 
                        (selectedDateRecord.scheduleId ? r.scheduleId?._id === selectedDateRecord.scheduleId : !r.scheduleId))?.scheduleId?.title || 'General Class'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDateRecord(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dateRecords = attendanceRecords.filter(r => 
                    r.classDate === selectedDateRecord.date &&
                    (selectedDateRecord.scheduleId 
                      ? r.scheduleId?._id === selectedDateRecord.scheduleId 
                      : !r.scheduleId)
                  );

                  if (dateRecords.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <p>No attendance records found for this date</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-700">
                            Quick Actions:
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newData: Record<string, boolean> = {};
                              dateRecords.forEach(record => {
                                newData[record.student._id] = true;
                              });
                              setEditingAttendance(newData);
                            }}
                          >
                            Mark All Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newData: Record<string, boolean> = {};
                              dateRecords.forEach(record => {
                                newData[record.student._id] = false;
                              });
                              setEditingAttendance(newData);
                            }}
                          >
                            Mark All Absent
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600 font-medium">
                            Present: {Object.values(editingAttendance).filter(v => v === true).length}
                          </span>
                          <span className="text-red-600 font-medium">
                            Absent: {Object.values(editingAttendance).filter(v => v === false).length}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-4">
                        {dateRecords.map(record => (
                          <Card key={record._id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {record.student.avatar ? (
                                  <img
                                    src={record.student.avatar}
                                    alt={record.student.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-semibold">
                                      {record.student.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{record.student.name}</p>
                                  <p className="text-sm text-gray-500">{record.student.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${editingAttendance[record.student._id] ? 'text-green-600' : 'text-red-600'}`}>
                                    {editingAttendance[record.student._id] ? 'Present' : 'Absent'}
                                  </span>
                                  <Switch
                                    checked={editingAttendance[record.student._id] ?? (record.status === 'present' || record.status === 'late')}
                                    onCheckedChange={(checked) => {
                                      setEditingAttendance(prev => ({
                                        ...prev,
                                        [record.student._id]: checked
                                      }));
                                    }}
                                  />
                                </div>
                                {editingAttendance[record.student._id] ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <Button
                        onClick={async () => {
                          try {
                            setSaving(true);
                            const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
                            if (!token) {
                              toast.error('Authentication required');
                              return;
                            }

                            const attendance = dateRecords.map(record => ({
                              studentId: record.student._id,
                              status: editingAttendance[record.student._id] ? 'present' : 'absent',
                              notes: record.notes || ''
                            }));

                            const response = await fetch(`/api/mentor/batches/${selectedBatchId}/attendance`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                classDate: selectedDateRecord.date,
                                attendance
                              })
                            });

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({}));
                              throw new Error(errorData.error || 'Failed to update attendance');
                            }

                            toast.success('Attendance updated successfully');
                            await fetchSchedulesAndStudents();
                            setSelectedDateRecord(null);
                          } catch (error) {
                            console.error('Error updating attendance:', error);
                            toast.error(error instanceof Error ? error.message : 'Failed to update attendance');
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        size="lg"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Updating Attendance...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Update Attendance
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

