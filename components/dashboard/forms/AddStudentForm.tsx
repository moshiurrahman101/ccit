'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

interface AddStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
}

export default function AddStudentForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  batchId 
}: AddStudentFormProps) {
  const [formData, setFormData] = useState({
    studentEmail: '',
    studentId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchMethod, setSearchMethod] = useState<'email' | 'id'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (searchMethod === 'email') {
      if (!formData.studentEmail.trim()) {
        newErrors.studentEmail = 'Student email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
        newErrors.studentEmail = 'Please enter a valid email address';
      }
    } else {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
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
      
      const response = await fetch(`/api/mentor/batches/${batchId}/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentEmail: searchMethod === 'email' ? formData.studentEmail : undefined,
          studentId: searchMethod === 'id' ? formData.studentId : undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add student');
      }
      
      const data = await response.json();
      toast.success(`Student ${data.student.name} enrolled successfully!`);
      onSuccess();
      handleClose();
      
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add student');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setFormData({
      studentEmail: '',
      studentId: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Student to Batch
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Method</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="email"
                    checked={searchMethod === 'email'}
                    onChange={(e) => setSearchMethod(e.target.value as 'email' | 'id')}
                    className="text-orange-600"
                  />
                  <span className="text-sm">By Email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="id"
                    checked={searchMethod === 'id'}
                    onChange={(e) => setSearchMethod(e.target.value as 'email' | 'id')}
                    className="text-orange-600"
                  />
                  <span className="text-sm">By Student ID</span>
                </label>
              </div>
            </div>
            
            {searchMethod === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="studentEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Student Email *
                </Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                  placeholder="student@example.com"
                  className={errors.studentEmail ? 'border-red-500' : ''}
                />
                {errors.studentEmail && <p className="text-sm text-red-500">{errors.studentEmail}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="studentId" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student ID *
                </Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                  placeholder="Student ID"
                  className={errors.studentId ? 'border-red-500' : ''}
                />
                {errors.studentId && <p className="text-sm text-red-500">{errors.studentId}</p>}
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
                  Adding...
                </>
              ) : (
                'Add Student'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
