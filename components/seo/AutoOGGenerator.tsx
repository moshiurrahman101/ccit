'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  Eye, 
  Download,
  Copy,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Users,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { generateOGImageURL, sanitizeContentForOG } from '@/lib/og-image-generator';

interface AutoOGGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  initialConfig?: {
    type?: string;
    title?: string;
    description?: string;
    category?: string;
    author?: string;
    tags?: string[];
  };
}

export function AutoOGGenerator({ onImageGenerated, initialConfig }: AutoOGGeneratorProps) {
  const [config, setConfig] = useState({
    type: initialConfig?.type || 'page',
    title: initialConfig?.title || '',
    description: initialConfig?.description || '',
    category: initialConfig?.category || '',
    author: initialConfig?.author || '',
    tags: initialConfig?.tags?.join(', ') || '',
    date: new Date().toISOString().split('T')[0]
  });

  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  const generateImage = async () => {
    if (!config.title) {
      toast.error('Title is required');
      return;
    }

    setIsGenerating(true);
    try {
      const tagsArray = config.tags ? config.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      
      const imageUrl = generateOGImageURL({
        type: config.type as any,
        title: config.title,
        description: sanitizeContentForOG(config.description),
        category: config.category,
        author: config.author,
        date: config.date,
        tags: tagsArray
      });

      setGeneratedImageUrl(imageUrl);
      onImageGenerated?.(imageUrl);
      toast.success('OG image generated successfully!');
    } catch (error) {
      toast.error('Failed to generate OG image');
      console.error('Error generating OG image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyImageUrl = () => {
    navigator.clipboard.writeText(generatedImageUrl);
    toast.success('Image URL copied to clipboard!');
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `og-image-${config.type}-${Date.now()}.png`;
    link.click();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'batch': return <Users className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800';
      case 'course': return 'bg-red-100 text-red-800';
      case 'batch': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automatic OG Image Generator</h3>
          <p className="text-sm text-gray-600">Generate dynamic OG images based on your content</p>
        </div>
        <Badge className={getTypeColor(config.type)}>
          {getTypeIcon(config.type)}
          <span className="ml-1">{config.type.charAt(0).toUpperCase() + config.type.slice(1)}</span>
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                value={config.type}
                onValueChange={(value) => setConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Web Development, Tutorial"
                value={config.category}
                onChange={(e) => setConfig(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter content title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter content description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={config.author}
                onChange={(e) => setConfig(prev => ({ ...prev, author: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={config.date}
                onChange={(e) => setConfig(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
              value={config.tags}
              onChange={(e) => setConfig(prev => ({ ...prev, tags: e.target.value }))}
            />
            <p className="text-xs text-gray-500">Separate tags with commas</p>
          </div>

          <Button 
            onClick={generateImage} 
            disabled={isGenerating || !config.title}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate OG Image
              </>
            )}
          </Button>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          {generatedImageUrl ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Generated OG Image
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={copyImageUrl}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy URL
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadImage}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated OG Image"
                      className="w-full h-auto"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <div className="p-2 bg-gray-100 rounded text-sm font-mono break-all">
                      {generatedImageUrl}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No image generated yet</p>
                <p className="text-sm text-gray-400 text-center">
                  Go to the Configuration tab and generate an OG image to see the preview here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
