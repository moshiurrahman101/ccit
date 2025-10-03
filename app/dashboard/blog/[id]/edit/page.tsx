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
import SimpleRichTextEditor from '@/components/editor/SimpleRichTextEditor';
import FullScreenEditor from '@/components/editor/FullScreenEditor';
import ImageUpload from '@/components/blog/ImageUpload';
import SEOPreview from '@/components/blog/SEOPreview';
import SlugValidator from '@/components/blog/SlugValidator';
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

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  category: string;
  tags: string[];
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  views: number;
  likes: number;
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [autoSlug, setAutoSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState(false);
  const [blogId, setBlogId] = useState<string>('');
  const [isFullScreenEditorOpen, setIsFullScreenEditorOpen] = useState(false);
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

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setBlogId(id);
      fetchBlog(id);
    };
    loadParams();
  }, [params]);

  const fetchBlog = async (id: string) => {
    try {
      const response = await fetch(`/api/blogs/${id}`);
      const data = await response.json();

      if (response.ok) {
        const blog: Blog = data.blog;
        setFormData({
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          featuredImage: blog.featuredImage || '',
          category: blog.category,
          tags: blog.tags || [],
          status: blog.status,
          seo: {
            metaTitle: blog.seo?.metaTitle || '',
            metaDescription: blog.seo?.metaDescription || '',
            keywords: blog.seo?.keywords || []
          }
        });
        setCustomSlug(blog.slug);
      } else {
        toast.error('Failed to load blog');
        router.push('/dashboard/blog');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog');
      router.push('/dashboard/blog');
    } finally {
      setIsLoadingBlog(false);
    }
  };

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

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(keyword => keyword !== keywordToRemove)
      }
    }));
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

    // Validate slug availability for published blogs
    if (status === 'published' && customSlug && !slugAvailable) {
      toast.error('Please choose an available slug before publishing');
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

      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(status === 'published' ? 'Blog updated and published!' : 'Blog updated successfully!');
        router.push('/dashboard/blog');
      } else {
        console.error('Error updating blog:', data.error);
        if (data.details && Array.isArray(data.details)) {
          toast.error(data.details.join(', '));
        } else {
          toast.error(data.error || 'Failed to update blog');
        }
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingBlog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800">ব্লগ সম্পাদনা</h1>
            <p className="text-gray-600">ব্লগ পোস্ট সম্পাদনা করুন</p>
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

              <SlugValidator
                value={customSlug}
                onChange={setCustomSlug}
                autoGenerate={autoSlug}
                onToggleAutoGenerate={() => setAutoSlug(!autoSlug)}
                onValidationChange={setSlugAvailable}
                excludeId={blogId}
              />
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>ব্লগ কন্টেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleRichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="আপনার ব্লগ পোস্ট লিখুন..."
                className="min-h-[300px]"
                onOpenFullEditor={() => setIsFullScreenEditorOpen(true)}
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
                  URL: {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/blog/{customSlug}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Screen Editor Modal */}
      <FullScreenEditor
        content={formData.content}
        onChange={(content) => handleInputChange('content', content)}
        onSave={() => setIsFullScreenEditorOpen(false)}
        onClose={() => setIsFullScreenEditorOpen(false)}
        title="Edit Blog Content"
        isOpen={isFullScreenEditorOpen}
      />
    </div>
  );
}