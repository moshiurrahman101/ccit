'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Globe, 
  FileText, 
  BookOpen, 
  Users,
  Plus,
  Edit,
  Eye,
  Settings
} from 'lucide-react';

interface PageInfo {
  id: string;
  path: string;
  title: string;
  type: 'static' | 'dynamic';
  hasSEO: boolean;
  lastModified?: string;
  description?: string;
}

interface PageSelectorProps {
  onPageSelect: (page: PageInfo) => void;
  selectedPage?: PageInfo | null;
}

export function PageSelector({ onPageSelect, selectedPage }: PageSelectorProps) {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      // Simulate loading pages - in real app, this would come from your routing system
      const allPages: PageInfo[] = [
        {
          id: '1',
          path: '/',
          title: 'Home',
          type: 'static',
          hasSEO: true,
          description: 'Main landing page'
        },
        {
          id: '2',
          path: '/courses',
          title: 'Courses',
          type: 'static',
          hasSEO: true,
          description: 'Browse all programming courses'
        },
        {
          id: '3',
          path: '/about',
          title: 'About Us',
          type: 'static',
          hasSEO: true,
          description: 'Learn about Creative Canvas IT'
        },
        {
          id: '4',
          path: '/contact',
          title: 'Contact',
          type: 'static',
          hasSEO: true,
          description: 'Get in touch with us'
        },
        {
          id: '5',
          path: '/blog',
          title: 'Blog',
          type: 'dynamic',
          hasSEO: false,
          description: 'Programming articles and tutorials'
        },
        {
          id: '6',
          path: '/mentors',
          title: 'Mentors',
          type: 'static',
          hasSEO: true,
          description: 'Meet our expert instructors'
        },
        {
          id: '7',
          path: '/courses/web-development',
          title: 'Web Development Course',
          type: 'dynamic',
          hasSEO: false,
          description: 'Full-stack web development course'
        },
        {
          id: '8',
          path: '/courses/python',
          title: 'Python Course',
          type: 'dynamic',
          hasSEO: false,
          description: 'Python programming course'
        }
      ];
      
      setPages(allPages);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPageIcon = (type: string) => {
    switch (type) {
      case 'dynamic': return <FileText className="h-4 w-4" />;
      case 'static': return <Globe className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getPageTypeColor = (type: string) => {
    switch (type) {
      case 'dynamic': return 'bg-blue-100 text-blue-800';
      case 'static': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedPages = filteredPages.reduce((acc, page) => {
    const category = page.type === 'dynamic' ? 'Dynamic Pages' : 'Static Pages';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(page);
    return acc;
  }, {} as Record<string, PageInfo[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Select Page</h2>
          <p className="text-sm text-gray-600">Choose a page to configure SEO settings</p>
        </div>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Page
        </Button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPages).map(([category, categoryPages]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryPages.map((page) => (
                <Card
                  key={page.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPage?.id === page.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => onPageSelect(page)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getPageIcon(page.type)}
                          <h4 className="font-medium text-sm truncate">{page.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getPageTypeColor(page.type)}`}
                          >
                            {page.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">{page.path}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{page.description}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {page.hasSEO ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            <Settings className="h-3 w-3 mr-1" />
                            SEO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Setup
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No pages found</p>
          <p className="text-sm text-gray-400">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
