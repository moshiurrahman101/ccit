'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  GraduationCap, 
  MapPin, 
  CreditCard, 
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/dashboard/RoleGuard';

interface Batch {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: string;
  isActive: boolean;
}

interface StudentFormData {
  // Basic Information (Required)
  name: string;
  email: string;
  phone: string;
  password: string;
  batchId: string;
  status: 'active' | 'inactive';
  
  // Personal Information (Optional)
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  nid: string;
  
  // Address Information (Optional)
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  
  // Emergency Contact (Optional)
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
  };
  
  // Education Information (Optional)
  education: {
    institution: string;
    degree: string;
    major: string;
    graduationYear: string;
    gpa: string;
  };
  
  // Social Information (Optional)
  socialInfo: {
    facebook: string;
    linkedin: string;
    github: string;
    twitter: string;
    website: string;
  };
  
  // Payment Information (Optional)
  paymentInfo: {
    method: 'cash' | 'bank_transfer' | 'mobile_banking' | 'card';
    number: string;
    transactionId: string;
    paidAmount: number;
    dueAmount: number;
    lastPaymentDate: string;
    status: 'paid' | 'partial' | 'due' | 'overdue';
  };
  
  // Additional Information (Optional)
  notes: string;
  isVerified: boolean;
}

const steps = [
  { id: 1, title: 'মূল তথ্য', description: 'শিক্ষার্থীর প্রাথমিক তথ্য', icon: User },
  { id: 2, title: 'ব্যক্তিগত তথ্য', description: 'ব্যক্তিগত বিবরণ', icon: FileText },
  { id: 3, title: 'ঠিকানা', description: 'বাসস্থান ও যোগাযোগ', icon: MapPin },
  { id: 4, title: 'শিক্ষাগত যোগ্যতা', description: 'শিক্ষা সংক্রান্ত তথ্য', icon: GraduationCap },
  { id: 5, title: 'পেমেন্ট', description: 'ফি ও পেমেন্ট তথ্য', icon: CreditCard },
  { id: 6, title: 'সম্পূর্ণ', description: 'তথ্য যাচাই ও সংরক্ষণ', icon: Check }
];

