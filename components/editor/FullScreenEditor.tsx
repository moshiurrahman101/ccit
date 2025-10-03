'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Save, Eye } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface FullScreenEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onClose: () => void;
  title?: string;
  isOpen: boolean;
}

export default function FullScreenEditor({
  content,
  onChange,
  onSave,
  onClose,
  title = "Edit Content",
  isOpen
}: FullScreenEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {isPreview ? (
            <div className="h-full overflow-auto p-6">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          ) : (
            <div className="h-full">
              <RichTextEditor
                content={content}
                onChange={onChange}
                className="h-full border-0 rounded-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
