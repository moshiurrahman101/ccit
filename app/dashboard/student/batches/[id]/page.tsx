'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Video, 
  Clock,
  MapPin,
  Link as LinkIcon,
  Play,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatBanglaNumber, formatBanglaDate, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';

interface StudentBatch {
  _id: string;
  batch: {
    _id: string;
    name: string;
    description?: string;
    coverPhoto?: string;
    courseType: 'online' | 'offline';
    regularPrice?: number;
    discountPrice?: number;
    mentorId?: {
      _id: string;
      name: string;
      avatar?: string;
      designation: string;
    };
    duration?: number;
    durationUnit?: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    currentStudents: number;
    status: string;
    modules?: Array<{
      title: string;
      description: string;
      duration: number;
      order: number;
    }>;
    whatYouWillLearn?: string[];
    requirements?: string[];
    features?: string[];
  };
  enrollmentDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  progress: number;
  lastAccessed: string;
  amount: number;
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
  status: 'assigned' | 'submitted' | 'graded';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  createdAt: string;
}

interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  isPinned: boolean;
  replies: number;
  createdAt: string;
}

export default function StudentBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const batchId = params.id as string;

  const [batchData, setBatchData] = useState<StudentBatch | null>(null);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
        router.push('/dashboard/student/batches');
        return;
      }

      // Fetch student's batch enrollment data
      const response = await fetch('/api/student/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batch data');
      }

      const data = await response.json();
      console.log('=== STUDENT BATCH DATA DEBUG ===');
      console.log('Batch ID:', batchId);
      console.log('All batches:', data.batches);
      
      const batch = data.batches?.find((b: StudentBatch) => b.batch._id === batchId);
      console.log('Found batch:', batch);
      console.log('Mentor info:', batch?.batch?.mentorId);
      
      if (!batch) {
        toast.error('Batch not found or you are not enrolled');
        router.push('/dashboard/student/batches');
        return;
      }

      setBatchData(batch);

      // Fetch schedules
      const schedulesResponse = await fetch(`/api/student/batches/${batchId}/schedule`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData.schedules || []);
      }

      // Fetch assignments
      const assignmentsResponse = await fetch(`/api/student/batches/${batchId}/assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.assignments || []);
      }

      // Fetch discussions
      const discussionsResponse = await fetch(`/api/student/batches/${batchId}/discussions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (discussionsResponse.ok) {
        const discussionsData = await discussionsResponse.json();
        setDiscussions(discussionsData.discussions || []);
      }

    } catch (error) {
      console.error('Error fetching batch data:', error);
      toast.error('Failed to fetch batch data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (!batchData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ব্যাচ খুঁজে পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-4">যে ব্যাচটি তুমি খুঁজছো সেটা নেই অথবা তুমি এতে এনরোল করোনি।</p>
          <Link href="/dashboard/student/batches">
            <Button>আমার ব্যাচে ফিরে যাও</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/student/batches">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            আমার ব্যাচে ফিরে যাও
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{batchData.batch.name}</h1>
          <p className="text-gray-600">{batchData.batch.description}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(batchData.status)}>
            {batchData.status}
          </Badge>
          <Badge className={getPaymentStatusColor(batchData.paymentStatus)}>
            {batchData.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Batch Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">শিক্ষার্থী</p>
                <p className="text-2xl font-bold">{formatBanglaNumber(batchData.batch.currentStudents)}/{formatBanglaNumber(batchData.batch.maxStudents)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">সময়কাল</p>
                <p className="text-2xl font-bold">
                  {batchData.batch.duration ? 
                    `${formatBanglaNumber(batchData.batch.duration)} ${batchData.batch.durationUnit || ''}` : 
                    'তথ্য নেই'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">ধরন</p>
                <p className="text-2xl font-bold capitalize">{batchData.batch.courseType === 'online' ? 'অনলাইন' : 'অফলাইন'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">দাম</p>
                <p className="text-2xl font-bold">{formatBanglaCurrency(batchData.amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">সারসংক্ষেপ</TabsTrigger>
          <TabsTrigger value="schedule">শিডিউল</TabsTrigger>
          <TabsTrigger value="assignments">অ্যাসাইনমেন্ট</TabsTrigger>
          <TabsTrigger value="discussions">আলোচনা</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>কোর্সের তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">শুরু তারিখ</label>
                  <p className="text-lg">{formatBanglaDate(batchData.batch.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">শেষ তারিখ</label>
                  <p className="text-lg">{formatBanglaDate(batchData.batch.endDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">কোর্সের ধরন</label>
                  <p className="text-lg capitalize">{batchData.batch.courseType === 'online' ? 'অনলাইন' : 'অফলাইন'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">এনরোলমেন্ট তারিখ</label>
                  <p className="text-lg">{formatBanglaDate(batchData.enrollmentDate)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>মেন্টরের তথ্য</CardTitle>
              </CardHeader>
              <CardContent>
                {batchData.batch.mentorId && batchData.batch.mentorId.name !== 'Mentor Information Unavailable' ? (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    {batchData.batch.mentorId.avatar ? (
                      <img 
                        src={batchData.batch.mentorId.avatar} 
                        alt={batchData.batch.mentorId.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {batchData.batch.mentorId.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {batchData.batch.mentorId.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {batchData.batch.mentorId.designation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">মেন্টর তথ্য লোড হচ্ছে</h3>
                    <p className="text-sm text-gray-600">অ্যাডমিনের সাথে যোগাযোগ করুন যদি সমস্যা থাকে</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>তোমার অগ্রগতি</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>কোর্সের অগ্রগতি</span>
                  <span>{batchData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${batchData.progress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Modules */}
          <Card>
            <CardHeader>
              <CardTitle>কোর্সের মডিউল</CardTitle>
            </CardHeader>
            <CardContent>
              {batchData.batch.modules && batchData.batch.modules.length > 0 ? (
                <div className="space-y-4">
                  {batchData.batch.modules.map((module, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {module.duration} {module.duration === 1 ? 'সপ্তাহ' : 'সপ্তাহ'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>কোনো মডিউল তথ্য পাওয়া যায়নি</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab - Google Classroom Style */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  ক্লাস শিডিউল
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    লাইভ ক্লাস
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.length > 0 ? (
                  schedules.map((schedule) => {
                    const isToday = new Date(schedule.date).toDateString() === new Date().toDateString();
                    const isUpcoming = new Date(schedule.date) > new Date();
                    const isPast = new Date(schedule.date) < new Date();
                    
                    return (
                      <div key={schedule._id} className={`p-6 border-2 rounded-xl transition-all hover:shadow-md ${
                        isToday ? 'border-orange-500 bg-orange-50' : 
                        isUpcoming ? 'border-blue-200 bg-blue-50' : 
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-3 h-3 rounded-full ${
                                isToday ? 'bg-orange-500' : 
                                isUpcoming ? 'bg-blue-500' : 
                                'bg-gray-400'
                              }`}></div>
                              <h4 className="text-lg font-semibold text-gray-900">{schedule.title}</h4>
                              {isToday && (
                                <Badge className="bg-orange-500 text-white animate-pulse">
                                  আজ
                                </Badge>
                              )}
                            </div>
                            {schedule.description && (
                              <p className="text-gray-600 mb-3">{schedule.description}</p>
                            )}
                            
                            {/* Class Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{formatBanglaDate(schedule.date)}</p>
                                    <p className="text-xs text-gray-500">তারিখ</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{schedule.startTime} - {schedule.endTime}</p>
                                  <p className="text-xs text-gray-500">সময়</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                {schedule.isOnline ? (
                                  <>
                                    <Video className="h-4 w-4 text-blue-500" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">অনলাইন ক্লাস</p>
                                      <p className="text-xs text-gray-500">ভার্চুয়াল মিটিং</p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-4 w-4 text-green-500" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{schedule.location}</p>
                                      <p className="text-xs text-gray-500">শারীরিক অবস্থান</p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                              {schedule.meetingLink && isUpcoming && (
                                  <a 
                                    href={schedule.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                  >
                                    <Video className="h-4 w-4" />
                                    ক্লাসে যোগ দাও
                                  </a>
                              )}
                              
                              {schedule.meetingLink && isPast && (
                                <Button variant="outline" disabled>
                                  <Video className="h-4 w-4 mr-2" />
                                  ক্লাস শেষ
                                </Button>
                              )}
                              
                              {!schedule.meetingLink && (
                                <Button variant="outline" disabled>
                                  <Clock className="h-4 w-4 mr-2" />
                                  {isUpcoming ? 'শিডিউল করা' : 'সম্পন্ন'}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(schedule.status)}>
                              {schedule.status}
                            </Badge>
                            {isToday && (
                              <Badge className="bg-orange-100 text-orange-800 animate-pulse">
                                এখন লাইভ
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">এখনো কোনো ক্লাস শিডিউল নেই</h3>
                    <p className="text-gray-600 mb-4">তোমার মেন্টর এখনো কোনো ক্লাস শিডিউল করেননি।</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>আপডেটের জন্য পরে দেখো</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assignments
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Active Assignments
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => {
                    const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'assigned';
                    const isDueToday = new Date(assignment.dueDate).toDateString() === new Date().toDateString();
                    const isCompleted = assignment.status === 'submitted' || assignment.status === 'graded';
                    
                    return (
                      <div key={assignment._id} className={`p-6 border-2 rounded-xl transition-all hover:shadow-md ${
                        isOverdue ? 'border-red-200 bg-red-50' : 
                        isDueToday ? 'border-orange-500 bg-orange-50' : 
                        isCompleted ? 'border-green-200 bg-green-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-3 h-3 rounded-full ${
                                isOverdue ? 'bg-red-500' : 
                                isDueToday ? 'bg-orange-500' : 
                                isCompleted ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}></div>
                              <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                              {isOverdue && (
                                <Badge className="bg-red-500 text-white">
                                  Overdue
                                </Badge>
                              )}
                              {isDueToday && !isCompleted && (
                                <Badge className="bg-orange-500 text-white animate-pulse">
                                  Due Today
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge className="bg-green-500 text-white">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-4">{assignment.description}</p>
                            
                            {/* Assignment Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{formatBanglaDate(assignment.dueDate)}</p>
                                  <p className="text-xs text-gray-500">Due Date</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{assignment.maxPoints} Points</p>
                                  <p className="text-xs text-gray-500">Max Score</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                {assignment.grade ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <div>
                                      <p className="text-sm font-medium text-green-900">{assignment.grade}/{assignment.maxPoints}</p>
                                      <p className="text-xs text-gray-500">Your Grade</p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">Pending</p>
                                      <p className="text-xs text-gray-500">Grade Status</p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                              {!isCompleted && (
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Submit Assignment
                                </Button>
                              )}
                              
                              {isCompleted && (
                                <Button variant="outline" className="text-green-600 border-green-200">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  View Submission
                                </Button>
                              )}
                              
                              {assignment.grade && (
                                <Button variant="outline">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Feedback
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                            {assignment.grade && (
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-600">{assignment.grade}/{assignment.maxPoints}</p>
                                <p className="text-xs text-gray-500">Score</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">এখনো কোনো অ্যাসাইনমেন্ট নেই</h3>
                    <p className="text-gray-600 mb-4">তোমার মেন্টর এখনো কোনো কাজ দেননি।</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>নতুন অ্যাসাইনমেন্টের জন্য পরে দেখো</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discussions.length > 0 ? (
                  discussions.map((discussion) => (
                    <div key={discussion._id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{discussion.title}</h4>
                            {discussion.isPinned && (
                              <Badge variant="secondary" className="text-xs">Pinned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{discussion.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>By {discussion.author.name}</span>
                            <span>{discussion.replies} replies</span>
                            <span>{formatBanglaDate(discussion.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">এখনো কোনো আলোচনা নেই</h3>
                    <p className="text-gray-600 mb-4">আলোচনা ফোরাম শীঘ্রই আসছে!</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>নতুন আলোচনার জন্য অপেক্ষা করো</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
