'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Search, Loader2, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Step1BasicInfo, Step2CourseDetails, Step3ScheduleCapacity, Step4SEOMarketing, Step5Finalize } from './BatchFormSteps';

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

interface BatchFormProps {
  batch?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const batchSchema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  description: z.string().min(1, 'Description is required'),
  coverPhoto: z.string().optional(),
  courseType: z.enum(['online', 'offline']),
  regularPrice: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0, 'Discount price must be positive').optional(),
  mentorId: z.string().min(1, 'Mentor is required'),
  modules: z.array(z.object({
    title: z.string().min(1, 'Module title is required'),
    description: z.string().min(1, 'Module description is required'),
    duration: z.number().min(0.5, 'Duration must be at least 0.5 hours'),
    order: z.number().min(1, 'Order must be at least 1')
  })),
  whatYouWillLearn: z.array(z.string()),
  requirements: z.array(z.string()),
  features: z.array(z.string()),
  duration: z.number().min(1, 'Duration must be at least 1'),
  durationUnit: z.enum(['days', 'weeks', 'months', 'years']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  maxStudents: z.number().min(1, 'Max students must be at least 1'),
  currentStudents: z.number().min(0, 'Current students cannot be negative'),
  marketing: z.object({
    slug: z.string().min(1, 'Slug is required'),
    metaDescription: z.string().optional(),
    tags: z.array(z.string())
  }),
  status: z.enum(['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled'])
});

type FormData = z.infer<typeof batchSchema>;

const steps = [
  { id: 1, title: 'Basic Information', description: 'Batch name, cover photo, type, and pricing' },
  { id: 2, title: 'Study & Course Details', description: 'Syllabus, learning outcomes, and requirements' },
  { id: 3, title: 'Schedule & Capacity', description: 'Duration, dates, and student capacity' },
  { id: 4, title: 'SEO & Marketing', description: 'Slug, meta description, and tags' },
  { id: 5, title: 'Finalize', description: 'Review and publish or save as draft' }
];

export default function BatchForm({ batch, isOpen, onClose, onSuccess }: BatchFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorSearch, setMentorSearch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    coverPhoto: '',
    courseType: 'online',
    regularPrice: 0,
    discountPrice: undefined,
    mentorId: '',
    modules: [],
    whatYouWillLearn: [],
    requirements: [],
    features: [],
    duration: 1,
    durationUnit: 'months',
    startDate: '',
    endDate: '',
    maxStudents: 30,
    currentStudents: 0,
    marketing: {
      slug: '',
      metaDescription: '',
      tags: []
    },
    status: 'draft'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when batch prop changes
  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || '',
        description: batch.description || '',
        coverPhoto: batch.coverPhoto || '',
        courseType: batch.courseType || 'online',
        regularPrice: batch.regularPrice || 0,
        discountPrice: batch.discountPrice,
        mentorId: batch.mentorId?._id || batch.mentorId || '',
        modules: batch.modules || [],
        whatYouWillLearn: batch.whatYouWillLearn || [],
        requirements: batch.requirements || [],
        features: batch.features || [],
        duration: batch.duration || 1,
        durationUnit: batch.durationUnit || 'months',
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
        maxStudents: batch.maxStudents || 30,
        currentStudents: batch.currentStudents || 0,
        marketing: {
          slug: batch.marketing?.slug || '',
          metaDescription: batch.marketing?.metaDescription || '',
          tags: batch.marketing?.tags || []
        },
        status: batch.status || 'draft'
      });
      
      if (batch.mentorId) {
        setSelectedMentor(batch.mentorId);
      }
    }
  }, [batch]);

  // Search mentors
  useEffect(() => {
    const searchMentors = async () => {
      if (mentorSearch.length < 2) {
        setMentors([]);
        return;
      }

      try {
        const response = await fetch(`/api/mentors/search?q=${encodeURIComponent(mentorSearch)}&limit=10`);
        const data = await response.json();
        setMentors(data.mentors || []);
      } catch (error) {
        console.error('Error searching mentors:', error);
      }
    };

    const timeoutId = setTimeout(searchMentors, 300);
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentValue = prev[parent as keyof FormData] as Record<string, any>;
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
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof FormData] as string[], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof FormData] as string[]).filter((_, i) => i !== index)
    }));
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', description: '', duration: 1, order: prev.modules.length + 1 }]
    }));
  };

  const updateModule = (index: number, field: string, value: any) => {
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
      const url = batch ? `/api/batches/${batch._id}` : '/api/batches';
      const method = batch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(batch ? 'Batch updated successfully' : 'Batch created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to save batch');
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error('Failed to save batch');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      formData: {
        ...formData,
        coverPhoto: formData.coverPhoto || '',
        marketing: {
          ...formData.marketing,
          metaDescription: formData.marketing?.metaDescription || '',
          slug: formData.marketing?.slug || ''
        }
      },
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {batch ? 'Edit Batch' : 'Create New Batch'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
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

        <div className="mb-4">
          <h3 className="text-lg font-semibold">{steps[currentStep - 1].title}</h3>
          <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
        </div>

        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {batch ? 'Update Batch' : 'Create Batch'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}