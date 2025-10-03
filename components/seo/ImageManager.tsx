'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye,
  Download,
  Copy,
  ExternalLink,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { CloudinaryImageUpload } from './CloudinaryImageUpload';

interface ImageItem {
  id: string;
  url: string;
  publicId?: string;
  filename: string;
  size: number;
  format: string;
  uploadedAt: string;
  isCloudinary: boolean;
}

interface ImageManagerProps {
  onImageSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export function ImageManager({ onImageSelect, currentImageUrl, className = '' }: ImageManagerProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm]);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your database
      // For now, we'll simulate with localStorage
      const savedImages = localStorage.getItem('seo-images');
      if (savedImages) {
        setImages(JSON.parse(savedImages));
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterImages = () => {
    const filtered = images.filter(image =>
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.format.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredImages(filtered);
  };

  const handleImageUploaded = (imageUrl: string) => {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop()?.split('.')[0] || 'image';
    const format = imageUrl.split('.').pop() || 'jpg';
    
    const newImage: ImageItem = {
      id: Date.now().toString(),
      url: imageUrl,
      publicId: imageUrl.includes('cloudinary.com') ? extractPublicId(imageUrl) : undefined,
      filename,
      size: 0, // We don't have size info from URL
      format,
      uploadedAt: new Date().toISOString(),
      isCloudinary: imageUrl.includes('cloudinary.com')
    };

    const updatedImages = [newImage, ...images];
    setImages(updatedImages);
    localStorage.setItem('seo-images', JSON.stringify(updatedImages));
    
    // Auto-select the newly uploaded image
    onImageSelect(imageUrl);
    
    toast.success('Image uploaded and selected!');
  };

  const extractPublicId = (url: string): string | undefined => {
    const match = url.match(/\/v\d+\/(.+)\./);
    return match ? match[1] : undefined;
  };

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    toast.success('Image selected!');
  };

  const handleImageDelete = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    try {
      // If it's a Cloudinary image, delete from Cloudinary too
      if (image.isCloudinary && image.publicId) {
        await deleteFromCloudinary(image.publicId);
      }

      // Remove from local storage
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      localStorage.setItem('seo-images', JSON.stringify(updatedImages));
      
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const deleteFromCloudinary = async (publicId: string) => {
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
  };

  const handleBatchDelete = async () => {
    if (selectedImages.length === 0) return;

    try {
      // Delete selected images
      for (const imageId of selectedImages) {
        await handleImageDelete(imageId);
      }
      
      setSelectedImages([]);
      toast.success(`${selectedImages.length} images deleted successfully`);
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast.error('Failed to delete some images');
    }
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard!');
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Image Manager</h3>
          <p className="text-sm text-gray-600">Manage your uploaded images</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          {selectedImages.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedImages.length})
            </Button>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <CloudinaryImageUpload
        onImageUploaded={handleImageUploaded}
        label="Upload New Image"
        description="Upload a new image to add to your library"
      />

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredImages.length} images
        </Badge>
      </div>

      {/* Images Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-500 text-center">
              {searchTerm ? 'No images match your search.' : 'Upload your first image to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredImages.map((image) => (
            <Card 
              key={image.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentImageUrl === image.url ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Image Preview */}
                  <div className="relative group">
                    <img 
                      src={image.url} 
                      alt={image.filename}
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-og.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded border flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleImageSelect(image.url)}
                          className="bg-white/90 text-black hover:bg-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Select
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => copyImageUrl(image.url)}
                          className="bg-white/90 text-black hover:bg-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{image.filename}</h4>
                      <div className="flex items-center gap-1">
                        {image.isCloudinary && (
                          <Badge variant="outline" className="text-xs">
                            Cloudinary
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {image.format.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyImageUrl(image.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadImage(image.url, image.filename)}
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(image.url, '_blank')}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleImageDelete(image.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
