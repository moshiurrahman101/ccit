'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageSelector } from '@/components/seo/PageSelector';
import { SEOEditor } from '@/components/seo/SEOEditor';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';

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

export function PageSEOManager() {
  const [selectedPage, setSelectedPage] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageSelect = (page: PageInfo) => {
    setSelectedPage(page);
  };

  const handleSaveSEO = async (seoData: SEOData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...seoData,
          page: selectedPage?.path,
          lastModified: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save SEO settings');
      }

      // Update the selected page to reflect it now has SEO
      if (selectedPage) {
        setSelectedPage({
          ...selectedPage,
          hasSEO: true,
          lastModified: new Date().toISOString()
        });
      }

      toast.success('SEO settings saved successfully!');
    } catch (error) {
      console.error('Error saving SEO:', error);
      toast.error('Failed to save SEO settings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Page SEO Management</h2>
          <p className="text-gray-600">Manage SEO settings for individual pages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Page</CardTitle>
            <CardDescription>
              Choose a page to configure SEO settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageSelector 
              onPageSelect={handlePageSelect}
              selectedPage={selectedPage}
            />
          </CardContent>
        </Card>

        {/* SEO Editor */}
        <Card>
          {selectedPage ? (
            <>
              <CardHeader>
                <CardTitle>SEO Configuration</CardTitle>
                <CardDescription>
                  Configure SEO settings for: <span className="font-medium">{selectedPage.path}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SEOEditor
                  page={selectedPage}
                  onSave={handleSaveSEO}
                  onClose={() => setSelectedPage(null)}
                />
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Page Selected</h3>
                <p className="text-gray-500 mb-4">
                  Select a page from the list to configure its SEO settings
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
