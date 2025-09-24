'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, ArrowLeft, Link, Hash, Globe } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import ImageUpload from '@/components/blog/ImageUpload';
import SEOPreview from '@/components/blog/SEOPreview';
import { toast } from 'sonner';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export default function NewBlogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [customSlug, setCustomSlug] = useState('');
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: [],
    status: 'draft',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    }
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setCustomSlug(slug);
    }
  }, [formData.title, autoSlug]);

  // Auto-generate meta title from title
  useEffect(() => {
    if (!formData.seo.metaTitle && formData.title) {
      handleInputChange('seo.metaTitle', formData.title);
    }
  }, [formData.title]);

  // Auto-generate meta description from excerpt
  useEffect(() => {
    if (!formData.seo.metaDescription && formData.excerpt) {
      handleInputChange('seo.metaDescription', formData.excerpt);
    }
  }, [formData.excerpt]);

  const categories = [
    'প্রোগ্রামিং',
    'ওয়েব ডেভেলপমেন্ট',
    'মোবাইল অ্যাপ',
    'ডেটা সায়েন্স',
    'আর্টিফিশিয়াল ইন্টেলিজেন্স',
    'সাইবার সিকিউরিটি',
    'নেটওয়ার্কিং',
    'অন্যান্য'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BlogFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'blog-images');

    const response = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      return data.url;
    } else {
      throw new Error(data.error || 'Failed to upload image');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(keyword => keyword !== keywordToRemove)
      }
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    // Validate field lengths before submission
    if (formData.seo.metaTitle.length > 60) {
      toast.error('Meta title cannot exceed 60 characters');
      return;
    }
    if (formData.seo.metaDescription.length > 160) {
      toast.error('Meta description cannot exceed 160 characters');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        slug: customSlug,
        status,
        author: {
          name: 'Admin User', // You can get this from auth context
          email: 'admin@example.com'
        }
      };

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(status === 'published' ? 'Blog published successfully!' : 'Blog saved as draft!');
        router.push('/dashboard/blog');
      } else {
        console.error('Error creating blog:', data.error);
        if (data.details && Array.isArray(data.details)) {
          toast.error(data.details.join(', '));
        } else {
          toast.error(data.error || 'Failed to create blog');
        }
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-white/20 border-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">নতুন ব্লগ পোস্ট</h1>
            <p className="text-gray-600">একটি নতুন ব্লগ পোস্ট তৈরি করুন</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isLoading}
            className="bg-white/20 border-white/30"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            খসড়া সংরক্ষণ
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            প্রকাশ করুন
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>বেসিক তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  শিরোনাম *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="ব্লগ পোস্টের শিরোনাম লিখুন"
                  className="bg-white/20 border-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সংক্ষিপ্ত বিবরণ *
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="ব্লগ পোস্টের সংক্ষিপ্ত বিবরণ লিখুন"
                  rows={3}
                  className="bg-white/20 border-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ক্যাটেগরি *
                </label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-white/20 border-white/30">
                    <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ফিচার্ড ইমেজ
                </label>
                <ImageUpload
                  value={formData.featuredImage}
                  onChange={(url) => handleInputChange('featuredImage', url)}
                  placeholder="Click to upload featured image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="blog-url-slug"
                    className="bg-white/20 border-white/30"
                    disabled={autoSlug}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="bg-white/20 border-white/30"
                  >
                    <Hash className="w-4 h-4 mr-1" />
                    {autoSlug ? 'Auto' : 'Manual'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL: {window.location.origin}/blog/{customSlug}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>ব্লগ কন্টেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="আপনার ব্লগ পোস্ট লিখুন..."
                className="min-h-[500px]"
                onImageUpload={handleImageUpload}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>ট্যাগ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="ট্যাগ যোগ করুন"
                  className="bg-white/20 border-white/30"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  যোগ
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>SEO সেটিংস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মেটা টাইটেল
                </label>
                <Input
                  value={formData.seo.metaTitle}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 60) {
                      handleInputChange('seo.metaTitle', value);
                    }
                  }}
                  placeholder="SEO টাইটেল"
                  className="bg-white/20 border-white/30"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.seo.metaTitle.length}/60 characters
                  </p>
                  {formData.seo.metaTitle.length > 60 && (
                    <p className="text-xs text-red-500">Too long!</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মেটা বিবরণ
                </label>
                <Textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 160) {
                      handleInputChange('seo.metaDescription', value);
                    }
                  }}
                  placeholder="SEO বিবরণ"
                  rows={3}
                  className="bg-white/20 border-white/30"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.seo.metaDescription.length}/160 characters
                  </p>
                  {formData.seo.metaDescription.length > 160 && (
                    <p className="text-xs text-red-500">Too long!</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  কীওয়ার্ড
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="কীওয়ার্ড যোগ করুন"
                    className="bg-white/20 border-white/30"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword} size="sm">
                    যোগ
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.seo.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Preview */}
          <SEOPreview
            title={formData.title}
            metaTitle={formData.seo.metaTitle}
            metaDescription={formData.seo.metaDescription}
            slug={customSlug}
            featuredImage={formData.featuredImage}
            category={formData.category}
            tags={formData.tags}
          />

          {/* Preview */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>প্রিভিউ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  শিরোনাম: {formData.title || 'শিরোনাম যোগ করুন'}
                </p>
                <p className="text-sm text-gray-600">
                  ক্যাটেগরি: {formData.category || 'ক্যাটেগরি নির্বাচন করুন'}
                </p>
                <p className="text-sm text-gray-600">
                  ট্যাগ: {formData.tags.length} টি
                </p>
                <p className="text-sm text-gray-600">
                  শব্দ সংখ্যা: {formData.content.split(' ').length}
                </p>
                <p className="text-sm text-gray-600">
                  URL: {window.location.origin}/blog/{customSlug}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
