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
  Code,
  Globe,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface HeadTag {
  id: string;
  name: string;
  content?: string;
  property?: string;
  rel?: string;
  href?: string;
  type?: string;
  customTag?: string;
}

interface GlobalSEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultOgImage: string;
  defaultCanonicalUrl: string;
  customHeadTags: HeadTag[];
}

export function HeadTagManager() {
  const [config, setConfig] = useState<GlobalSEOConfig>({
    defaultTitle: '',
    defaultDescription: '',
    defaultKeywords: '',
    defaultOgImage: '',
    defaultCanonicalUrl: '',
    customHeadTags: []
  });
  
  const [activeTab, setActiveTab] = useState('global');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/analytics/head-tags');
      const data = await response.json();
      
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading head tags config:', error);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/head-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success('Head tags configuration saved successfully!');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save head tags configuration');
      console.error('Error saving config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomTag = () => {
    const newTag: HeadTag = {
      id: `tag_${Date.now()}`,
      name: '',
      content: '',
      customTag: ''
    };
    setConfig(prev => ({
      ...prev,
      customHeadTags: [...prev.customHeadTags, newTag]
    }));
  };

  const updateCustomTag = (id: string, field: keyof HeadTag, value: string) => {
    setConfig(prev => ({
      ...prev,
      customHeadTags: prev.customHeadTags.map(tag =>
        tag.id === id ? { ...tag, [field]: value } : tag
      )
    }));
  };

  const removeCustomTag = (id: string) => {
    setConfig(prev => ({
      ...prev,
      customHeadTags: prev.customHeadTags.filter(tag => tag.id !== id)
    }));
  };

  const generateHeadTagsPreview = () => {
    const tags = [];

    // Basic meta tags
    if (config.defaultTitle) {
      tags.push(`<title>${config.defaultTitle}</title>`);
    }
    if (config.defaultDescription) {
      tags.push(`<meta name="description" content="${config.defaultDescription}" />`);
    }
    if (config.defaultKeywords) {
      tags.push(`<meta name="keywords" content="${config.defaultKeywords}" />`);
    }
    if (config.defaultCanonicalUrl) {
      tags.push(`<link rel="canonical" href="${config.defaultCanonicalUrl}" />`);
    }

    // Open Graph tags
    if (config.defaultTitle) {
      tags.push(`<meta property="og:title" content="${config.defaultTitle}" />`);
    }
    if (config.defaultDescription) {
      tags.push(`<meta property="og:description" content="${config.defaultDescription}" />`);
    }
    if (config.defaultOgImage) {
      tags.push(`<meta property="og:image" content="${config.defaultOgImage}" />`);
    }
    if (config.defaultCanonicalUrl) {
      tags.push(`<meta property="og:url" content="${config.defaultCanonicalUrl}" />`);
    }
    tags.push(`<meta property="og:type" content="website" />`);

    // Twitter Card tags
    tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
    if (config.defaultTitle) {
      tags.push(`<meta name="twitter:title" content="${config.defaultTitle}" />`);
    }
    if (config.defaultDescription) {
      tags.push(`<meta name="twitter:description" content="${config.defaultDescription}" />`);
    }
    if (config.defaultOgImage) {
      tags.push(`<meta name="twitter:image" content="${config.defaultOgImage}" />`);
    }

    // Custom tags
    config.customHeadTags.forEach(tag => {
      if (tag.customTag) {
        tags.push(tag.customTag);
      } else if (tag.name && tag.content) {
        if (tag.property) {
          tags.push(`<meta property="${tag.name}" content="${tag.content}" />`);
        } else if (tag.rel && tag.href) {
          tags.push(`<link rel="${tag.rel}" href="${tag.href}" />`);
        } else {
          tags.push(`<meta name="${tag.name}" content="${tag.content}" />`);
        }
      }
    });

    return tags.join('\n');
  };

  const validateConfig = () => {
    const errors: string[] = [];
    
    if (!config.defaultTitle) errors.push('Default title is required');
    if (!config.defaultDescription) errors.push('Default description is required');
    if (config.defaultDescription && config.defaultDescription.length > 160) {
      errors.push('Default description should be under 160 characters');
    }
    if (config.defaultTitle && config.defaultTitle.length > 60) {
      errors.push('Default title should be under 60 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, 100 - (errors.length * 15))
    };
  };

  const validation = validateConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Head Tags Management</h2>
          <p className="text-gray-600">Manage global head tags and meta information</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={validation.isValid ? "default" : "destructive"}>
            SEO Score: {validation.score}/100
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Global SEO</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>Custom Tags</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* Global SEO Tab */}
        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global SEO Settings</CardTitle>
              <CardDescription>
                Configure default SEO settings for all pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-title">Default Page Title</Label>
                  <Input
                    id="default-title"
                    placeholder="Enter default page title"
                    value={config.defaultTitle}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultTitle: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">
                    {config.defaultTitle.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-keywords">Default Keywords</Label>
                  <Input
                    id="default-keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={config.defaultKeywords}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultKeywords: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-description">Default Meta Description</Label>
                <Textarea
                  id="default-description"
                  placeholder="Enter default meta description"
                  value={config.defaultDescription}
                  onChange={(e) => setConfig(prev => ({ ...prev, defaultDescription: e.target.value }))}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  {config.defaultDescription.length}/160 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-og-image">Default Open Graph Image</Label>
                  <Input
                    id="default-og-image"
                    placeholder="https://example.com/og-image.jpg"
                    value={config.defaultOgImage}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultOgImage: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-canonical">Default Canonical URL</Label>
                  <Input
                    id="default-canonical"
                    placeholder="https://example.com"
                    value={config.defaultCanonicalUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultCanonicalUrl: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Tags Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Custom Head Tags</span>
                <Button size="sm" onClick={addCustomTag}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </CardTitle>
              <CardDescription>
                Add custom meta tags, links, or scripts to the head section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.customHeadTags.map((tag) => (
                <div key={tag.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Custom Tag</h4>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeCustomTag(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`custom-tag-${tag.id}`}>Custom HTML Tag</Label>
                    <Textarea
                      id={`custom-tag-${tag.id}`}
                      placeholder='<meta name="custom" content="value" />'
                      value={tag.customTag || ''}
                      onChange={(e) => updateCustomTag(tag.id, 'customTag', e.target.value)}
                      rows={2}
                    />
                    <p className="text-xs text-gray-500">
                      Enter the complete HTML tag (e.g., &lt;meta&gt;, &lt;link&gt;, &lt;script&gt;)
                    </p>
                  </div>
                </div>
              ))}
              
              {config.customHeadTags.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom tags added yet</p>
                  <p className="text-sm">Click "Add Tag" to create your first custom head tag</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Generated HTML Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Generated Head Tags</span>
                </CardTitle>
                <CardDescription>
                  Preview of the HTML head tags that will be generated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-64">
                  <code>{generateHeadTagsPreview()}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Social Media Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Preview</CardTitle>
              <CardDescription>
                How your content will appear when shared on social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Facebook Preview</h3>
                  <div className="border rounded">
                    <img 
                      src={config.defaultOgImage || '/placeholder-og.jpg'} 
                      alt="OG Image"
                      className="w-full h-32 object-cover rounded-t"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-og.jpg';
                      }}
                    />
                    <div className="p-3">
                      <h4 className="font-semibold text-sm">{config.defaultTitle || 'Page Title'}</h4>
                      <p className="text-xs text-gray-600 mt-1">{config.defaultDescription || 'Page description'}</p>
                      <span className="text-xs text-gray-400">{config.defaultCanonicalUrl || 'example.com'}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Twitter Preview</h3>
                  <div className="border rounded">
                    <img 
                      src={config.defaultOgImage || '/placeholder-og.jpg'} 
                      alt="Twitter Image"
                      className="w-full h-32 object-cover rounded-t"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-og.jpg';
                      }}
                    />
                    <div className="p-3">
                      <h4 className="font-semibold text-sm">{config.defaultTitle || 'Page Title'}</h4>
                      <p className="text-xs text-gray-600 mt-1">{config.defaultDescription || 'Page description'}</p>
                      <span className="text-xs text-gray-400">{config.defaultCanonicalUrl || 'example.com'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}