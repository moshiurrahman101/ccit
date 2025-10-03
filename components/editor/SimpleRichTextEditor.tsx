'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image, 
  Heading1, 
  Heading2, 
  Heading3, 
  Code, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Undo, 
  Redo, 
  Strikethrough, 
  Type, 
  Palette, 
  Maximize2
} from 'lucide-react';

interface SimpleRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onOpenFullEditor?: () => void;
  placeholder?: string;
  className?: string;
}

export default function SimpleRichTextEditor({ 
  content, 
  onChange, 
  onOpenFullEditor,
  placeholder = "Start writing...",
  className = ""
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUserInputRef = useRef(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && !isUserInputRef.current) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const executeCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      // Focus the editor first
      editorRef.current.focus();
      
      // Store current selection
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      // If no selection, create a range at cursor position
      if (!range) {
        const newRange = document.createRange();
        newRange.selectNodeContents(editorRef.current);
        newRange.collapse(false); // Move to end
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
      
      // Execute the command
      const success = document.execCommand(command, false, value);
      
      if (success) {
        updateContent();
      }
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      if (newContent !== content) {
        isUserInputRef.current = true;
        onChange(newContent);
        setTimeout(() => {
          isUserInputRef.current = false;
        }, 100);
      }
    }
  };

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title, 
    isActive = false 
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string;
    isActive?: boolean;
  }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Simple Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => executeCommand('bold')} title="Bold">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('italic')} title="Italic">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('underline')} title="Underline">
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('strikeThrough')} title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'h1')} title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'h2')} title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'h3')} title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => executeCommand('insertUnorderedList')} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('insertOrderedList')} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'blockquote')} title="Quote">
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'pre')} title="Code Block">
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => executeCommand('justifyLeft')} title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('justifyCenter')} title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('justifyRight')} title="Align Right">
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('justifyFull')} title="Justify">
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => executeCommand('undo')} title="Undo">
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('redo')} title="Redo">
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {onOpenFullEditor && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <ToolbarButton onClick={onOpenFullEditor} title="Open Full Editor">
              <Maximize2 className="h-4 w-4" />
            </ToolbarButton>
          </>
        )}
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onMouseUp={updateContent}
        onKeyUp={updateContent}
        onFocus={focusEditor}
        className="min-h-[200px] p-4 focus:outline-none"
        style={{ minHeight: '200px' }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
    </div>
  );
}
