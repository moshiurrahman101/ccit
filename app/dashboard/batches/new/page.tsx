'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Step1BasicInfo, Step2CourseDetails, Step3ScheduleCapacity, Step4SEOMarketing, Step5Finalize } from '@/components/dashboard/BatchFormSteps';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  designation: string;
  experience: number;
  expertise: string[];
  skills: string[];
  rating?: number;
  studentsCount?: number;
  coursesCount?: number;
}

const steps = [
  { id: 1, title: 'মূল তথ্য', description: 'ব্যাচের নাম, কভার ফটো, ধরন এবং মূল্য' },
  { id: 2, title: 'কোর্সের বিবরণ', description: 'সিলেবাস, শেখার ফলাফল এবং প্রয়োজনীয়তা' },
  { id: 3, title: 'সময়সূচী ও ধারণক্ষমতা', description: 'সময়কাল, তারিখ এবং শিক্ষার্থী ধারণক্ষমতা' },
  { id: 4, title: 'এসইও ও মার্কেটিং', description: 'স্লাগ, মেটা বর্ণনা এবং ট্যাগ' },
  { id: 5, title: 'সমাপ্তি', description: 'পর্যালোচনা এবং প্রকাশ বা খসড়া হিসেবে সংরক্ষণ' }
];

export default function NewBatchPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorSearch, setMentorSearch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverPhoto: '',
    courseType: 'online' as 'online' | 'offline',
    regularPrice: 0,
    discountPrice: undefined as number | undefined,
    mentorId: '',
    modules: [] as Array<{
      title: string;
      description: string;
      duration: number;
      order: number;
    }>,
    whatYouWillLearn: [] as string[],
    requirements: [] as string[],
    features: [] as string[],
    duration: 1,
    durationUnit: 'months' as 'days' | 'weeks' | 'months' | 'years',
    startDate: '',
    endDate: '',
    maxStudents: 30,
    currentStudents: 0,
    marketing: {
      slug: '',
      metaDescription: '',
      tags: [] as string[]
    },
    status: 'draft' as 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Search mentors
  useEffect(() => {
    const searchMentors = async () => {
      try {
        const response = await fetch(`/api/mentors/search?q=${encodeURIComponent(mentorSearch)}&limit=10`);
        const data = await response.json();
        setMentors(data.mentors || []);
      } catch (error) {
        console.error('Error searching mentors:', error);
      }
    };

    const timeoutId = setTimeout(searchMentors, mentorSearch.length > 0 ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [mentorSearch]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.marketing.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        marketing: { ...prev.marketing, slug }
      }));
    }
  }, [formData.name]);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentValue = prev[parent as keyof typeof prev] as Record<string, any>;
        return {
          ...prev,
          [parent]: { ...parentValue, [child]: value }
        };
      }
      return { ...prev, [field]: value };
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayInputChange = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const parentField = prev[parent as keyof typeof prev] as Record<string, unknown>;
          return {
            ...prev,
            [parent]: {
              ...parentField,
              [child]: [...(parentField[child] as string[] || []), value.trim()]
            }
          };
        } else {
          return {
            ...prev,
            [field]: [...(prev[field as keyof typeof prev] as string[] || []), value.trim()]
          };
        }
      });
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentField = prev[parent as keyof typeof prev] as Record<string, unknown>;
        return {
          ...prev,
          [parent]: {
            ...parentField,
            [child]: (parentField[child] as string[] || []).filter((_, i) => i !== index)
          }
        };
      } else {
        return {
          ...prev,
          [field]: (prev[field as keyof typeof prev] as string[] || []).filter((_, i) => i !== index)
        };
      }
    });
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', description: '', duration: 1, order: prev.modules.length + 1 }]
    }));
  };

  const updateModule = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'batch-covers');

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        handleInputChange('coverPhoto', data.url);
        toast.success('Cover photo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name) newErrors.name = 'Batch name is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.regularPrice || formData.regularPrice <= 0) newErrors.regularPrice = 'Valid price is required';
        if (!selectedMentor) newErrors.mentorId = 'Mentor selection is required';
        break;
      case 2:
        if (formData.modules.length === 0) newErrors.modules = 'At least one module is required';
        if (formData.whatYouWillLearn.length === 0) newErrors.whatYouWillLearn = 'At least one learning outcome is required';
        break;
      case 3:
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;
      case 4:
        if (!formData.marketing.slug) newErrors['marketing.slug'] = 'Slug is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('Please log in to create a batch');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Batch created successfully');
        router.push('/dashboard/batches');
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again');
        localStorage.removeItem('auth-token');
        router.push('/login');
      } else if (response.status === 403) {
        toast.error('You do not have permission to create batches');
      } else {
        toast.error(data.error || 'Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      errors,
      selectedMentor,
      mentors,
      mentorSearch,
      isUploading,
      onInputChange: handleInputChange,
      onArrayInputChange: handleArrayInputChange,
      onRemoveArrayItem: removeArrayItem,
      onAddModule: addModule,
      onUpdateModule: updateModule,
      onRemoveModule: removeModule,
      onFileUpload: handleFileUpload,
      onMentorSearchChange: setMentorSearch,
      onMentorSelect: setSelectedMentor,
      onSetMentors: setMentors
    };

    switch (currentStep) {
      case 1: return <Step1BasicInfo {...stepProps} />;
      case 2: return <Step2CourseDetails {...stepProps} />;
      case 3: return <Step3ScheduleCapacity {...stepProps} />;
      case 4: return <Step4SEOMarketing {...stepProps} />;
      case 5: return <Step5Finalize {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">নতুন ব্যাচ তৈরি করুন</h1>
              <p className="text-gray-600">নতুন ব্যাচ তৈরি করতে বিবরণ পূরণ করুন</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">{steps[currentStep - 1].title}</CardTitle>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                পূর্ববর্তী
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/batches')}
                >
                  বাতিল
                </Button>
                
                {currentStep < steps.length ? (
                  <Button onClick={nextStep}>
                    পরবর্তী
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    ব্যাচ তৈরি করুন
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
