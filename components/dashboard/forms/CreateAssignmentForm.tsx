'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Calendar, Star, Upload, X, Image as ImageIcon, File } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
  assignment?: {
    _id: string;
    title: string;
    description: string;
    instructions?: string;
    dueDate: string;
    maxPoints: number;
    attachments?: string[];
  } | null;
}

export default function CreateAssignmentForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  batchId,
  assignment = null
}: CreateAssignmentFormProps) {
  const isEditMode = !!assignment;
  
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    instructions: assignment?.instructions || '',
    dueDate: assignment?.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
    maxPoints: assignment?.maxPoints || 100,
    attachments: assignment?.attachments || [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when assignment changes
  useEffect(() => {
    if (assignment && isOpen) {
      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        instructions: assignment.instructions || '',
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
        maxPoints: assignment.maxPoints || 100,
        attachments: assignment.attachments || []
      });
    } else if (!assignment && isOpen) {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        maxPoints: 100,
        attachments: []
      });
    }
  }, [assignment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Assignment title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.maxPoints < 1) newErrors.maxPoints = 'Max points must be at least 1';
    
    // Validate due date
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      
      if (dueDate <= now) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    try {
      setIsLoading(true);
      const token = document.cookie.split('auth-token=')[1]?.split(';')[0] || localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const url = `/api/mentor/batches/${batchId}/assignments`;
      const method = isEditMode ? 'PUT' : 'POST';
      const body = isEditMode 
        ? JSON.stringify({ assignmentId: assignment?._id, ...formData })
        : JSON.stringify(formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} assignment`);
      }
      
      toast.success(`Assignment ${isEditMode ? 'updated' : 'created'} successfully!`);
      onSuccess();
      handleClose();
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} assignment:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} assignment`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (!isEditMode) {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        maxPoints: 100,
        attachments: []
      });
    }
    setErrors({});
    onClose();
  };
  
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    setUploadingAttachment(true);
    setUploadProgress(0);

    try {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File size too large. Please upload a file smaller than 10MB.');
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'assignment-attachments');

      // Upload to Cloudinary
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const result = await response.json();
      
      if (result.success && result.url) {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, result.url]
        }));
        toast.success('File uploaded successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploadingAttachment(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditMode ? 'Edit Assignment' : 'Create Assignment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., React Component Assignment"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what students need to do..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Additional instructions for students..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPoints" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Max Points *
              </Label>
              <Input
                id="maxPoints"
                type="number"
                min="1"
                value={formData.maxPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 0 }))}
                className={errors.maxPoints ? 'border-red-500' : ''}
              />
              {errors.maxPoints && <p className="text-sm text-red-500">{errors.maxPoints}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="space-y-2">
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((attachment, index) => {
                    const isImage = attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) || attachment.includes('cloudinary.com');
                    const fileName = attachment.split('/').pop() || `Attachment ${index + 1}`;
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        {isImage ? (
                          <div className="w-12 h-12 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                            <img 
                              src={attachment} 
                              alt={fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-orange-100 flex items-center justify-center">
                            <File className="w-5 h-5 text-orange-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-orange-600 truncate block"
                          >
                            {fileName}
                          </a>
                          <p className="text-xs text-gray-500 truncate">{attachment}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.zip,.rar"
                  onChange={handleFileSelect}
                  disabled={uploadingAttachment}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={uploadingAttachment}
                >
                  {uploadingAttachment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                      Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File/Image to Cloudinary
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Supported: Images, PDF, DOC, DOCX, ZIP, RAR (Max 10MB)
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Assignment' : 'Create Assignment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
