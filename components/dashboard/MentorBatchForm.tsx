'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ImageUpload from '@/components/ui/ImageUpload';
import MentorSearch from '@/components/ui/MentorSearch';
import { Loader2, BookOpen, Edit, X, Calendar, Users, DollarSign, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusText } from '@/lib/utils/statusDictionary';

interface Batch {
  _id?: string;
  name: string;
  description?: string;
  courseType: 'online' | 'offline';
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  currency: string;
  discountPercentage?: number;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents?: number;
  prerequisites: string[];
  modules: {
    title: string;
    description: string;
    duration: number;
    order: number;
  }[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  isMandatory: boolean;
  instructor: {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatar?: string;
  };
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  slug: string;
  metaDescription?: string;
}

interface BatchFormProps {
  batch?: Batch | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MentorBatchForm({ 
  batch, 
  isOpen, 
  onClose, 
  onSuccess 
}: BatchFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: 'online' as 'online' | 'offline',
    duration: 3,
    durationUnit: 'months' as 'days' | 'weeks' | 'months' | 'years',
    coverPhoto: '',
    regularPrice: 0,
    discountPrice: 0,
    currency: 'BDT',
    discountPercentage: 0,
    startDate: '',
    endDate: '',
    maxStudents: 30,
    prerequisites: [] as string[],
    modules: [] as { title: string; description: string; duration: number; order: number }[],
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    isActive: true,
    isMandatory: true,
    instructor: {
      _id: '',
      name: '',
      email: '',
      phone: '',
      bio: '',
      avatar: ''
    },
    tags: [] as string[],
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    features: [] as string[],
    requirements: [] as string[],
    whatYouWillLearn: [] as string[],
    slug: '',
    metaDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newModule, setNewModule] = useState({ title: '', description: '', duration: 0, order: 0 });
  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearningOutcome, setNewLearningOutcome] = useState('');

