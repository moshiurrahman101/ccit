'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Video, 
  Clock,
  MapPin,
  Link as LinkIcon,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatBanglaNumber, formatBanglaDate, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';
import ScheduleClassForm from '@/components/dashboard/forms/ScheduleClassForm';
import CreateAssignmentForm from '@/components/dashboard/forms/CreateAssignmentForm';
import StartDiscussionForm from '@/components/dashboard/forms/StartDiscussionForm';
import AddStudentForm from '@/components/dashboard/forms/AddStudentForm';
import DeleteConfirmationDialog from '@/components/dashboard/DeleteConfirmationDialog';
import AttendanceManagement from '@/components/dashboard/AttendanceManagement';

interface Batch {
  _id: string;
  name: string;
  description: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  mentorId: {
    _id: string;
    name: string;
    avatar?: string;
    designation: string;
  } | null;
  duration: number;
  durationUnit: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: string;
  marketing: {
    slug: string;
    tags: string[];
  };
}

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface ClassSchedule {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  location?: string;
  isOnline: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  attachments: string[];
  status: 'draft' | 'published' | 'closed';
  submissions: number;
  createdAt: string;
}

interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  replies: number;
  isPinned: boolean;
  createdAt: string;
}

export default function BatchManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const batchId = params.id as string;

  const [batch, setBatch] = useState<Batch | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isDiscussionFormOpen, setIsDiscussionFormOpen] = useState(false);
  const [isAddStudentFormOpen, setIsAddStudentFormOpen] = useState(false);
  
  // Delete dialog states
  const [deleteScheduleDialog, setDeleteScheduleDialog] = useState<{ isOpen: boolean; schedule: ClassSchedule | null }>({ isOpen: false, schedule: null });
  const [deleteAssignmentDialog, setDeleteAssignmentDialog] = useState<{ isOpen: boolean; assignment: Assignment | null }>({ isOpen: false, assignment: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (batchId) {
      fetchBatchData();
    }
  }, [batchId]);

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        router.push('/dashboard/mentor/batches');
        return;
      }

      // Fetch batch details
      const batchResponse = await fetch(`/api/mentor/batches/${batchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!batchResponse.ok) {
        throw new Error('Failed to fetch batch');
      }

      const batchData = await batchResponse.json();
      const batchInfo = batchData.batch;

      // Fetch students
      const studentsResponse = await fetch(`/api/mentor/batches/${batchId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        console.log('=== STUDENTS API RESPONSE ===');
        console.log('Response data:', studentsData);
        console.log('Students array:', studentsData.students);
        console.log('Students count:', studentsData.students?.length);
        const studentsList = studentsData.students || [];
        setStudents(studentsList);
        
        // Update batch with actual students count from the list
        setBatch({
          ...batchInfo,
          currentStudents: studentsList.length
        });
      } else {
        const errorData = await studentsResponse.json().catch(() => ({}));
        console.error('Failed to fetch students:', errorData);
        setStudents([]);
        // Update batch with 0 students if fetch fails
        setBatch({
          ...batchInfo,
          currentStudents: 0
        });
      }

      // Fetch schedules
      const schedulesResponse = await fetch(`/api/mentor/batches/${batchId}/schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData.schedules || []);
      } else {
        // Fallback to mock data if API fails
        setSchedules([
          {
            _id: '1',
            title: 'Introduction to React',
            description: 'Basic concepts and setup',
            date: '2024-02-15',
            startTime: '10:00',
            endTime: '12:00',
            meetingLink: 'https://zoom.us/j/123456789',
            isOnline: true,
            status: 'scheduled',
            createdAt: '2024-02-10'
          }
        ]);
      }

      // Fetch assignments
      const assignmentsResponse = await fetch(`/api/mentor/batches/${batchId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.assignments || []);
      } else {
        // Fallback to empty array if API fails
        setAssignments([]);
      }

      setDiscussions([
        {
          _id: '1',
          title: 'Project Ideas Discussion',
          content: 'Let\'s discuss some interesting project ideas for our final project.',
          author: {
            name: user?.name || 'Mentor',
            role: 'mentor'
          },
          replies: 8,
          isPinned: true,
          createdAt: '2024-02-10'
        }
      ]);

    } catch (error) {
      console.error('Error fetching batch data:', error);
      toast.error('Failed to fetch batch data');
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

  const refreshData = async () => {
    if (batchId) {
      await fetchBatchData();
    }
  };

  const refreshSchedules = async () => {
    try {
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) return;

      const schedulesResponse = await fetch(`/api/mentor/batches/${batchId}/schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData.schedules || []);
      }
    } catch (error) {
      console.error('Error refreshing schedules:', error);
    }
  };

  const refreshAssignments = async () => {
    try {
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) return;

      const assignmentsResponse = await fetch(`/api/mentor/batches/${batchId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.assignments || []);
      }
    } catch (error) {
      console.error('Error refreshing assignments:', error);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteScheduleDialog.schedule) return;

    try {
      setIsDeleting(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/mentor/batches/${batchId}/schedule?scheduleId=${deleteScheduleDialog.schedule._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete schedule');
      }

      toast.success('Schedule deleted successfully');
      setDeleteScheduleDialog({ isOpen: false, schedule: null });
      await refreshSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete schedule');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteAssignmentDialog.assignment) return;

    try {
      setIsDeleting(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/mentor/batches/${batchId}/assignments?assignmentId=${deleteAssignmentDialog.assignment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete assignment');
      }

      toast.success('Assignment deleted successfully');
      setDeleteAssignmentDialog({ isOpen: false, assignment: null });
      await refreshAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          <span>Loading batch details...</span>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{batch.name}</h1>
          <p className="text-gray-600">{batch.description}</p>
        </div>
        <Badge className={getStatusColor(batch.status)}>
          {batch.status}
        </Badge>
      </div>

      {/* Batch Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold">{formatBanglaNumber(students.length)}/{formatBanglaNumber(batch.maxStudents)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold">{formatBanglaNumber(batch.duration)} {batch.durationUnit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-2xl font-bold capitalize">{batch.courseType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold">{formatBanglaCurrency(batch.regularPrice)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-lg">{formatBanglaDate(batch.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-lg">{formatBanglaDate(batch.endDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Course Type</label>
                  <p className="text-lg capitalize">{batch.courseType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {batch.marketing.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsScheduleFormOpen(true)}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Class
                </Button>
                <Button 
                  onClick={() => setIsAssignmentFormOpen(true)}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
                <Button 
                  onClick={() => setIsDiscussionFormOpen(true)}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
                <Button 
                  onClick={() => setActiveTab('students')}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Students
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Enrolled Students</h2>
            <Button onClick={() => setIsAddStudentFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>

          {students.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                <p className="text-gray-600 mb-4">There are no students enrolled in this batch yet.</p>
                <Button onClick={() => setIsAddStudentFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrollment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                              {student.avatar ? (
                                <img 
                                  src={student.avatar} 
                                  alt={student.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-orange-600" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name || 'Unknown Student'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.email || 'No email'}</div>
                            {student.phone && (
                              <div className="text-sm text-gray-500">{student.phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.enrollmentDate ? formatBanglaDate(student.enrollmentDate) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(student.status || 'pending')}>
                              {student.status || 'pending'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <User className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Class Schedule</h2>
            <Button onClick={() => {
              setEditingSchedule(null);
              setIsScheduleFormOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </div>

          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{schedule.title}</h3>
                      <p className="text-gray-600 mt-1">{schedule.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatBanglaDate(schedule.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        {schedule.isOnline ? (
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            Online
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {schedule.location}
                          </div>
                        )}
                      </div>
                      {schedule.meetingLink && (
                        <div className="mt-2">
                          <a 
                            href={schedule.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setIsScheduleFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDeleteScheduleDialog({ isOpen: true, schedule });
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Assignments</h2>
            <Button onClick={() => {
              setEditingAssignment(null);
              setIsAssignmentFormOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{assignment.title}</h3>
                      <p className="text-gray-600 mt-1">{assignment.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {formatBanglaDate(assignment.dueDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {assignment.maxPoints} points
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assignment.submissions} submissions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingAssignment(assignment);
                          setIsAssignmentFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDeleteAssignmentDialog({ isOpen: true, assignment });
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <AttendanceManagement batchId={batch._id} batchName={batch.name} />
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Discussions</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </div>

          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion._id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{discussion.title}</h3>
                        {discussion.isPinned && (
                          <Badge variant="secondary" className="text-xs">Pinned</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{discussion.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {discussion.author.name}</span>
                        <span>{discussion.replies} replies</span>
                        <span>{formatBanglaDate(discussion.createdAt)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Form Components */}
      {batch && (
        <>
          <ScheduleClassForm
            isOpen={isScheduleFormOpen}
            onClose={() => {
              setIsScheduleFormOpen(false);
              setEditingSchedule(null);
            }}
            onSuccess={() => {
              refreshSchedules();
              setEditingSchedule(null);
            }}
            batchId={batch._id}
            courseType={batch.courseType}
            schedule={editingSchedule}
          />
          
          <CreateAssignmentForm
            isOpen={isAssignmentFormOpen}
            onClose={() => {
              setIsAssignmentFormOpen(false);
              setEditingAssignment(null);
            }}
            onSuccess={() => {
              refreshData();
              setEditingAssignment(null);
            }}
            batchId={batch._id}
            assignment={editingAssignment}
          />
          
          <StartDiscussionForm
            isOpen={isDiscussionFormOpen}
            onClose={() => setIsDiscussionFormOpen(false)}
            onSuccess={refreshData}
            batchId={batch._id}
          />
          
          <AddStudentForm
            isOpen={isAddStudentFormOpen}
            onClose={() => setIsAddStudentFormOpen(false)}
            onSuccess={refreshData}
            batchId={batch._id}
          />
        </>
      )}

      {/* Delete Confirmation Dialogs */}
      <DeleteConfirmationDialog
        isOpen={deleteScheduleDialog.isOpen}
        onClose={() => setDeleteScheduleDialog({ isOpen: false, schedule: null })}
        onConfirm={handleDeleteSchedule}
        title="ক্লাস শিডিউল মুছে ফেলুন"
        description="আপনি কি নিশ্চিত যে আপনি এই ক্লাস শিডিউলটি মুছে ফেলতে চান?"
        itemName={deleteScheduleDialog.schedule?.title}
        isLoading={isDeleting}
      />

      <DeleteConfirmationDialog
        isOpen={deleteAssignmentDialog.isOpen}
        onClose={() => setDeleteAssignmentDialog({ isOpen: false, assignment: null })}
        onConfirm={handleDeleteAssignment}
        title="অ্যাসাইনমেন্ট মুছে ফেলুন"
        description="আপনি কি নিশ্চিত যে আপনি এই অ্যাসাইনমেন্টটি মুছে ফেলতে চান?"
        itemName={deleteAssignmentDialog.assignment?.title}
        isLoading={isDeleting}
      />
    </div>
  );
}
