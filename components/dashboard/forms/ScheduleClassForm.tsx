'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Video, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
  courseType: 'online' | 'offline';
}

export default function ScheduleClassForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  batchId, 
  courseType 
}: ScheduleClassFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    location: '',
    isOnline: courseType === 'online'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Class title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    if (formData.isOnline && !formData.meetingLink.trim()) {
      newErrors.meetingLink = 'Meeting link is required for online classes';
    }
    
    if (!formData.isOnline && !formData.location.trim()) {
      newErrors.location = 'Location is required for offline classes';
    }
    
    // Validate time logic
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    // Validate date and time
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if the selected date is before today
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
      
      // If we have both date and time, validate the combined datetime
      if (formData.startTime && formData.date) {
        const selectedDateTime = new Date(`${formData.date}T${formData.startTime}`);
        if (selectedDateTime < now) {
          newErrors.date = 'Class time cannot be in the past';
        }
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/mentor/batches/${batchId}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule class');
      }
      
      toast.success('Class scheduled successfully!');
      onSuccess();
      handleClose();
      
    } catch (error) {
      console.error('Error scheduling class:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to schedule class');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      meetingLink: '',
      location: '',
      isOnline: courseType === 'online'
    });
    setErrors({});
    onClose();
  };
  
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // If changing start time and we have a date, check if the time is in the past
    if (field === 'startTime' && formData.date && value) {
      const selectedDateTime = new Date(`${formData.date}T${value}`);
      const now = new Date();
      
      if (selectedDateTime < now) {
        setErrors(prev => ({ ...prev, date: 'Class time cannot be in the past' }));
      } else {
        setErrors(prev => ({ ...prev, date: '' }));
      }
    }
  };

  const handleDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, date: value }));
    
    // Clear date error when user changes date
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
    
    // If we have a start time, re-validate the combined datetime
    if (formData.startTime && value) {
      const selectedDateTime = new Date(`${value}T${formData.startTime}`);
      const now = new Date();
      
      if (selectedDateTime < now) {
        setErrors(prev => ({ ...prev, date: 'Class time cannot be in the past' }));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Class
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Class Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Introduction to React"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Class description and topics to be covered..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className={errors.startTime ? 'border-red-500' : ''}
              />
              {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isOnline"
                checked={formData.isOnline}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOnline: checked }))}
              />
              <Label htmlFor="isOnline" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Online Class
              </Label>
            </div>
            
            {formData.isOnline ? (
              <div className="space-y-2">
                <Label htmlFor="meetingLink" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Meeting Link *
                </Label>
                <Input
                  id="meetingLink"
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://zoom.us/j/123456789"
                  className={errors.meetingLink ? 'border-red-500' : ''}
                />
                {errors.meetingLink && <p className="text-sm text-red-500">{errors.meetingLink}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., CCIT Office, Room 201"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                'Schedule Class'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
