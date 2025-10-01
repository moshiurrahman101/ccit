'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, CheckCircle, XCircle, Loader2, Link, RefreshCw } from 'lucide-react';

interface SlugValidatorProps {
  value: string;
  onChange: (value: string) => void;
  autoGenerate?: boolean;
  onToggleAutoGenerate?: () => void;
  excludeId?: string; // For editing existing blogs
  onValidationChange?: (isAvailable: boolean) => void;
  className?: string;
}

interface SlugValidation {
  available: boolean;
  message: string;
  loading: boolean;
}

export default function SlugValidator({
  value,
  onChange,
  autoGenerate = true,
  onToggleAutoGenerate,
  excludeId,
  onValidationChange,
  className = ''
}: SlugValidatorProps) {
  const [validation, setValidation] = useState<SlugValidation>({
    available: false,
    message: '',
    loading: false
  });
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce the slug value to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Validate slug when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 0) {
      validateSlug(debouncedValue);
    } else {
      setValidation({
        available: false,
        message: 'Enter a slug',
        loading: false
      });
      onValidationChange?.(false);
    }
  }, [debouncedValue, excludeId, onValidationChange]);

  const validateSlug = async (slug: string) => {
    setValidation(prev => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({ slug });
      if (excludeId) {
        params.append('excludeId', excludeId);
      }

      const response = await fetch(`/api/blogs/validate-slug?${params}`);
      const data = await response.json();

      setValidation({
        available: data.available,
        message: data.message,
        loading: false
      });
      onValidationChange?.(data.available);
    } catch (error) {
      setValidation({
        available: false,
        message: 'Error validating slug',
        loading: false
      });
      onValidationChange?.(false);
    }
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim();
  };

  const handleSlugChange = (newValue: string) => {
    // Only allow valid slug characters
    const validSlug = newValue
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Only allow lowercase letters, numbers, and hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    onChange(validSlug);
  };

  const getValidationIcon = () => {
    if (validation.loading) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }
    
    if (!validation.available && debouncedValue) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (validation.available) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return null;
  };

  const getValidationBadge = () => {
    if (validation.loading) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Checking...
        </Badge>
      );
    }
    
    if (!validation.available && debouncedValue) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Not Available
        </Badge>
      );
    }
    
    if (validation.available) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Available
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          URL Slug
        </label>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              value={value}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="blog-url-slug"
              className={`bg-white/20 border-white/30 pr-10 ${
                validation.available && debouncedValue 
                  ? 'border-green-300 bg-green-50/20' 
                  : !validation.available && debouncedValue 
                  ? 'border-red-300 bg-red-50/20' 
                  : ''
              }`}
              disabled={autoGenerate}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </div>
          
          {onToggleAutoGenerate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleAutoGenerate}
              className="bg-white/20 border-white/30"
            >
              <Hash className="w-4 h-4 mr-1" />
              {autoGenerate ? 'Auto' : 'Manual'}
            </Button>
          )}
        </div>

        {/* Validation Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getValidationBadge()}
            {validation.message && (
              <span className={`text-xs ${
                validation.available 
                  ? 'text-green-600' 
                  : debouncedValue 
                  ? 'text-red-600' 
                  : 'text-gray-500'
              }`}>
                {validation.message}
              </span>
            )}
          </div>
        </div>

        {/* URL Preview */}
        {value && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50/50 p-2 rounded">
            <Link className="h-3 w-3" />
            <span>
              {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/blog/{value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
