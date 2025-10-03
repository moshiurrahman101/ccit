'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Code,
  Eye,
  Settings,
  BarChart3,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

interface GTMConfig {
  gtmId: string;
  enabled: boolean;
  customCode: string;
  events: {
    pageView: boolean;
    userRegistration: boolean;
    courseEnrollment: boolean;
    payment: boolean;
    courseCompletion: boolean;
  };
  customEvents: Array<{
    id: string;
    name: string;
    trigger: string;
    enabled: boolean;
  }>;
}

interface SEOConfig {
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
  structuredData: string;
}

export function GTMManager() {
  const [gtmConfig, setGtmConfig] = useState<GTMConfig>({
    gtmId: '',
    enabled: false,
    customCode: '',
    events: {
      pageView: true,
      userRegistration: true,
      courseEnrollment: true,
      payment: true,
      courseCompletion: true,
    },
    customEvents: []
  });

  const [seoConfig, setSeoConfig] = useState<SEOConfig>({
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImageAlt: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    robots: 'index,follow',
    structuredData: ''
  });

  const [activeTab, setActiveTab] = useState('gtm');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    // Load saved configurations
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      // Load GTM config
      const gtmData = localStorage.getItem('gtm-config');
      if (gtmData) {
        setGtmConfig(JSON.parse(gtmData));
      }

      // Load SEO config
      const seoData = localStorage.getItem('seo-config');
      if (seoData) {
        setSeoConfig(JSON.parse(seoData));
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  };

  const saveGTMConfig = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('gtm-config', JSON.stringify(gtmConfig));
      
      // Save to database via API
      const response = await fetch('/api/analytics/gtm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gtmConfig),
      });

      if (response.ok) {
        toast.success('GTM Configuration saved successfully!');
      } else {
        throw new Error('Failed to save GTM configuration');
      }
    } catch (error) {
      toast.error('Failed to save GTM configuration');
      console.error('Error saving GTM config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSEOConfig = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('seo-config', JSON.stringify(seoConfig));
      
      // Save to database via API
      const response = await fetch('/api/analytics/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoConfig),
      });

      if (response.ok) {
        toast.success('SEO Configuration saved successfully!');
      } else {
        throw new Error('Failed to save SEO configuration');
      }
    } catch (error) {
      toast.error('Failed to save SEO configuration');
      console.error('Error saving SEO config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testGTMConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/test-gtm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gtmId: gtmConfig.gtmId.trim() }),
      });

      const result = await response.json();
      setTestResults(result);
      
      if (result.success) {
        toast.success('GTM connection test successful!');
      } else {
        toast.error('GTM connection test failed');
      }
    } catch (error) {
      toast.error('Failed to test GTM connection');
      console.error('Error testing GTM:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomEvent = () => {
    const newEvent = {
      id: `event_${Date.now()}`,
      name: '',
      trigger: '',
      enabled: true,
    };
    setGtmConfig(prev => ({
      ...prev,
      customEvents: [...prev.customEvents, newEvent]
    }));
  };

  const removeCustomEvent = (eventId: string) => {
    setGtmConfig(prev => ({
      ...prev,
      customEvents: prev.customEvents.filter(event => event.id !== eventId)
    }));
  };

  const updateCustomEvent = (eventId: string, field: string, value: any) => {
    setGtmConfig(prev => ({
      ...prev,
      customEvents: prev.customEvents.map(event =>
        event.id === eventId ? { ...event, [field]: value } : event
      )
    }));
  };

  const generateGTMCode = () => {
    if (!gtmConfig.gtmId) return '';

    // Clean the GTM ID by removing any extra spaces
    const cleanGtmId = gtmConfig.gtmId.trim();

    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${cleanGtmId}');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${cleanGtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
  };

  const generateSEOPreview = () => {
    return {
      title: seoConfig.title || 'Page Title',
      description: seoConfig.description || 'Page description',
      ogTitle: seoConfig.ogTitle || seoConfig.title || 'Page Title',
      ogDescription: seoConfig.ogDescription || seoConfig.description || 'Page description',
      ogImage: seoConfig.ogImage || '/og-image.jpg',
      twitterTitle: seoConfig.twitterTitle || seoConfig.ogTitle || seoConfig.title || 'Page Title',
      twitterDescription: seoConfig.twitterDescription || seoConfig.ogDescription || seoConfig.description || 'Page description',
      twitterImage: seoConfig.twitterImage || seoConfig.ogImage || '/og-image.jpg',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics & SEO Management</h2>
          <p className="text-gray-600">Manage Google Tag Manager and SEO settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={gtmConfig.enabled ? "default" : "secondary"}>
            {gtmConfig.enabled ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gtm" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Google Tag Manager</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>SEO Management</span>
          </TabsTrigger>
        </TabsList>

        {/* GTM Configuration Tab */}
        <TabsContent value="gtm" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GTM Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>GTM Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure Google Tag Manager settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gtm-enabled"
                    checked={gtmConfig.enabled}
                    onCheckedChange={(checked) =>
                      setGtmConfig(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                  <Label htmlFor="gtm-enabled">Enable Google Tag Manager</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gtm-id">GTM Container ID</Label>
                  <Input
                    id="gtm-id"
                    placeholder="GTM-XXXXXXX"
                    value={gtmConfig.gtmId}
                    onChange={(e) =>
                      setGtmConfig(prev => ({ ...prev, gtmId: e.target.value.trim() }))
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Enter your GTM Container ID (e.g., GTM-XXXXXXX)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-code">Custom Code</Label>
                  <Textarea
                    id="custom-code"
                    placeholder="Enter custom JavaScript code..."
                    value={gtmConfig.customCode}
                    onChange={(e) =>
                      setGtmConfig(prev => ({ ...prev, customCode: e.target.value }))
                    }
                    rows={4}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={saveGTMConfig} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button variant="outline" onClick={testGTMConnection} disabled={isLoading}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Event Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Event Tracking</CardTitle>
                <CardDescription>
                  Configure automatic event tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(gtmConfig.events).map(([event, enabled]) => (
                  <div key={event} className="flex items-center justify-between">
                    <Label htmlFor={`event-${event}`} className="capitalize">
                      {event.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={`event-${event}`}
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setGtmConfig(prev => ({
                          ...prev,
                          events: { ...prev.events, [event]: checked }
                        }))
                      }
                    />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Custom Events</Label>
                    <Button size="sm" onClick={addCustomEvent}>
                      Add Event
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {gtmConfig.customEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Input
                          placeholder="Event name"
                          value={event.name}
                          onChange={(e) => updateCustomEvent(event.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Trigger"
                          value={event.trigger}
                          onChange={(e) => updateCustomEvent(event.id, 'trigger', e.target.value)}
                          className="flex-1"
                        />
                        <Switch
                          checked={event.enabled}
                          onCheckedChange={(checked) => updateCustomEvent(event.id, 'enabled', checked)}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeCustomEvent(event.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Generated GTM Code</span>
              </CardTitle>
              <CardDescription>
                Copy this code to your website's head section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generateGTMCode()}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {testResults.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Test Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {testResults.success ? 'Success' : 'Failed'}</p>
                  <p><strong>Message:</strong> {testResults.message}</p>
                  {testResults.details && (
                    <div>
                      <strong>Details:</strong>
                      <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
                        {JSON.stringify(testResults.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SEO Management Tab */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic SEO */}
            <Card>
              <CardHeader>
                <CardTitle>Basic SEO Settings</CardTitle>
                <CardDescription>
                  Configure basic SEO meta tags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Page Title</Label>
                  <Input
                    id="seo-title"
                    placeholder="Enter page title"
                    value={seoConfig.title}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">Meta Description</Label>
                  <Textarea
                    id="seo-description"
                    placeholder="Enter meta description"
                    value={seoConfig.description}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Keywords</Label>
                  <Input
                    id="seo-keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={seoConfig.keywords}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, keywords: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical-url">Canonical URL</Label>
                  <Input
                    id="canonical-url"
                    placeholder="https://example.com/page"
                    value={seoConfig.canonicalUrl}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, canonicalUrl: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robots">Robots Meta</Label>
                  <Input
                    id="robots"
                    placeholder="index,follow"
                    value={seoConfig.robots}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, robots: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Open Graph */}
            <Card>
              <CardHeader>
                <CardTitle>Open Graph Settings</CardTitle>
                <CardDescription>
                  Configure social media sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="og-title">OG Title</Label>
                  <Input
                    id="og-title"
                    placeholder="Open Graph title"
                    value={seoConfig.ogTitle}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, ogTitle: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og-description">OG Description</Label>
                  <Textarea
                    id="og-description"
                    placeholder="Open Graph description"
                    value={seoConfig.ogDescription}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, ogDescription: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og-image">OG Image URL</Label>
                  <Input
                    id="og-image"
                    placeholder="https://example.com/image.jpg"
                    value={seoConfig.ogImage}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, ogImage: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og-image-alt">OG Image Alt Text</Label>
                  <Input
                    id="og-image-alt"
                    placeholder="Image description"
                    value={seoConfig.ogImageAlt}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, ogImageAlt: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Twitter Card */}
          <Card>
            <CardHeader>
              <CardTitle>Twitter Card Settings</CardTitle>
              <CardDescription>
                Configure Twitter sharing appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter-title">Twitter Title</Label>
                  <Input
                    id="twitter-title"
                    placeholder="Twitter title"
                    value={seoConfig.twitterTitle}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, twitterTitle: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter-description">Twitter Description</Label>
                  <Input
                    id="twitter-description"
                    placeholder="Twitter description"
                    value={seoConfig.twitterDescription}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, twitterDescription: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter-image">Twitter Image URL</Label>
                  <Input
                    id="twitter-image"
                    placeholder="https://example.com/twitter-image.jpg"
                    value={seoConfig.twitterImage}
                    onChange={(e) =>
                      setSeoConfig(prev => ({ ...prev, twitterImage: e.target.value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structured Data */}
          <Card>
            <CardHeader>
              <CardTitle>Structured Data</CardTitle>
              <CardDescription>
                Add JSON-LD structured data for better SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="structured-data">JSON-LD Schema</Label>
                <Textarea
                  id="structured-data"
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                  value={seoConfig.structuredData}
                  onChange={(e) =>
                    setSeoConfig(prev => ({ ...prev, structuredData: e.target.value }))
                  }
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>SEO Preview</span>
              </CardTitle>
              <CardDescription>
                Preview how your page will appear in search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Google Search Preview */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Google Search Result</h3>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {seoConfig.canonicalUrl || 'https://example.com'}
                      </span>
                    </div>
                    <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
                      {generateSEOPreview().title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {generateSEOPreview().description}
                    </p>
                  </div>
                </div>

                {/* Social Media Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Facebook Preview</h3>
                    <div className="border rounded">
                      <img 
                        src={generateSEOPreview().ogImage} 
                        alt={seoConfig.ogImageAlt}
                        className="w-full h-32 object-cover rounded-t"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-og.jpg';
                        }}
                      />
                      <div className="p-3">
                        <h4 className="font-semibold text-sm">{generateSEOPreview().ogTitle}</h4>
                        <p className="text-xs text-gray-600 mt-1">{generateSEOPreview().ogDescription}</p>
                        <span className="text-xs text-gray-400">{seoConfig.canonicalUrl || 'example.com'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Twitter Preview</h3>
                    <div className="border rounded">
                      <img 
                        src={generateSEOPreview().twitterImage} 
                        alt={seoConfig.ogImageAlt}
                        className="w-full h-32 object-cover rounded-t"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-og.jpg';
                        }}
                      />
                      <div className="p-3">
                        <h4 className="font-semibold text-sm">{generateSEOPreview().twitterTitle}</h4>
                        <p className="text-xs text-gray-600 mt-1">{generateSEOPreview().twitterDescription}</p>
                        <span className="text-xs text-gray-400">{seoConfig.canonicalUrl || 'example.com'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSEOConfig} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save SEO Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
