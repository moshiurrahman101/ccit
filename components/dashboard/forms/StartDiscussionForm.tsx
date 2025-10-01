'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Pin } from 'lucide-react';
import { toast } from 'sonner';

interface StartDiscussionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
}

export default function StartDiscussionForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  batchId 
}: StartDiscussionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Discussion title is required';
    if (!formData.content.trim()) newErrors.content = 'Discussion content is required';
    
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
      
      const response = await fetch(`/api/mentor/batches/${batchId}/discussions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start discussion');
      }
      
      toast.success('Discussion started successfully!');
      onSuccess();
      handleClose();
      
    } catch (error) {
      console.error('Error starting discussion:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start discussion');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      isPinned: false
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start Discussion
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Project Ideas Discussion"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Discussion Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your discussion topic here..."
              rows={6}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isPinned"
              checked={formData.isPinned}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
            />
            <Label htmlFor="isPinned" className="flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pin this discussion
            </Label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                'Start Discussion'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
