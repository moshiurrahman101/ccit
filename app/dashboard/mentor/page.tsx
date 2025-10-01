'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Clock,
  MapPin,
  Video,
  Link as LinkIcon,
  Plus,
  ArrowRight,
  User,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatBanglaNumber, formatBanglaDate, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';

interface Batch {
  _id: string;
  name: string;
  description: string;
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  currentStudents: number;
  maxStudents: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended';
  batch: {
    _id: string;
    name: string;
  };
}

interface Schedule {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  location?: string;
  isOnline: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  batchId: {
    _id: string;
    name: string;
  };
}

interface DashboardStats {
  totalBatches: number;
  totalStudents: number;
  upcomingClasses: number;
  totalRevenue: number;
}

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    totalStudents: 0,
    upcomingClasses: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Fetch batches
      const batchesResponse = await fetch('/api/mentor/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (batchesResponse.ok) {
        const batchesData = await batchesResponse.json();
        setBatches(batchesData.batches || []);
      }

      // Fetch all students from all batches
      const allStudents: Student[] = [];
      for (const batch of batches) {
        try {
          const studentsResponse = await fetch(`/api/mentor/batches/${batch._id}/students`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            const batchStudents = (studentsData.students || []).map((student: any) => ({
              ...student,
              batch: { _id: batch._id, name: batch.name }
            }));
            allStudents.push(...batchStudents);
          }
        } catch (error) {
          console.error(`Error fetching students for batch ${batch._id}:`, error);
        }
      }
      setStudents(allStudents);

      // Fetch upcoming schedules
      const upcomingSchedules: Schedule[] = [];
      for (const batch of batches) {
        try {
          const schedulesResponse = await fetch(`/api/mentor/batches/${batch._id}/schedule`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (schedulesResponse.ok) {
            const schedulesData = await schedulesResponse.json();
            const batchSchedules = (schedulesData.schedules || []).map((schedule: any) => ({
              ...schedule,
              batchId: { _id: batch._id, name: batch.name }
            }));
            upcomingSchedules.push(...batchSchedules);
          }
        } catch (error) {
          console.error(`Error fetching schedules for batch ${batch._id}:`, error);
        }
      }

      // Filter upcoming schedules (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = upcomingSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= today && scheduleDate <= nextWeek && schedule.status === 'scheduled';
      });
      setSchedules(upcoming);

      // Calculate stats
      const totalStudents = allStudents.length;
      const upcomingClasses = upcoming.length;
      const totalRevenue = batches.reduce((sum, batch) => sum + (batch.currentStudents * (batch.discountPrice || batch.regularPrice)), 0);

      setStats({
        totalBatches: batches.length,
        totalStudents,
        upcomingClasses,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your batches and students.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.totalBatches)}</div>
            <p className="text-xs text-gray-600">Active batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.totalStudents)}</div>
            <p className="text-xs text-gray-600">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaNumber(stats.upcomingClasses)}</div>
            <p className="text-xs text-gray-600">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBanglaCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-600">From all batches</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Classes</CardTitle>
              <Link href="/dashboard/mentor/batches">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.length > 0 ? (
                schedules.slice(0, 5).map((schedule) => (
                  <div key={schedule._id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{schedule.title}</h4>
                      <p className="text-sm text-gray-600">{schedule.batchId.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatBanglaDate(schedule.date)}
                        </span>
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                        {schedule.isOnline ? (
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                    {schedule.meetingLink && (
                      <a 
                        href={schedule.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No upcoming classes</p>
                  <Link href="/dashboard/mentor/batches">
                    <Button variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule a Class
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Students</CardTitle>
              <Link href="/dashboard/mentor/batches">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.length > 0 ? (
                students.slice(0, 5).map((student) => (
                  <div key={student._id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{student.batch.name}</span>
                        <span>Enrolled: {formatBanglaDate(student.enrollmentDate)}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No students enrolled yet</p>
                  <Link href="/dashboard/mentor/batches">
                    <Button variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Manage Batches
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/mentor/batches">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Batches
              </Button>
            </Link>
            <Link href="/dashboard/mentor/batches">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Classes
              </Button>
            </Link>
            <Link href="/dashboard/mentor/batches">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View Students
              </Button>
            </Link>
            <Link href="/dashboard/mentor/batches">
              <Button className="w-full justify-start" variant="outline">
                <GraduationCap className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}