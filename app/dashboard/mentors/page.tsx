'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Mail,
  Phone,
  Star,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { toast } from 'sonner';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio: string;
  designation: string;
  experience: number;
  expertise: string[];
  skills: string[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  teachingExperience: number;
  rating?: number;
  studentsCount?: number;
  coursesCount?: number;
  achievements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MentorsResponse {
  mentors: Mentor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMentors: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    mentor: Mentor | null;
  }>({
    isOpen: false,
    mentor: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchMentors();
  }, [isAuthenticated, user, router, currentPage, searchTerm, statusFilter]);

  const fetchMentors = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/public/mentors?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch mentors');
      }

      const data: MentorsResponse = await response.json();
      setMentors(data.mentors);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (mentor: Mentor) => {
    setDeleteDialog({
      isOpen: true,
      mentor
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.mentor) return;

    try {
      setIsDeleting(true);
      setError('');

      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/mentors?id=${deleteDialog.mentor._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete mentor');
      }

      const result = await response.json();
      
      // Show success message
      toast.success(`মেন্টর "${deleteDialog.mentor.name}" সফলভাবে মুছে ফেলা হয়েছে`, {
        description: 'মেন্টর প্রোফাইল, ব্যবহারকারী অ্যাকাউন্ট এবং Cloudinary ছবি মুছে ফেলা হয়েছে'
      });

      // Close dialog and refresh list
      setDeleteDialog({ isOpen: false, mentor: null });
      fetchMentors();
    } catch (error) {
      console.error('Error deleting mentor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mentor';
      setError(errorMessage);
      toast.error('মেন্টর মুছতে ব্যর্থ', {
        description: errorMessage
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, mentor: null });
  };

  const getStatusBadge = (status: string, isVerified: boolean) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status === 'active' && isVerified ? getStatusText('verified') : getStatusText(status)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            মেন্টর লোড হচ্ছে...
          </h1>
          <p className="text-gray-600">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">মেন্টর ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-1">
            আপনার প্ল্যাটফর্মের মেন্টরদের ব্যবস্থাপনা করুন
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/mentors/add')}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন মেন্টর যোগ করুন
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট মেন্টর</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mentors.length}</div>
            <p className="text-xs text-muted-foreground">
              {getStatusText('active')} মেন্টর
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getStatusText('verified')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mentors.filter(m => (m as any).isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {getStatusText('verified')} মেন্টর
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mentors.reduce((sum, m) => sum + (m.studentsCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              সমস্ত মেন্টরের শিক্ষার্থী
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mentors.reduce((sum, m) => sum + (m.coursesCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              সমস্ত মেন্টরের কোর্স
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>মেন্টর খুঁজুন</CardTitle>
          <CardDescription>
            নাম, ইমেইল, বা দক্ষতা দিয়ে মেন্টর খুঁজুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="মেন্টর খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">সব স্ট্যাটাস</option>
              <option value="active">{getStatusText('active')}</option>
              <option value="inactive">{getStatusText('inactive')}</option>
              <option value="pending">{getStatusText('pending')}</option>
              <option value="suspended">{getStatusText('suspended')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mentors List */}
      <div className="grid grid-cols-1 gap-6">
        {mentors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                কোন মেন্টর পাওয়া যায়নি
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter 
                  ? 'আপনার অনুসন্ধানের সাথে মিলে যায় এমন কোন মেন্টর নেই'
                  : 'এখনও কোন মেন্টর যোগ করা হয়নি'
                }
              </p>
              <Button 
                onClick={() => router.push('/dashboard/mentors/add')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                প্রথম মেন্টর যোগ করুন
              </Button>
            </CardContent>
          </Card>
        ) : (
          mentors.map((mentor) => (
            <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Mentor Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-lg font-semibold">
                        {mentor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {mentor.name}
                        </h3>
                        {getStatusBadge((mentor as any).status, (mentor as any).isVerified)}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{mentor.email}</span>
                        </div>
                        {mentor.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{mentor.phone}</span>
                          </div>
                        )}
                      </div>

                      {mentor.designation && (
                        <p className="text-sm text-gray-700 mb-2">{mentor.designation}</p>
                      )}

                      {mentor.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {mentor.bio}
                        </p>
                      )}

                      {/* Skills and Expertise */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mentor.expertise.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{mentor.expertise.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{(mentor.rating || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>{mentor.studentsCount || 0} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-green-500" />
                          <span>{mentor.coursesCount || 0} courses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>{mentor.experience} years exp</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/mentors/${mentor._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      দেখুন
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/mentors/${mentor._id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      সম্পাদনা
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(mentor)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          মুছুন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            পূর্ববর্তী
          </Button>
          
          <span className="text-sm text-gray-600">
            পৃষ্ঠা {currentPage} এর {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            পরবর্তী
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="মেন্টর মুছুন"
        description="আপনি কি নিশ্চিত যে আপনি এই মেন্টরকে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।"
        itemName={deleteDialog.mentor?.name}
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
}
