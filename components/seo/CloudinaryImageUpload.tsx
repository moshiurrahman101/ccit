'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Wand2,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface CloudinaryImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  className?: string;
  label?: string;
  description?: string;
}

export function CloudinaryImageUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved,
  className = '',
  label = 'Upload Image',
  description = 'Upload an image to Cloudinary'
}: CloudinaryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    uploadToCloudinary(file);
  };

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'seo-images');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload via our API endpoint
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Use the main URL from the response (the uploaded image)
        const imageUrl = result.url;
        console.log('Upload result:', result);
        console.log('Using image URL:', imageUrl);
        onImageUploaded(imageUrl);
        
        // Save image metadata to database
        try {
          await fetch('/api/analytics/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: imageUrl,
              filename: result.data?.public_id?.split('/').pop() || 'image',
              publicId: result.data?.public_id,
              format: result.data?.format,
              size: result.data?.bytes,
              isCloudinary: true
            }),
          });
        } catch (dbError) {
          console.error('Error saving image metadata:', dbError);
          // Don't fail the upload if database save fails
        }
        
        toast.success('Image uploaded successfully!');
        
        // Clear preview
        setPreviewUrl(null);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;
    
    try {
      // If it's a Cloudinary image, delete it from Cloudinary too
      if (currentImageUrl.includes('cloudinary.com')) {
        await deleteFromCloudinary(currentImageUrl);
      }
      
      onImageRemoved?.();
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      // Still call the callback even if Cloudinary deletion fails
      onImageRemoved?.();
      toast.success('Image removed from form');
    }
  };

  const deleteFromCloudinary = async (imageUrl: string) => {
    try {
      // Extract public_id from Cloudinary URL
      const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\./);
      if (!publicIdMatch) {
        throw new Error('Invalid Cloudinary URL');
      }
      
      const publicId = publicIdMatch[1];
      
      // Call our API to delete from Cloudinary
      const response = await fetch('/api/upload/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  };

  const copyImageUrl = () => {
    if (currentImageUrl) {
      navigator.clipboard.writeText(currentImageUrl);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const openImageInNewTab = () => {
    if (currentImageUrl) {
      window.open(currentImageUrl, '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload to Cloudinary
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {currentImageUrl && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyImageUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openImageInNewTab}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Image Display */}
      {currentImageUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Current Image
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700"
                    title="Change Image"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 hover:text-red-700"
                    title="Remove Image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="relative group">
                <img 
                  src={currentImageUrl} 
                  alt="Current OG image"
                  className="w-full h-32 object-cover rounded border transition-opacity group-hover:opacity-90"
                  onError={(e) => {
                    console.log('Image load error for URL:', currentImageUrl);
                    e.currentTarget.src = '/placeholder-og.jpg';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', currentImageUrl);
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded border flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 text-black hover:bg-white"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Change
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600 font-mono break-all">
                  {currentImageUrl}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Optimized for social media (1200×630)</span>
                  {currentImageUrl.includes('cloudinary.com') && (
                    <Badge variant="outline" className="text-xs">
                      Cloudinary
                    </Badge>
                  )}
                </div>
                {/* Debug info */}
                <div className="text-xs text-blue-600">
                  Debug: Image URL length: {currentImageUrl?.length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                <ImageIcon className="h-3 w-3" />
                Preview
              </Badge>
              <img 
                src={previewUrl} 
                alt="Preview"
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
