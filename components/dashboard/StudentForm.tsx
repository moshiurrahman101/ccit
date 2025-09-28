'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Phone, Calendar, MapPin, GraduationCap, CreditCard, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusText } from '@/lib/utils/statusDictionary';

interface Student {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  studentInfo?: {
    studentId?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nid?: string;
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address?: {
      street?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      country?: string;
    };
    emergencyContact?: {
      name?: string;
      phone?: string;
      relation?: string;
      address?: string;
    };
    education?: {
      level?: string;
      institution?: string;
      graduationYear?: number;
      gpa?: number;
      major?: string;
    };
    socialInfo?: {
      facebook?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
      website?: string;
    };
    paymentInfo?: {
      paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
      paymentNumber?: string;
      transactionId?: string;
      paidAmount?: number;
      dueAmount?: number;
      paymentStatus?: 'paid' | 'partial' | 'due' | 'overdue';
    };
    batchInfo?: {
      batchId?: string;
      batchName?: string;
      status?: 'enrolled' | 'active' | 'completed' | 'dropped' | 'suspended';
    };
    isOfflineStudent?: boolean;
    notes?: string;
    isVerified?: boolean;
  };
}

interface Batch {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
}

interface StudentFormProps {
  student?: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentForm({ 
  student, 
  isOpen, 
  onClose, 
  onSuccess
}: StudentFormProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    password: '',
    
    // Personal Info
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    nid: '',
    bloodGroup: 'A+' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
    
    // Address
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Bangladesh'
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      phone: '',
      relation: '',
      address: ''
    },
    
    // Education
    education: {
      level: '',
      institution: '',
      graduationYear: '',
      gpa: '',
      major: ''
    },
    
    // Social Info
    socialInfo: {
      facebook: '',
      linkedin: '',
      github: '',
      twitter: '',
      website: ''
    },
    
    // Payment Info
    paymentInfo: {
      paymentMethod: 'bkash' as 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash',
      paymentNumber: '',
      transactionId: '',
      paidAmount: '',
      dueAmount: '',
      paymentStatus: 'due' as 'paid' | 'partial' | 'due' | 'overdue'
    },
    
    // Batch Info
    batchId: '',
    
