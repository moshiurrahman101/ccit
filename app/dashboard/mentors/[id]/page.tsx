'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Globe, 
  UserPlus,
  Briefcase,
  BookOpen,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { toast } from 'sonner';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  designation?: string;
  experience: number;
  expertise?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    portfolio?: string;
  };
  skills?: string[];
  languages?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
  availability: {
    timezone: string;
    workingHours: string;
    availableDays: string[];
  };
  teachingExperience: number;
  teachingStyle?: string;
  specializations?: string[];
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified?: boolean;
  rating?: number;
  studentsCount?: number;
  coursesCount?: number;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function MentorDetailsPage() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;

  const fetchMentor = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/mentors/${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          console.log('Forbidden, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch mentor');
      }

      const data = await response.json();
      setMentor(data.mentor);
    } catch (error) {
      console.error('Error fetching mentor:', error);
      setError('Failed to fetch mentor details');
    } finally {
      setLoading(false);
    }
  }, [mentorId, router]);

  useEffect(() => {
    console.log('Auth state:', { authLoading, isAuthenticated, user: user?.email, role: user?.role });
    
    // Wait for authentication state to load
    if (authLoading) {
      console.log('Still loading auth...');
      return;
    }
    
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    // For now, allow both admin and mentor roles to access mentor profiles
    // Later we can add more specific permission checks
    if (user.role !== 'admin' && user.role !== 'mentor') {
      console.log('Insufficient permissions, redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('Fetching mentor data...');
    fetchMentor();
  }, [authLoading, isAuthenticated, user, router, mentorId, fetchMentor]);

  const handleDeleteClick = () => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই মেন্টরকে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।')) {
      handleDeleteConfirm();
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError('');

      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/mentors/${mentorId}`, {
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
      toast.success(`মেন্টর "${mentor?.name}" সফলভাবে মুছে ফেলা হয়েছে`, {
        description: result.deletedImages > 0 
          ? `${result.deletedImages}টি ছবি Cloudinary থেকে মুছে ফেলা হয়েছে`
          : 'সমস্ত ডেটা মুছে ফেলা হয়েছে'
      });

      // Redirect to mentors list
      router.push('/dashboard/mentors');
    } catch (error) {
      console.error('Error deleting mentor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mentor';
      setError(errorMessage);
      toast.error('মেন্টর মুছতে ব্যর্থ', {
        description: errorMessage
      });
    }
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
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} flex items-center gap-1`}>
          <Icon className="w-3 h-3" />
          {getStatusText(status)}
        </Badge>
        {isVerified && (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {getStatusText('verified')}
          </Badge>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            প্রমাণীকরণ চেক করা হচ্ছে...
          </h1>
          <p className="text-gray-600">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>
    );
  }

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

  if (error || !mentor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            মেন্টর পাওয়া যায়নি
          </h1>
          <p className="text-gray-600 mb-4">
            {error || 'এই মেন্টরটি বিদ্যমান নেই'}
          </p>
          <Button onClick={() => router.push('/dashboard/mentors')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/mentors')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ফিরে যান
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-semibold">
                {mentor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
                {getStatusBadge(mentor.status || 'pending', mentor.isVerified || false)}
              </div>
              <p className="text-lg text-gray-600">{mentor.designation}</p>
              <p className="text-sm text-gray-500">{mentor.email}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/dashboard/mentors/${mentorId}/edit`)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              সম্পাদনা
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              মুছুন
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                মূল তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mentor.bio && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">বায়ো</h4>
                  <p className="text-gray-700">{mentor.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{mentor.email}</span>
                </div>
                {mentor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{mentor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{mentor.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {mentor.rating ? `${mentor.rating.toFixed(1)} rating` : 'No rating yet'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                পেশাগত তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expertise */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">বিশেষজ্ঞতা</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {mentor.skills && mentor.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">টেকনিক্যাল স্কিল</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {mentor.education && mentor.education.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">শিক্ষাগত যোগ্যতা</h4>
                  <div className="space-y-2">
                    {mentor.education.map((edu, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{edu.degree}</div>
                        <div className="text-sm text-gray-600">{edu.institution}</div>
                        <div className="text-sm text-gray-500">{edu.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {mentor.certifications && mentor.certifications.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">সার্টিফিকেশন</h4>
                  <div className="space-y-2">
                    {mentor.certifications.map((cert, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{cert.name}</div>
                        <div className="text-sm text-gray-600">{cert.issuer}</div>
                        <div className="text-sm text-gray-500">{cert.date}</div>
                        {cert.credentialId && (
                          <div className="text-sm text-gray-500">ID: {cert.credentialId}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teaching Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                শিক্ষাদান তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">শিক্ষাদান অভিজ্ঞতা</h4>
                  <p className="text-gray-600">{mentor.teachingExperience} years</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">মোট শিক্ষার্থী</h4>
                  <p className="text-gray-600">{mentor.studentsCount || 0}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">মোট কোর্স</h4>
                  <p className="text-gray-600">{mentor.coursesCount || 0}</p>
                </div>
              </div>

              {mentor.teachingStyle && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">শিক্ষাদান পদ্ধতি</h4>
                  <p className="text-gray-700">{mentor.teachingStyle}</p>
                </div>
              )}

              {mentor.specializations && mentor.specializations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">বিশেষায়িত বিষয়</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {mentor.languages && mentor.languages.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ভাষা</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Stats */}
          <Card>
            <CardHeader>
              <CardTitle>স্ট্যাটাস ও পরিসংখ্যান</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {mentor.rating ? mentor.rating.toFixed(1) : 'N/A'}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(mentor.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">গড় রেটিং</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{mentor.studentsCount || 0}</div>
                  <p className="text-xs text-gray-600">শিক্ষার্থী</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{mentor.coursesCount || 0}</div>
                  <p className="text-xs text-gray-600">কোর্স</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                উপলব্ধতা
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">টাইমজোন</h4>
                <p className="text-sm text-gray-600">{mentor.availability?.timezone || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">কাজের সময়</h4>
                <p className="text-sm text-gray-600">{mentor.availability?.workingHours || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">উপলব্ধ দিন</h4>
                <div className="flex flex-wrap gap-1">
                  {mentor.availability?.availableDays && mentor.availability.availableDays.length > 0 ? (
                    mentor.availability.availableDays.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs capitalize">
                        {day}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                সামাজিক লিংক
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mentor.socialLinks && Object.entries(mentor.socialLinks).map(([platform, url]) => {
                if (!url) return null;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                );
              })}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>সিস্টেম তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-900">তৈরি হয়েছে:</span>
                <p className="text-gray-600">{formatDate(mentor.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">সর্বশেষ আপডেট:</span>
                <p className="text-gray-600">{formatDate(mentor.updatedAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">তৈরি করেছেন:</span>
                <p className="text-gray-600">{mentor.createdBy?.name || 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
