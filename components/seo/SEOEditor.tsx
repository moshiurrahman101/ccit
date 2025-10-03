'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Eye, 
  Search,
  Globe,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { CloudinaryImageUpload } from './CloudinaryImageUpload';
import { ImageManager } from './ImageManager';

interface PageInfo {
  id: string;
  path: string;
  title: string;
  type: 'static' | 'dynamic';
  hasSEO: boolean;
  lastModified?: string;
  description?: string;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  robots: string;
}

interface SEOEditorProps {
  page: PageInfo;
  onSave: (data: SEOData) => void;
  onClose: () => void;
}

export function SEOEditor({ page, onSave, onClose }: SEOEditorProps) {
  const [seoData, setSeoData] = useState<SEOData>({
    title: `${page.title} - Creative Canvas IT`,
    description: page.description || `Learn more about ${page.title} at Creative Canvas IT`,
    keywords: '',
    ogTitle: `${page.title} - Creative Canvas IT`,
    ogDescription: page.description || `Learn more about ${page.title} at Creative Canvas IT`,
    ogImage: '/og-image.jpg',
    ogImageAlt: `${page.title} - Creative Canvas IT`,
    twitterTitle: `${page.title} - Creative Canvas IT`,
    twitterDescription: page.description || `Learn more about ${page.title} at Creative Canvas IT`,
    twitterImage: '/og-image.jpg',
    canonicalUrl: `https://creativecanvasit.com${page.path}`,
    robots: 'index,follow'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showImageManager, setShowImageManager] = useState(false);

  // Load existing SEO data when page changes
  useEffect(() => {
    loadExistingSEOData();
  }, [page.path]);

  const loadExistingSEOData = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch(`/api/analytics/pages?path=${encodeURIComponent(page.path)}`);
      const data = await response.json();
      
      if (data.success && data.page) {
        // Load existing SEO data
        setSeoData({
          title: data.page.title || `${page.title} - Creative Canvas IT`,
          description: data.page.description || page.description || `Learn more about ${page.title} at Creative Canvas IT`,
          keywords: data.page.keywords || '',
          ogTitle: data.page.ogTitle || `${page.title} - Creative Canvas IT`,
          ogDescription: data.page.ogDescription || page.description || `Learn more about ${page.title} at Creative Canvas IT`,
          ogImage: data.page.ogImage || '/og-image.jpg',
          ogImageAlt: data.page.ogImageAlt || `${page.title} - Creative Canvas IT`,
          twitterTitle: data.page.twitterTitle || `${page.title} - Creative Canvas IT`,
          twitterDescription: data.page.twitterDescription || page.description || `Learn more about ${page.title} at Creative Canvas IT`,
          twitterImage: data.page.twitterImage || '/og-image.jpg',
          canonicalUrl: data.page.canonicalUrl || `https://creativecanvasit.com${page.path}`,
          robots: data.page.robots || 'index,follow'
        });
      } else {
        // No existing data, keep default values
        console.log('No existing SEO data found for page:', page.path);
      }
    } catch (error) {
      console.error('Error loading SEO data:', error);
      // Keep default values on error
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(seoData);
      toast.success('SEO settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save SEO settings');
    } finally {
      setIsLoading(false);
    }
  };

  const generateOGImage = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const ogImageUrl = `${baseUrl}/api/og/auto?type=${page.type}&title=${encodeURIComponent(seoData.title)}&description=${encodeURIComponent(seoData.description)}&category=${encodeURIComponent(page.title)}`;
    
    setSeoData(prev => ({
      ...prev,
      ogImage: ogImageUrl,
      twitterImage: ogImageUrl
    }));
    
    toast.success('OG image generated automatically!');
  };

  const validateSEO = () => {
    const errors: string[] = [];
    
    if (!seoData.title) errors.push('Title is required');
    if (!seoData.description) errors.push('Description is required');
    if (seoData.description && seoData.description.length > 160) {
      errors.push('Description should be under 160 characters');
    }
    if (seoData.title && seoData.title.length > 60) {
      errors.push('Title should be under 60 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, 100 - (errors.length * 15))
    };
  };

  const validation = validateSEO();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">SEO Settings</h2>
          <p className="text-sm text-gray-600">
            Configure SEO for: <span className="font-medium">{page.path}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={validation.isValid ? "default" : "destructive"}>
            SEO Score: {validation.score}/100
          </Badge>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* SEO Form */}
      {isLoadingData ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading SEO data...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic SEO</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

        {/* Basic SEO Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={seoData.title}
                onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter page title"
              />
              <p className="text-xs text-gray-500">
                {seoData.title.length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={seoData.keywords}
                onChange={(e) => setSeoData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Meta Description</Label>
            <Textarea
              id="description"
              value={seoData.description}
              onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter meta description"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              {seoData.description.length}/160 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="canonical">Canonical URL</Label>
              <Input
                id="canonical"
                value={seoData.canonicalUrl}
                onChange={(e) => setSeoData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                placeholder="https://creativecanvasit.com/page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="robots">Robots Meta</Label>
              <Input
                id="robots"
                value={seoData.robots}
                onChange={(e) => setSeoData(prev => ({ ...prev, robots: e.target.value }))}
                placeholder="index,follow"
              />
            </div>
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="og-title">Open Graph Title</Label>
              <Input
                id="og-title"
                value={seoData.ogTitle}
                onChange={(e) => setSeoData(prev => ({ ...prev, ogTitle: e.target.value }))}
                placeholder="OG title for social sharing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-description">Open Graph Description</Label>
              <Textarea
                id="og-description"
                value={seoData.ogDescription}
                onChange={(e) => setSeoData(prev => ({ ...prev, ogDescription: e.target.value }))}
                placeholder="OG description for social sharing"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Open Graph Image</Label>
            
            {/* Cloudinary Upload */}
            <CloudinaryImageUpload
              currentImageUrl={seoData.ogImage}
              onImageUploaded={(imageUrl) => {
                setSeoData(prev => ({ 
                  ...prev, 
                  ogImage: imageUrl,
                  twitterImage: imageUrl // Auto-update Twitter image too
                }));
              }}
              onImageRemoved={() => {
                setSeoData(prev => ({ 
                  ...prev, 
                  ogImage: '/og-image.jpg',
                  twitterImage: '/og-image.jpg'
                }));
              }}
              label="Upload Custom Image"
              description="Upload a custom image to Cloudinary for better control"
            />

            {/* Manual URL Input */}
            <div className="space-y-2">
              <Label htmlFor="og-image-url">Or enter image URL manually</Label>
              <div className="flex gap-2">
                <Input
                  id="og-image-url"
                  value={seoData.ogImage}
                  onChange={(e) => setSeoData(prev => ({ ...prev, ogImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateOGImage}
                  className="whitespace-nowrap"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-image-alt">Image Alt Text</Label>
            <Input
              id="og-image-alt"
              value={seoData.ogImageAlt}
              onChange={(e) => setSeoData(prev => ({ ...prev, ogImageAlt: e.target.value }))}
              placeholder="Describe the image for accessibility"
            />
          </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Image Management</h3>
                    <p className="text-sm text-gray-600">Upload, manage, and select images for your page</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowImageManager(!showImageManager)}
                  >
                    {showImageManager ? 'Hide' : 'Show'} Image Library
                  </Button>
                </div>

                {showImageManager ? (
                  <ImageManager
                    currentImageUrl={seoData.ogImage}
                    onImageSelect={(imageUrl) => {
                      setSeoData(prev => ({ 
                        ...prev, 
                        ogImage: imageUrl,
                        twitterImage: imageUrl // Auto-update Twitter image too
                      }));
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <CloudinaryImageUpload
                      currentImageUrl={seoData.ogImage}
                      onImageUploaded={(imageUrl) => {
                        setSeoData(prev => ({ 
                          ...prev, 
                          ogImage: imageUrl,
                          twitterImage: imageUrl // Auto-update Twitter image too
                        }));
                      }}
                      onImageRemoved={() => {
                        setSeoData(prev => ({ 
                          ...prev, 
                          ogImage: '/og-image.jpg',
                          twitterImage: '/og-image.jpg'
                        }));
                      }}
                      label="Upload Open Graph Image"
                      description="Upload a custom image for social media sharing"
                    />

                    {/* Current Image Display */}
                    {seoData.ogImage && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                Current OG Image
                              </Badge>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowImageManager(true)}
                                >
                                  Browse Library
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const dynamicUrl = `/api/og/auto?type=static&title=${encodeURIComponent(seoData.title)}&description=${encodeURIComponent(seoData.description)}&category=${encodeURIComponent(page.path)}`;
                                    setSeoData(prev => ({ 
                                      ...prev, 
                                      ogImage: dynamicUrl,
                                      twitterImage: dynamicUrl
                                    }));
                                  }}
                                >
                                  <Wand2 className="h-4 w-4 mr-1" />
                                  Auto Generate
                                </Button>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <img 
                                src={seoData.ogImage} 
                                alt="Current OG image"
                                className="w-full h-32 object-cover rounded border"
                                onError={(e) => {
                                  console.log('SEO Editor image load error for URL:', seoData.ogImage);
                                  e.currentTarget.src = '/placeholder-og.jpg';
                                }}
                                onLoad={() => {
                                  console.log('SEO Editor image loaded successfully:', seoData.ogImage);
                                }}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600 font-mono break-all">
                                {seoData.ogImage}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Optimized for social media (1200×630)</span>
                                {seoData.ogImage.includes('cloudinary.com') && (
                                  <Badge variant="outline" className="text-xs">
                                    Cloudinary
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          {/* SEO Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {validation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>SEO Validation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>SEO Score</span>
                  <Badge variant={validation.score >= 80 ? "default" : "destructive"}>
                    {validation.score}/100
                  </Badge>
                </div>
                {validation.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-600">Issues:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Result Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Google Search Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                    {seoData.canonicalUrl}
                  </span>
                </div>
                <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
                  {seoData.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {seoData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Social Media Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded">
                <img 
                  src={seoData.ogImage} 
                  alt={seoData.ogImageAlt}
                  className="w-full h-32 object-cover rounded-t"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-og.jpg';
                  }}
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm">{seoData.ogTitle}</h4>
                  <p className="text-xs text-gray-600 mt-1">{seoData.ogDescription}</p>
                  <span className="text-xs text-gray-400">{seoData.canonicalUrl}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading || isLoadingData}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save SEO Settings'}
        </Button>
      </div>
    </div>
  );
}