export default function AddStudentPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<StudentFormData>({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    password: '123456',
    batchId: '',
    status: 'active',
    
    // Personal Information
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'A+',
    nid: '',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Bangladesh',
      postalCode: ''
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: ''
    },
    
    // Education Information
    education: {
      institution: '',
      degree: '',
      major: '',
      graduationYear: '',
      gpa: ''
    },
    
    // Social Information
    socialInfo: {
      facebook: '',
      linkedin: '',
      github: '',
      twitter: '',
      website: ''
    },
    
    // Payment Information
    paymentInfo: {
      method: 'cash',
      number: '',
      transactionId: '',
      paidAmount: 0,
      dueAmount: 0,
      lastPaymentDate: '',
      status: 'due'
    },
    
    // Additional Information
    notes: '',
    isVerified: false
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
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
      toast.error('ব্যাচ লোড করতে সমস্যা হয়েছে');
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StudentFormData] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Information validation
      if (!formData.name.trim()) newErrors.name = 'নাম প্রয়োজন';
      if (!formData.email.trim()) {
        newErrors.email = 'ইমেইল প্রয়োজন';
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        newErrors.email = 'সঠিক ইমেইল ঠিকানা দিন';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'ফোন নম্বর প্রয়োজন';
      } else if (!/^(\+88)?01[3-9]\d{8}$/.test(formData.phone)) {
        newErrors.phone = 'সঠিক ফোন নম্বর দিন';
      }
      if (!formData.batchId) newErrors.batchId = 'ব্যাচ নির্বাচন করুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || '';
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('শিক্ষার্থী সফলভাবে যোগ করা হয়েছে');
        router.push('/dashboard/students');
      } else {
        toast.error(data.error || 'শিক্ষার্থী যোগ করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">মূল তথ্য</h3>
              <p className="text-sm text-gray-600">শিক্ষার্থীর প্রাথমিক তথ্য দিন</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">নাম *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="শিক্ষার্থীর পূর্ণ নাম"
                  className="bg-white border-gray-300"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">ইমেইল *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="student@example.com"
                  className="bg-white border-gray-300"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">ফোন নম্বর *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="bg-white border-gray-300"
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="পাসওয়ার্ড"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchId" className="text-gray-700 font-medium">ব্যাচ *</Label>
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
                        {batch.name} ({batch.currentStudents}/{batch.maxStudents})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.batchId && <p className="text-red-500 text-sm">{errors.batchId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-700 font-medium">অবস্থা</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="অবস্থা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="active">{getStatusText('active')}</SelectItem>
                    <SelectItem value="inactive">{getStatusText('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">ব্যক্তিগত তথ্য</h3>
              <p className="text-sm text-gray-600">ব্যক্তিগত বিবরণ (ঐচ্ছিক)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">জন্ম তারিখ</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-700 font-medium">লিঙ্গ</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="male">পুরুষ</SelectItem>
                    <SelectItem value="female">মহিলা</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="text-gray-700 font-medium">রক্তের গ্রুপ</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => handleInputChange('bloodGroup', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" />
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

              <div className="space-y-2">
                <Label htmlFor="nid" className="text-gray-700 font-medium">জাতীয় পরিচয়পত্র নম্বর</Label>
                <Input
                  id="nid"
                  value={formData.nid}
                  onChange={(e) => handleInputChange('nid', e.target.value)}
                  placeholder="জাতীয় পরিচয়পত্র নম্বর"
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">ঠিকানা তথ্য</h3>
              <p className="text-sm text-gray-600">বাসস্থান ও যোগাযোগের ঠিকানা (ঐচ্ছিক)</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address.street" className="text-gray-700 font-medium">রাস্তা/বাড়ি নম্বর</Label>
                <Input
                  id="address.street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="রাস্তা/বাড়ি নম্বর"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.city" className="text-gray-700 font-medium">শহর</Label>
                  <Input
                    id="address.city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="শহর"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.state" className="text-gray-700 font-medium">জেলা</Label>
                  <Input
                    id="address.state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    placeholder="জেলা"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.country" className="text-gray-700 font-medium">দেশ</Label>
                  <Input
                    id="address.country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    placeholder="দেশ"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.postalCode" className="text-gray-700 font-medium">পোস্টাল কোড</Label>
                  <Input
                    id="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    placeholder="পোস্টাল কোড"
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">জরুরি যোগাযোগ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.name" className="text-gray-700 font-medium">নাম</Label>
                    <Input
                      id="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                      placeholder="জরুরি যোগাযোগের নাম"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.relationship" className="text-gray-700 font-medium">সম্পর্ক</Label>
                    <Input
                      id="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                      placeholder="সম্পর্ক"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.phone" className="text-gray-700 font-medium">ফোন</Label>
                    <Input
                      id="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                      placeholder="ফোন নম্বর"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.email" className="text-gray-700 font-medium">ইমেইল</Label>
                    <Input
                      id="emergencyContact.email"
                      type="email"
                      value={formData.emergencyContact.email}
                      onChange={(e) => handleInputChange('emergencyContact.email', e.target.value)}
                      placeholder="ইমেইল"
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">শিক্ষাগত যোগ্যতা</h3>
              <p className="text-sm text-gray-600">শিক্ষা সংক্রান্ত তথ্য (ঐচ্ছিক)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education.institution" className="text-gray-700 font-medium">শিক্ষা প্রতিষ্ঠান</Label>
                <Input
                  id="education.institution"
                  value={formData.education.institution}
                  onChange={(e) => handleInputChange('education.institution', e.target.value)}
                  placeholder="শিক্ষা প্রতিষ্ঠানের নাম"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education.degree" className="text-gray-700 font-medium">ডিগ্রি</Label>
                <Input
                  id="education.degree"
                  value={formData.education.degree}
                  onChange={(e) => handleInputChange('education.degree', e.target.value)}
                  placeholder="ডিগ্রি"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education.major" className="text-gray-700 font-medium">বিষয়</Label>
                <Input
                  id="education.major"
                  value={formData.education.major}
                  onChange={(e) => handleInputChange('education.major', e.target.value)}
                  placeholder="বিষয়"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education.graduationYear" className="text-gray-700 font-medium">স্নাতক বছর</Label>
                <Input
                  id="education.graduationYear"
                  value={formData.education.graduationYear}
                  onChange={(e) => handleInputChange('education.graduationYear', e.target.value)}
                  placeholder="স্নাতক বছর"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education.gpa" className="text-gray-700 font-medium">জিপিএ</Label>
                <Input
                  id="education.gpa"
                  value={formData.education.gpa}
                  onChange={(e) => handleInputChange('education.gpa', e.target.value)}
                  placeholder="জিপিএ"
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">পেমেন্ট তথ্য</h3>
              <p className="text-sm text-gray-600">ফি ও পেমেন্ট সংক্রান্ত তথ্য (ঐচ্ছিক)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentInfo.method" className="text-gray-700 font-medium">পেমেন্ট পদ্ধতি</Label>
                <Select
                  value={formData.paymentInfo.method}
                  onValueChange={(value) => handleInputChange('paymentInfo.method', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="cash">নগদ</SelectItem>
                    <SelectItem value="bank_transfer">ব্যাংক ট্রান্সফার</SelectItem>
                    <SelectItem value="mobile_banking">মোবাইল ব্যাংকিং</SelectItem>
                    <SelectItem value="card">কার্ড</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo.number" className="text-gray-700 font-medium">পেমেন্ট নম্বর</Label>
                <Input
                  id="paymentInfo.number"
                  value={formData.paymentInfo.number}
                  onChange={(e) => handleInputChange('paymentInfo.number', e.target.value)}
                  placeholder="পেমেন্ট নম্বর"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo.transactionId" className="text-gray-700 font-medium">ট্রানজেকশন আইডি</Label>
                <Input
                  id="paymentInfo.transactionId"
                  value={formData.paymentInfo.transactionId}
                  onChange={(e) => handleInputChange('paymentInfo.transactionId', e.target.value)}
                  placeholder="ট্রানজেকশন আইডি"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo.paidAmount" className="text-gray-700 font-medium">পরিশোধিত পরিমাণ</Label>
                <Input
                  id="paymentInfo.paidAmount"
                  type="number"
                  value={formData.paymentInfo.paidAmount}
                  onChange={(e) => handleInputChange('paymentInfo.paidAmount', parseFloat(e.target.value) || 0)}
                  placeholder="পরিশোধিত পরিমাণ"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo.dueAmount" className="text-gray-700 font-medium">বাকি পরিমাণ</Label>
                <Input
                  id="paymentInfo.dueAmount"
                  type="number"
                  value={formData.paymentInfo.dueAmount}
                  onChange={(e) => handleInputChange('paymentInfo.dueAmount', parseFloat(e.target.value) || 0)}
                  placeholder="বাকি পরিমাণ"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo.lastPaymentDate" className="text-gray-700 font-medium">শেষ পেমেন্ট তারিখ</Label>
                <Input
                  id="paymentInfo.lastPaymentDate"
                  type="date"
                  value={formData.paymentInfo.lastPaymentDate}
                  onChange={(e) => handleInputChange('paymentInfo.lastPaymentDate', e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo.status" className="text-gray-700 font-medium">পেমেন্ট অবস্থা</Label>
                <Select
                  value={formData.paymentInfo.status}
                  onValueChange={(value) => handleInputChange('paymentInfo.status', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="পেমেন্ট অবস্থা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="paid">পরিশোধিত</SelectItem>
                    <SelectItem value="partial">আংশিক</SelectItem>
                    <SelectItem value="due">বাকি</SelectItem>
                    <SelectItem value="overdue">মেয়াদোত্তীর্ণ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">তথ্য যাচাই</h3>
              <p className="text-sm text-gray-600">তথ্য পর্যালোচনা করুন এবং সংরক্ষণ করুন</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">মূল তথ্য</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">নাম:</span> {formData.name || 'নির্দিষ্ট করা হয়নি'}</p>
                    <p><span className="font-medium">ইমেইল:</span> {formData.email || 'নির্দিষ্ট করা হয়নি'}</p>
                    <p><span className="font-medium">ফোন:</span> {formData.phone || 'নির্দিষ্ট করা হয়নি'}</p>
                    <p><span className="font-medium">ব্যাচ:</span> {batches.find(b => b._id === formData.batchId)?.name || 'নির্দিষ্ট করা হয়নি'}</p>
                    <p><span className="font-medium">অবস্থা:</span> {getStatusText(formData.status)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">ব্যক্তিগত তথ্য</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">জন্ম তারিখ:</span> {formData.dateOfBirth || 'নির্দিষ্ট করা হয়নি'}</p>
                    <p><span className="font-medium">লিঙ্গ:</span> {formData.gender === 'male' ? 'পুরুষ' : formData.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}</p>
                    <p><span className="font-medium">রক্তের গ্রুপ:</span> {formData.bloodGroup || 'নির্দিষ্ট করা হয়নি'}</p>
                    <p><span className="font-medium">এনআইডি:</span> {formData.nid || 'নির্দিষ্ট করা হয়নি'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                  />
                  <Label htmlFor="isVerified" className="text-gray-700">
                    {getStatusText('verified')}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700 font-medium">নোট</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="অতিরিক্ত নোট"
                  className="bg-white border-gray-300"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">অনুমতি নেই</h2>
              <p className="text-gray-600">আপনি এই পেজে অ্যাক্সেস করতে পারবেন না।</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-2xl font-bold text-gray-900">নতুন শিক্ষার্থী যোগ করুন</h1>
                <p className="text-gray-600">ধাপে ধাপে শিক্ষার্থীর তথ্য দিন</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      ${isActive ? 'bg-orange-500 text-white' : 
                        isCompleted ? 'bg-green-500 text-white' : 
                        'bg-gray-200 text-gray-600'}
                    `}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-medium ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            পূর্ববর্তী
          </Button>

          <div className="flex space-x-4">
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
              >
                পরবর্তী
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    সংরক্ষণ করুন
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