  const isEdit = !!batch;
  const totalSteps = 6;

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || '',
        description: batch.description || '',
        courseType: batch.courseType || 'online',
        duration: batch.duration || 3,
        durationUnit: batch.durationUnit || 'months',
        coverPhoto: batch.coverPhoto || '',
        regularPrice: batch.regularPrice || 0,
        discountPrice: batch.discountPrice || 0,
        currency: 'BDT',
        discountPercentage: batch.discountPercentage || 0,
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
        maxStudents: batch.maxStudents || 30,
        prerequisites: batch.prerequisites || [],
        modules: batch.modules || [],
        status: batch.status || 'upcoming',
        isActive: batch.isActive !== undefined ? batch.isActive : true,
        isMandatory: batch.isMandatory !== undefined ? batch.isMandatory : true,
        instructor: (batch.instructor as any) || {
          _id: '',
          name: '',
          email: '',
          phone: '',
          bio: '',
          avatar: ''
        },
        tags: batch.tags || [],
        level: batch.level || 'beginner',
        features: batch.features || [],
        requirements: batch.requirements || [],
        whatYouWillLearn: batch.whatYouWillLearn || [],
        slug: batch.slug || '',
        metaDescription: batch.metaDescription || ''
      });
    }
  }, [batch]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !isEdit) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEdit]);

  // Calculate discount percentage
  useEffect(() => {
    if (formData.regularPrice > 0 && formData.discountPrice > 0 && formData.discountPrice < formData.regularPrice) {
      const percentage = Math.round(((formData.regularPrice - formData.discountPrice) / formData.regularPrice) * 100);
      setFormData(prev => ({ ...prev, discountPercentage: percentage }));
    } else {
      setFormData(prev => ({ ...prev, discountPercentage: 0 }));
    }
  }, [formData.regularPrice, formData.discountPrice]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Batch name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.regularPrice <= 0) newErrors.regularPrice = 'Regular price must be greater than 0';
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
        if (formData.maxStudents <= 0) newErrors.maxStudents = 'Max students must be greater than 0';
        break;
      case 4:
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Prepare data for API
      const apiData = {
        name: formData.name,
        description: formData.description,
        courseType: formData.courseType,
        duration: formData.duration,
        durationUnit: formData.durationUnit,
        coverPhoto: formData.coverPhoto,
        regularPrice: formData.regularPrice,
        discountPrice: formData.discountPrice > 0 ? formData.discountPrice : undefined,
        mentorId: formData.instructor._id, // This will be overridden by the API for mentors
        modules: formData.modules,
        whatYouWillLearn: formData.whatYouWillLearn,
        requirements: formData.requirements,
        features: formData.features,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxStudents: formData.maxStudents,
        currentStudents: batch?.currentStudents || 0,
        marketing: {
          slug: formData.slug,
          metaDescription: formData.metaDescription,
          tags: formData.tags
        },
        status: formData.status
      };

      const url = isEdit ? `/api/mentor/batches/${batch._id}` : '/api/mentor/batches';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save batch');
      }

      toast.success(isEdit ? 'Batch updated successfully!' : 'Batch created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save batch');
    } finally {
      setIsLoading(false);
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addModule = () => {
    if (newModule.title.trim() && newModule.description.trim() && newModule.duration > 0) {
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, { ...newModule, order: prev.modules.length + 1 }]
      }));
      setNewModule({ title: '', description: '', duration: 0, order: 0 });
    }
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addLearningOutcome = () => {
    if (newLearningOutcome.trim()) {
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, newLearningOutcome.trim()]
      }));
      setNewLearningOutcome('');
    }
  };

  const removeLearningOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Batch Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter batch name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseType">Course Type *</Label>
          <Select
            value={formData.courseType}
            onValueChange={(value: 'online' | 'offline') => setFormData(prev => ({ ...prev, courseType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter batch description"
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label>Cover Photo</Label>
        <ImageUpload
          value={formData.coverPhoto}
          onChange={(url) => setFormData(prev => ({ ...prev, coverPhoto: url }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="regularPrice">Regular Price (BDT) *</Label>
          <Input
            id="regularPrice"
            type="number"
            value={formData.regularPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, regularPrice: Number(e.target.value) }))}
            placeholder="0"
            className={errors.regularPrice ? 'border-red-500' : ''}
          />
          {errors.regularPrice && <p className="text-sm text-red-500">{errors.regularPrice}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountPrice">Discount Price (BDT)</Label>
          <Input
            id="discountPrice"
            type="number"
            value={formData.discountPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, discountPrice: Number(e.target.value) }))}
            placeholder="0"
          />
          {formData.discountPercentage > 0 && (
            <p className="text-sm text-green-600">
              {formData.discountPercentage}% discount
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Modules/Syllabus *</Label>
          <Button type="button" onClick={addModule} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Module
          </Button>
        </div>
        {errors.modules && <p className="text-sm text-red-500">{errors.modules}</p>}
        
        <div className="space-y-4">
          {formData.modules.map((module, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Module {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeModule(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={module.title}
                    onChange={(e) => {
                      const newModules = [...formData.modules];
                      newModules[index].title = e.target.value;
                      setFormData(prev => ({ ...prev, modules: newModules }));
                    }}
                    placeholder="Module title"
                  />
                </div>
                <div>
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    value={module.duration}
                    onChange={(e) => {
                      const newModules = [...formData.modules];
                      newModules[index].duration = Number(e.target.value);
                      setFormData(prev => ({ ...prev, modules: newModules }));
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-2">
                <Label>Description</Label>
                <Textarea
                  value={module.description}
                  onChange={(e) => {
                    const newModules = [...formData.modules];
                    newModules[index].description = e.target.value;
                    setFormData(prev => ({ ...prev, modules: newModules }));
                  }}
                  placeholder="Module description"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>New Module Title</Label>
              <Input
                value={newModule.title}
                onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter module title"
              />
            </div>
            <div>
              <Label>Duration (hours)</Label>
              <Input
                type="number"
                value={newModule.duration}
                onChange={(e) => setNewModule(prev => ({ ...prev, duration: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-2">
            <Label>Description</Label>
            <Textarea
              value={newModule.description}
              onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter module description"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>What Students Will Learn *</Label>
          <Button type="button" onClick={addLearningOutcome} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {errors.whatYouWillLearn && <p className="text-sm text-red-500">{errors.whatYouWillLearn}</p>}
        
        <div className="space-y-2">
          {formData.whatYouWillLearn.map((outcome, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm">• {outcome}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeLearningOutcome(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newLearningOutcome}
            onChange={(e) => setNewLearningOutcome(e.target.value)}
            placeholder="Enter learning outcome"
            onKeyPress={(e) => e.key === 'Enter' && addLearningOutcome()}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Requirements</Label>
          <Button type="button" onClick={addRequirement} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm">• {requirement}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRequirement(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            placeholder="Enter requirement"
            onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Features</Label>
          <Button type="button" onClick={addFeature} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm">• {feature}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Enter feature"
            onKeyPress={(e) => e.key === 'Enter' && addFeature()}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration *</Label>
          <div className="flex gap-2">
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
              placeholder="0"
            />
            <Select
              value={formData.durationUnit}
              onValueChange={(value: 'days' | 'weeks' | 'months' | 'years') => 
                setFormData(prev => ({ ...prev, durationUnit: value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxStudents">Max Students *</Label>
          <Input
            id="maxStudents"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: Number(e.target.value) }))}
            placeholder="30"
            className={errors.maxStudents ? 'border-red-500' : ''}
          />
          {errors.maxStudents && <p className="text-sm text-red-500">{errors.maxStudents}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          placeholder="batch-url-slug"
          className={errors.slug ? 'border-red-500' : ''}
        />
        {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
        <p className="text-sm text-gray-500">
          This will be used in the URL: /batches/{formData.slug}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Meta Description</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
          placeholder="Brief description for SEO"
          rows={3}
        />
        <p className="text-sm text-gray-500">
          {formData.metaDescription.length}/160 characters
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Tags</Label>
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Tag
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTag(index)}
                className="h-4 w-4 p-0 text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag"
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'upcoming' | 'ongoing' | 'completed' | 'cancelled') => 
            setFormData(prev => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Review Your Batch</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div><strong>Name:</strong> {formData.name}</div>
          <div><strong>Type:</strong> {formData.courseType}</div>
          <div><strong>Duration:</strong> {formData.duration} {formData.durationUnit}</div>
          <div><strong>Price:</strong> {formData.regularPrice} BDT</div>
          {formData.discountPrice > 0 && (
            <div><strong>Discount Price:</strong> {formData.discountPrice} BDT ({formData.discountPercentage}% off)</div>
          )}
          <div><strong>Max Students:</strong> {formData.maxStudents}</div>
          <div><strong>Start Date:</strong> {formData.startDate}</div>
          <div><strong>End Date:</strong> {formData.endDate}</div>
          <div><strong>Modules:</strong> {formData.modules.length}</div>
          <div><strong>Status:</strong> {getStatusText(formData.status)}</div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Batch' : 'Create New Batch'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index + 1} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= index + 1
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > index + 1 ? 'bg-orange-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {currentStep === 1 && 'Basic Information'}
            {currentStep === 2 && 'Study & Course Details'}
            {currentStep === 3 && 'Schedule & Capacity'}
            {currentStep === 4 && 'SEO & Marketing'}
            {currentStep === 5 && 'Finalize'}
          </h3>
          <p className="text-sm text-gray-600">
            {currentStep === 1 && 'Batch name, cover photo, type, and pricing'}
            {currentStep === 2 && 'Syllabus, learning outcomes, and requirements'}
            {currentStep === 3 && 'Duration, dates, and student capacity'}
            {currentStep === 4 && 'Slug, meta description, and tags'}
            {currentStep === 5 && 'Review and publish or save as draft'}
          </p>
        </div>

        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
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
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Batch' : 'Create Batch'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
