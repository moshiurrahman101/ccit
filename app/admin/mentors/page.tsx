'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Award
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatBanglaNumber } from '@/lib/utils/banglaNumbers';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  designation?: string;
  experience: number;
  expertise: string[];
  skills: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified: boolean;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  createdAt: string;
  updatedAt: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expertiseFilter, setExpertiseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMentors, setTotalMentors] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/admin/login');
    }

    fetchMentors();
  }, [router, currentPage, searchTerm, statusFilter, expertiseFilter]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(expertiseFilter !== 'all' && { expertise: expertiseFilter })
      });

      const response = await fetch(`/api/mentors?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors);
        setTotalPages(data.pagination.totalPages);
        setTotalMentors(data.pagination.totalMentors);
      } else {
        console.error('Failed to fetch mentors');
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleExpertiseChange = (value: string) => {
    setExpertiseFilter(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string, isVerified: boolean) => {
    const statusConfig = {
      active: { label: 'সক্রিয়', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'নিষ্ক্রিয়', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'অপেক্ষমান', className: 'bg-yellow-100 text-yellow-800' },
      suspended: { label: 'স্থগিত', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <div className="flex items-center space-x-2">
        <Badge className={config.className}>
          {config.label}
        </Badge>
        {isVerified && (
          <Badge className="bg-blue-100 text-blue-800">
            <Award className="w-3 h-3 mr-1" />
            যাচাইকৃত
          </Badge>
        )}
      </div>
    );
  };

  const handleEdit = (mentorId: string) => {
    // Navigate to edit page
    router.push(`/admin/mentors/${mentorId}/edit`);
  };

  const handleView = (mentorId: string) => {
    // Navigate to view page
    router.push(`/admin/mentors/${mentorId}`);
  };

  const handleDelete = async (mentorId: string) => {
    if (!confirm('আপনি কি এই মেন্টরকে মুছে ফেলতে চান?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentors/${mentorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchMentors(); // Refresh the list
      } else {
        console.error('Failed to delete mentor');
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
    }
  };

  if (loading && mentors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <GraduationCap className="h-8 w-8 mr-3 text-blue-600" />
                মেন্টর ব্যবস্থাপনা
              </h1>
              <p className="text-gray-600 mt-2">
                আপনার মেন্টরদের পরিচালনা করুন এবং তাদের প্রোফাইল আপডেট করুন
              </p>
            </div>
            <Button 
              onClick={() => router.push('/admin/mentors/add')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন মেন্টর যোগ করুন
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট মেন্টর</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBanglaNumber(totalMentors)}</div>
              <p className="text-xs text-gray-600">সকল মেন্টর</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সক্রিয় মেন্টর</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBanglaNumber(mentors.filter(m => m.status === 'active').length)}
              </div>
              <p className="text-xs text-gray-600">বর্তমানে সক্রিয়</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">যাচাইকৃত</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBanglaNumber(mentors.filter(m => m.isVerified).length)}
              </div>
              <p className="text-xs text-gray-600">যাচাইকৃত মেন্টর</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অপেক্ষমান</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBanglaNumber(mentors.filter(m => m.status === 'pending').length)}
              </div>
              <p className="text-xs text-gray-600">অনুমোদনের অপেক্ষায়</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="মেন্টর খুঁজুন (নাম, ইমেইল, দক্ষতা...)"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                  <SelectItem value="active">সক্রিয়</SelectItem>
                  <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                  <SelectItem value="pending">অপেক্ষমান</SelectItem>
                  <SelectItem value="suspended">স্থগিত</SelectItem>
                </SelectContent>
              </Select>
              <Select value={expertiseFilter} onValueChange={handleExpertiseChange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="বিশেষত্ব" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিশেষত্ব</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="node">Node.js</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="design">UI/UX Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Mentors Table */}
        <Card>
          <CardHeader>
            <CardTitle>মেন্টর তালিকা</CardTitle>
            <CardDescription>
              {formatBanglaNumber(totalMentors)} জন মেন্টরের মধ্যে {formatBanglaNumber(mentors.length)} জন দেখানো হচ্ছে
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : mentors.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">কোন মেন্টর পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mentors.map((mentor) => (
                  <div key={mentor._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {mentor.avatar ? (
                            <img 
                              src={mentor.avatar} 
                              alt={mentor.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            mentor.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                            {getStatusBadge(mentor.status, mentor.isVerified)}
                          </div>
                          <p className="text-gray-600 mb-2">{mentor.designation || 'মেন্টর'}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {mentor.email}
                            </div>
                            {mentor.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {mentor.phone}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              {mentor.rating.toFixed(1)} রেটিং
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {formatBanglaNumber(mentor.totalStudents)} শিক্ষার্থী
                            </div>
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-1" />
                              {formatBanglaNumber(mentor.experience)} বছর অভিজ্ঞতা
                            </div>
                          </div>
                          {mentor.expertise && mentor.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {mentor.expertise.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {mentor.expertise.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{mentor.expertise.length - 3} আরও
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(mentor._id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            দেখুন
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(mentor._id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            সম্পাদনা
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(mentor._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            মুছে ফেলুন
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-700">
                  পৃষ্ঠা {formatBanglaNumber(currentPage)} এর {formatBanglaNumber(totalPages)}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    পূর্ববর্তী
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    পরবর্তী
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
