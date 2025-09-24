'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Search, Eye } from 'lucide-react';

interface SEOPreviewProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  featuredImage?: string;
  category: string;
  tags: string[];
}

export default function SEOPreview({
  title,
  metaTitle,
  metaDescription,
  slug,
  featuredImage,
  category,
  tags
}: SEOPreviewProps) {
  const displayTitle = metaTitle || title;
  const displayDescription = metaDescription || 'No description provided';
  const displayUrl = `${window.location.origin}/blog/${slug}`;

  return (
    <div className="space-y-4">
      {/* Google Search Preview */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Google Search Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-blue-600 text-sm">
              {displayUrl}
            </div>
            <div className="text-xl text-blue-800 font-medium line-clamp-1">
              {displayTitle || 'No title'}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
              {displayDescription}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>{category}</span>
              {tags.length > 0 && (
                <>
                  <span>•</span>
                  <span>{tags.slice(0, 2).join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Preview */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-500" />
            Social Media Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {featuredImage && (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <img 
                  src={featuredImage} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                {displayTitle || 'No title'}
              </div>
              <div className="text-sm text-gray-600 line-clamp-3 mb-2">
                {displayDescription}
              </div>
              <div className="text-xs text-gray-500">
                {displayUrl}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Analysis */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Title Length</span>
              <Badge variant={displayTitle.length > 60 ? "destructive" : displayTitle.length > 50 ? "default" : "secondary"}>
                {displayTitle.length}/60
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Description Length</span>
              <Badge variant={displayDescription.length > 160 ? "destructive" : displayDescription.length > 120 ? "default" : "secondary"}>
                {displayDescription.length}/160
              </Badge>
            </div>
            {(displayTitle.length > 60 || displayDescription.length > 160) && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                ⚠️ SEO fields exceed recommended limits
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Slug</span>
              <Badge variant={slug.length > 50 ? "destructive" : "secondary"}>
                {slug.length} chars
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Featured Image</span>
              <Badge variant={featuredImage ? "default" : "destructive"}>
                {featuredImage ? "Set" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tags</span>
              <Badge variant={tags.length > 0 ? "default" : "destructive"}>
                {tags.length} tags
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
