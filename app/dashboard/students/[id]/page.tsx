'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  CreditCard, 
  FileText,
  User,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/dashboard/RoleGuard';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  avatar?: string;
  studentInfo?: {
    studentId?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nid?: string;
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    emergencyContact?: {
      name?: string;
      phone?: string;
      relationship?: string;
      email?: string;
      address?: string;
    };
    education?: {
      institution?: string;
      degree?: string;
      major?: string;
      graduationYear?: string;
      gpa?: string;
    };
    socialInfo?: {
      facebook?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
      website?: string;
    };
    paymentInfo?: {
      paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_banking' | 'card';
      paymentNumber?: string;
      transactionId?: string;
      paidAmount?: number;
      dueAmount?: number;
      lastPaymentDate?: string;
      paymentStatus?: 'paid' | 'partial' | 'due' | 'overdue';
    };
    batchInfo?: {
      batchId?: string;
      batchName?: string;
      enrollmentDate?: string;
      completionDate?: string;
      status?: 'enrolled' | 'active' | 'completed' | 'dropped' | 'suspended';
    };
    isOfflineStudent?: boolean;
    isVerified?: boolean;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  _id: string;
  studentId: string;
  batchId: string;
  batchName: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  promoCode?: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  payments: Payment[];
}

interface Payment {
  _id: string;
  amount: number;
  method: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  adminNotes?: string;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchStudentDetails();
      fetchStudentInvoices();
    }
  }, [params.id]);

  const fetchStudentDetails = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStudent(data.student);
      } else {
        toast.error(data.error || 'শিক্ষার্থীর তথ্য আনতে সমস্যা হয়েছে');
        router.push('/dashboard/students');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
      router.push('/dashboard/students');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentInvoices = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'সক্রিয়';
      case 'inactive': return 'নিষ্ক্রিয়';
      case 'paid': return 'পরিশোধিত';
      case 'pending': return 'বাকি';
      case 'partial': return 'আংশিক';
      case 'overdue': return 'মেয়াদোত্তীর্ণ';
      case 'approved': return 'অনুমোদিত';
      case 'rejected': return 'প্রত্যাখ্যান';
      case 'enrolled': return 'নিবন্ধিত';
      case 'completed': return 'সম্পন্ন';
      case 'dropped': return 'ত্যাগ';
      case 'suspended': return 'স্থগিত';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">শিক্ষার্থীর তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">শিক্ষার্থী পাওয়া যায়নি</h2>
              <p className="text-gray-600 mb-4">এই শিক্ষার্থীর তথ্য পাওয়া যায়নি।</p>
              <Button onClick={() => router.push('/dashboard/students')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ফিরে যান
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ফিরে যান
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                <p className="text-gray-600">শিক্ষার্থী প্রোফাইল</p>
              </div>
            </div>
            <AdminOnly>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  প্রিন্ট
                </Button>
                <Button
                  variant="outline"
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ডাউনলোড
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/students/edit/${student._id}`)}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  সম্পাদনা
                </Button>
              </div>
            </AdminOnly>
          </div>
        </div>

        {/* Student Info Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="text-2xl">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                    <p className="text-gray-600">{student.studentInfo?.studentId}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={getStatusColor(student.isActive ? 'active' : 'inactive')}>
                        {getStatusText(student.isActive ? 'active' : 'inactive')}
                      </Badge>
                      {student.studentInfo?.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          যাচাইকৃত
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-sm text-gray-600">নিবন্ধনের তারিখ</p>
                    <p className="font-medium">{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'প্রোফাইল', icon: User },
                { id: 'academic', name: 'শিক্ষাগত', icon: GraduationCap },
                { id: 'financial', name: 'আর্থিক', icon: DollarSign },
                { id: 'documents', name: 'নথিপত্র', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>মূল তথ্য</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">ইমেইল</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">ফোন</p>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                </div>
                {student.studentInfo?.dateOfBirth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">জন্ম তারিখ</p>
                      <p className="font-medium">{formatDate(student.studentInfo.dateOfBirth)}</p>
                    </div>
                  </div>
                )}
                {student.studentInfo?.gender && (
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">লিঙ্গ</p>
                      <p className="font-medium">
                        {student.studentInfo.gender === 'male' ? 'পুরুষ' : 
                         student.studentInfo.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}
                      </p>
                    </div>
                  </div>
                )}
                {student.studentInfo?.bloodGroup && (
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">রক্তের গ্রুপ</p>
                      <p className="font-medium">{student.studentInfo.bloodGroup}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>ঠিকানা</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.studentInfo?.address ? (
                  <div className="space-y-2">
                    {student.studentInfo.address.street && (
                      <p className="font-medium">{student.studentInfo.address.street}</p>
                    )}
                    <div className="text-sm text-gray-600">
                      {student.studentInfo.address.city && <span>{student.studentInfo.address.city}, </span>}
                      {student.studentInfo.address.state && <span>{student.studentInfo.address.state}, </span>}
                      {student.studentInfo.address.country && <span>{student.studentInfo.address.country}</span>}
                      {student.studentInfo.address.postalCode && <span> - {student.studentInfo.address.postalCode}</span>}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">ঠিকানার তথ্য নেই</p>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {student.studentInfo?.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>জরুরি যোগাযোগ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">নাম</p>
                    <p className="font-medium">{student.studentInfo.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">সম্পর্ক</p>
                    <p className="font-medium">{student.studentInfo.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ফোন</p>
                    <p className="font-medium">{student.studentInfo.emergencyContact.phone}</p>
                  </div>
                  {student.studentInfo.emergencyContact.email && (
                    <div>
                      <p className="text-sm text-gray-600">ইমেইল</p>
                      <p className="font-medium">{student.studentInfo.emergencyContact.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {student.studentInfo?.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>নোট</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{student.studentInfo.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batch Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>ব্যাচ তথ্য</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.studentInfo?.batchInfo ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">ব্যাচের নাম</p>
                      <p className="font-medium">{student.studentInfo.batchInfo.batchName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">অবস্থা</p>
                      <Badge className={getStatusColor(student.studentInfo.batchInfo.status || '')}>
                        {getStatusText(student.studentInfo.batchInfo.status || '')}
                      </Badge>
                    </div>
                    {student.studentInfo.batchInfo.enrollmentDate && (
                      <div>
                        <p className="text-sm text-gray-600">নিবন্ধনের তারিখ</p>
                        <p className="font-medium">{formatDate(student.studentInfo.batchInfo.enrollmentDate)}</p>
                      </div>
                    )}
                    {student.studentInfo.batchInfo.completionDate && (
                      <div>
                        <p className="text-sm text-gray-600">সমাপ্তির তারিখ</p>
                        <p className="font-medium">{formatDate(student.studentInfo.batchInfo.completionDate)}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">ব্যাচের তথ্য নেই</p>
                )}
              </CardContent>
            </Card>

            {/* Education Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>শিক্ষাগত যোগ্যতা</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.studentInfo?.education ? (
                  <div className="space-y-3">
                    {student.studentInfo.education.institution && (
                      <div>
                        <p className="text-sm text-gray-600">শিক্ষা প্রতিষ্ঠান</p>
                        <p className="font-medium">{student.studentInfo.education.institution}</p>
                      </div>
                    )}
                    {student.studentInfo.education.degree && (
                      <div>
                        <p className="text-sm text-gray-600">ডিগ্রি</p>
                        <p className="font-medium">{student.studentInfo.education.degree}</p>
                      </div>
                    )}
                    {student.studentInfo.education.major && (
                      <div>
                        <p className="text-sm text-gray-600">বিষয়</p>
                        <p className="font-medium">{student.studentInfo.education.major}</p>
                      </div>
                    )}
                    {student.studentInfo.education.graduationYear && (
                      <div>
                        <p className="text-sm text-gray-600">স্নাতক বছর</p>
                        <p className="font-medium">{student.studentInfo.education.graduationYear}</p>
                      </div>
                    )}
                    {student.studentInfo.education.gpa && (
                      <div>
                        <p className="text-sm text-gray-600">জিপিএ</p>
                        <p className="font-medium">{student.studentInfo.education.gpa}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">শিক্ষাগত তথ্য নেই</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>পেমেন্ট সারসংক্ষেপ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.studentInfo?.paymentInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(student.studentInfo.paymentInfo.paidAmount || 0)}
                      </p>
                      <p className="text-sm text-gray-600">পরিশোধিত</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(student.studentInfo.paymentInfo.dueAmount || 0)}
                      </p>
                      <p className="text-sm text-gray-600">বাকি</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency((student.studentInfo.paymentInfo.paidAmount || 0) + (student.studentInfo.paymentInfo.dueAmount || 0))}
                      </p>
                      <p className="text-sm text-gray-600">মোট</p>
                    </div>
                    <div className="text-center">
                      <Badge className={getStatusColor(student.studentInfo.paymentInfo.paymentStatus || '')}>
                        {getStatusText(student.studentInfo.paymentInfo.paymentStatus || '')}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">অবস্থা</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">পেমেন্ট তথ্য নেই</p>
                )}
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>ইনভয়েস</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{invoice.batchName}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(invoice.createdAt)} - {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(invoice.finalAmount)}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusText(invoice.status)}
                            </Badge>
                          </div>
                        </div>
                        {invoice.promoCode && (
                          <div className="mt-2 text-sm text-gray-600">
                            প্রোমো কোড: {invoice.promoCode} (-{formatCurrency(invoice.discountAmount)})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">কোন ইনভয়েস নেই</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>নথিপত্র</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">নথিপত্রের তথ্য শীঘ্রই আসবে</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