    // Additional Info
    isOfflineStudent: false,
    notes: ''
  });

  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchBatches();
      if (student) {
        setFormData({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          password: '',
          dateOfBirth: student.studentInfo?.dateOfBirth ? new Date(student.studentInfo.dateOfBirth).toISOString().split('T')[0] : '',
          gender: student.studentInfo?.gender || 'male',
          nid: student.studentInfo?.nid || '',
          bloodGroup: student.studentInfo?.bloodGroup || 'A+',
          address: {
            street: student.studentInfo?.address?.street || '',
            city: student.studentInfo?.address?.city || '',
            district: student.studentInfo?.address?.district || '',
            postalCode: student.studentInfo?.address?.postalCode || '',
            country: student.studentInfo?.address?.country || 'Bangladesh'
          },
          emergencyContact: {
            name: student.studentInfo?.emergencyContact?.name || '',
            phone: student.studentInfo?.emergencyContact?.phone || '',
            relation: student.studentInfo?.emergencyContact?.relation || '',
            address: student.studentInfo?.emergencyContact?.address || ''
          },
          education: {
            level: student.studentInfo?.education?.level || '',
            institution: student.studentInfo?.education?.institution || '',
            graduationYear: student.studentInfo?.education?.graduationYear?.toString() || '',
            gpa: student.studentInfo?.education?.gpa?.toString() || '',
            major: student.studentInfo?.education?.major || ''
          },
          socialInfo: {
            facebook: student.studentInfo?.socialInfo?.facebook || '',
            linkedin: student.studentInfo?.socialInfo?.linkedin || '',
            github: student.studentInfo?.socialInfo?.github || '',
            twitter: student.studentInfo?.socialInfo?.twitter || '',
            website: student.studentInfo?.socialInfo?.website || ''
          },
          paymentInfo: {
            paymentMethod: student.studentInfo?.paymentInfo?.paymentMethod || 'bkash',
            paymentNumber: student.studentInfo?.paymentInfo?.paymentNumber || '',
            transactionId: student.studentInfo?.paymentInfo?.transactionId || '',
            paidAmount: student.studentInfo?.paymentInfo?.paidAmount?.toString() || '',
            dueAmount: student.studentInfo?.paymentInfo?.dueAmount?.toString() || '',
            paymentStatus: student.studentInfo?.paymentInfo?.paymentStatus || 'due'
          },
          batchId: student.studentInfo?.batchInfo?.batchId || '',
          isOfflineStudent: student.studentInfo?.isOfflineStudent || false,
          notes: student.studentInfo?.notes || ''
        });
      } else {
        // Reset form for new student
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '123456',
          dateOfBirth: '',
          gender: 'male',
          nid: '',
          bloodGroup: 'A+',
          address: {
            street: '',
            city: '',
            district: '',
            postalCode: '',
            country: 'Bangladesh'
          },
          emergencyContact: {
            name: '',
            phone: '',
            relation: '',
            address: ''
          },
          education: {
            level: '',
            institution: '',
            graduationYear: '',
            gpa: '',
            major: ''
          },
          socialInfo: {
            facebook: '',
            linkedin: '',
            github: '',
            twitter: '',
            website: ''
          },
          paymentInfo: {
            paymentMethod: 'bkash',
            paymentNumber: '',
            transactionId: '',
            paidAmount: '',
            dueAmount: '',
            paymentStatus: 'due'
          },
          batchId: '',
          isOfflineStudent: false,
          notes: ''
        });
      }
    }
  }, [isOpen, student]);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/batches/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof typeof prev] as Record<string, unknown>,
            [keys[1]]: value
          }
        };
      }
      return prev;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      const url = student ? `/api/students/${student._id}` : '/api/students';
      const method = student ? 'PUT' : 'POST';
      
      const body: Record<string, unknown> = { ...formData };
      
      // Convert string numbers to actual numbers
      if (body.education) {
        const education = body.education as Record<string, unknown>;
        if (education.graduationYear) education.graduationYear = parseInt(education.graduationYear as string);
        if (education.gpa) education.gpa = parseFloat(education.gpa as string);
      }
      
      if (body.paymentInfo) {
        const paymentInfo = body.paymentInfo as Record<string, unknown>;
        if (paymentInfo.paidAmount) paymentInfo.paidAmount = parseFloat(paymentInfo.paidAmount as string);
        if (paymentInfo.dueAmount) paymentInfo.dueAmount = parseFloat(paymentInfo.dueAmount as string);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'শিক্ষার্থী সফলভাবে সংরক্ষিত হয়েছে');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl z-50 text-gray-900 p-3 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4 border-b border-gray-200">
          <DialogTitle className="text-gray-900 text-lg sm:text-xl font-semibold">
            {student ? 'শিক্ষার্থী সম্পাদনা' : 'নতুন শিক্ষার্থী'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-3 sm:py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
              <TabsTrigger value="basic" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">মৌলিক</span>
                <span className="sm:hidden">মৌলিক</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">ব্যক্তিগত</span>
                <span className="sm:hidden">ব্যক্তিগত</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">ঠিকানা</span>
                <span className="sm:hidden">ঠিকানা</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">শিক্ষা</span>
                <span className="sm:hidden">শিক্ষা</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">পেমেন্ট</span>
                <span className="sm:hidden">পেমেন্ট</span>
              </TabsTrigger>
              <TabsTrigger value="additional" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">অতিরিক্ত</span>
                <span className="sm:hidden">অতিরিক্ত</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-3 sm:space-y-4">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">মৌলিক তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        <User className="inline w-4 h-4 mr-2" />
                        নাম *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="পূর্ণ নাম লিখুন"
                        className="bg-white border-gray-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        <Mail className="inline w-4 h-4 mr-2" />
                        ইমেইল *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="ইমেইল ঠিকানা লিখুন"
                        className="bg-white border-gray-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        <Phone className="inline w-4 h-4 mr-2" />
                        ফোন নম্বর *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="ফোন নম্বর লিখুন"
                        className="bg-white border-gray-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">
                        পাসওয়ার্ড {student ? '(খালি রাখলে পরিবর্তন হবে না)' : '*'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder={student ? 'নতুন পাসওয়ার্ড লিখুন' : 'পাসওয়ার্ড লিখুন'}
                        className="bg-white border-gray-300"
                        required={!student}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batchId" className="text-gray-700 font-medium">
                        ব্যাচ *
                      </Label>
                      <Select
                        value={formData.batchId}
                        onValueChange={(value) => handleInputChange('batchId', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="ব্যাচ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          {batches.map((batch) => (
                            <SelectItem key={batch._id} value={batch._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{batch.name}</span>
                                <span className="text-sm text-gray-500">
                                  {batch.currentStudents}/{batch.maxStudents} শিক্ষার্থী
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ব্যক্তিগত তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        জন্ম তারিখ
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-gray-700 font-medium">
                        লিঙ্গ
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange('gender', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="male">পুরুষ</SelectItem>
                          <SelectItem value="female">মহিলা</SelectItem>
                          <SelectItem value="other">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nid" className="text-gray-700 font-medium">
                        জাতীয় পরিচয়পত্র নম্বর
                      </Label>
                      <Input
                        id="nid"
                        type="text"
                        value={formData.nid}
                        onChange={(e) => handleInputChange('nid', e.target.value)}
                        placeholder="NID নম্বর লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup" className="text-gray-700 font-medium">
                        রক্তের গ্রুপ
                      </Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(value) => handleInputChange('bloodGroup', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-800">জরুরি যোগাযোগ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName" className="text-gray-700 font-medium">
                          নাম
                        </Label>
                        <Input
                          id="emergencyName"
                          type="text"
                          value={formData.emergencyContact.name}
                          onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                          placeholder="জরুরি যোগাযোগের নাম"
                          className="bg-white border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone" className="text-gray-700 font-medium">
                          ফোন নম্বর
                        </Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={formData.emergencyContact.phone}
                          onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                          placeholder="জরুরি ফোন নম্বর"
                          className="bg-white border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyRelation" className="text-gray-700 font-medium">
                          সম্পর্ক
                        </Label>
                        <Input
                          id="emergencyRelation"
                          type="text"
                          value={formData.emergencyContact.relation}
                          onChange={(e) => handleInputChange('emergencyContact.relation', e.target.value)}
                          placeholder="সম্পর্ক (পিতা, মাতা, ভাই, বোন ইত্যাদি)"
                          className="bg-white border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyAddress" className="text-gray-700 font-medium">
                          ঠিকানা
                        </Label>
                        <Input
                          id="emergencyAddress"
                          type="text"
                          value={formData.emergencyContact.address}
                          onChange={(e) => handleInputChange('emergencyContact.address', e.target.value)}
                          placeholder="জরুরি যোগাযোগের ঠিকানা"
                          className="bg-white border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ঠিকানা তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-gray-700 font-medium">
                        রাস্তা/বাড়ি নম্বর
                      </Label>
                      <Input
                        id="street"
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        placeholder="রাস্তা/বাড়ি নম্বর লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700 font-medium">
                        শহর
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        placeholder="শহরের নাম লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-gray-700 font-medium">
                        জেলা
                      </Label>
                      <Input
                        id="district"
                        type="text"
                        value={formData.address.district}
                        onChange={(e) => handleInputChange('address.district', e.target.value)}
                        placeholder="জেলার নাম লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-gray-700 font-medium">
                        পোস্টাল কোড
                      </Label>
                      <Input
                        id="postalCode"
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                        placeholder="পোস্টাল কোড লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-gray-700 font-medium">
                        দেশ
                      </Label>
                      <Input
                        id="country"
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        placeholder="দেশের নাম লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">শিক্ষাগত যোগ্যতা</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="educationLevel" className="text-gray-700 font-medium">
                        শিক্ষার স্তর
                      </Label>
                      <Select
                        value={formData.education.level}
                        onValueChange={(value) => handleInputChange('education.level', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="শিক্ষার স্তর নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="ssc">এসএসসি</SelectItem>
                          <SelectItem value="hsc">এইচএসসি</SelectItem>
                          <SelectItem value="diploma">ডিপ্লোমা</SelectItem>
                          <SelectItem value="bachelor">স্নাতক</SelectItem>
                          <SelectItem value="masters">স্নাতকোত্তর</SelectItem>
                          <SelectItem value="phd">পিএইচডি</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institution" className="text-gray-700 font-medium">
                        শিক্ষাপ্রতিষ্ঠান
                      </Label>
                      <Input
                        id="institution"
                        type="text"
                        value={formData.education.institution}
                        onChange={(e) => handleInputChange('education.institution', e.target.value)}
                        placeholder="শিক্ষাপ্রতিষ্ঠানের নাম লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear" className="text-gray-700 font-medium">
                        পাসের বছর
                      </Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={formData.education.graduationYear}
                        onChange={(e) => handleInputChange('education.graduationYear', e.target.value)}
                        placeholder="পাসের বছর লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpa" className="text-gray-700 font-medium">
                        জিপিএ
                      </Label>
                      <Input
                        id="gpa"
                        type="number"
                        step="0.01"
                        value={formData.education.gpa}
                        onChange={(e) => handleInputChange('education.gpa', e.target.value)}
                        placeholder="জিপিএ লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="major" className="text-gray-700 font-medium">
                        বিষয়/বিভাগ
                      </Label>
                      <Input
                        id="major"
                        type="text"
                        value={formData.education.major}
                        onChange={(e) => handleInputChange('education.major', e.target.value)}
                        placeholder="বিষয়/বিভাগ লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">পেমেন্ট তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-gray-700 font-medium">
                        পেমেন্ট পদ্ধতি
                      </Label>
                      <Select
                        value={formData.paymentInfo.paymentMethod}
                        onValueChange={(value) => handleInputChange('paymentInfo.paymentMethod', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="bkash">বিকাশ</SelectItem>
                          <SelectItem value="nagad">নগদ</SelectItem>
                          <SelectItem value="rocket">রকেট</SelectItem>
                          <SelectItem value="bank">ব্যাংক</SelectItem>
                          <SelectItem value="cash">নগদ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentNumber" className="text-gray-700 font-medium">
                        পেমেন্ট নম্বর
                      </Label>
                      <Input
                        id="paymentNumber"
                        type="text"
                        value={formData.paymentInfo.paymentNumber}
                        onChange={(e) => handleInputChange('paymentInfo.paymentNumber', e.target.value)}
                        placeholder="পেমেন্ট নম্বর লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transactionId" className="text-gray-700 font-medium">
                        লেনদেনের আইডি
                      </Label>
                      <Input
                        id="transactionId"
                        type="text"
                        value={formData.paymentInfo.transactionId}
                        onChange={(e) => handleInputChange('paymentInfo.transactionId', e.target.value)}
                        placeholder="লেনদেনের আইডি লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus" className="text-gray-700 font-medium">
                        পেমেন্ট স্ট্যাটাস
                      </Label>
                      <Select
                        value={formData.paymentInfo.paymentStatus}
                        onValueChange={(value) => handleInputChange('paymentInfo.paymentStatus', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="paid">পেইড</SelectItem>
                          <SelectItem value="partial">আংশিক</SelectItem>
                          <SelectItem value="due">বাকি</SelectItem>
                          <SelectItem value="overdue">অতিরিক্ত বাকি</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paidAmount" className="text-gray-700 font-medium">
                        পরিশোধিত পরিমাণ
                      </Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        value={formData.paymentInfo.paidAmount}
                        onChange={(e) => handleInputChange('paymentInfo.paidAmount', e.target.value)}
                        placeholder="পরিশোধিত পরিমাণ লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueAmount" className="text-gray-700 font-medium">
                        বাকি পরিমাণ
                      </Label>
                      <Input
                        id="dueAmount"
                        type="number"
                        value={formData.paymentInfo.dueAmount}
                        onChange={(e) => handleInputChange('paymentInfo.dueAmount', e.target.value)}
                        placeholder="বাকি পরিমাণ লিখুন"
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">অতিরিক্ত তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-gray-700 font-medium">
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        type="url"
                        value={formData.socialInfo.facebook}
                        onChange={(e) => handleInputChange('socialInfo.facebook', e.target.value)}
                        placeholder="Facebook প্রোফাইল লিঙ্ক"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-gray-700 font-medium">
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        type="url"
                        value={formData.socialInfo.linkedin}
                        onChange={(e) => handleInputChange('socialInfo.linkedin', e.target.value)}
                        placeholder="LinkedIn প্রোফাইল লিঙ্ক"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github" className="text-gray-700 font-medium">
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        type="url"
                        value={formData.socialInfo.github}
                        onChange={(e) => handleInputChange('socialInfo.github', e.target.value)}
                        placeholder="GitHub প্রোফাইল লিঙ্ক"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-gray-700 font-medium">
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        type="url"
                        value={formData.socialInfo.twitter}
                        onChange={(e) => handleInputChange('socialInfo.twitter', e.target.value)}
                        placeholder="Twitter প্রোফাইল লিঙ্ক"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website" className="text-gray-700 font-medium">
                        ওয়েবসাইট
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.socialInfo.website}
                        onChange={(e) => handleInputChange('socialInfo.website', e.target.value)}
                        placeholder="ব্যক্তিগত ওয়েবসাইট লিঙ্ক"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes" className="text-gray-700 font-medium">
                        নোট
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="অতিরিক্ত নোট লিখুন"
                        className="bg-white border-gray-300"
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 text-sm sm:text-base"
            >
              {getStatusText('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {student ? 'আপডেট' : 'তৈরি করুন'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
