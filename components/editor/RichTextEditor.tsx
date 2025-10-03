'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  Table,
  Minus,
  Plus,
  Save,
  Eye,
  X,
  Settings,
  Indent,
  Outdent,
  Superscript,
  Subscript,
  RotateCcw,
  RotateCw
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  onImageUpload
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUserInputRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'text' | 'format' | 'insert' | 'advanced'>('text');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('#ffff00');

  // Initialize content only once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  // Update content only when it changes externally (not from user input)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content && !isUserInputRef.current) {
      editorRef.current.innerHTML = content;
    }
    isUserInputRef.current = false; // Reset the flag
  }, [content]);

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const executeCommand = (command: string, value?: string) => {
    try {
      // Ensure editor is focused
      focusEditor();
      
      // Store current selection
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      // If no selection, create a range at cursor position
      if (!range) {
        const newRange = document.createRange();
        newRange.selectNodeContents(editorRef.current!);
        newRange.collapse(false); // Move to end
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
      
      // Execute command
      const success = document.execCommand(command, false, value);
      
      if (success) {
        // Update content after command
    updateContent();
      } else {
        console.warn(`Command ${command} failed`);
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      isUserInputRef.current = true; // Mark as user input
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            executeCommand('redo');
          } else {
            executeCommand('undo');
          }
          break;
        case 'k':
          e.preventDefault();
          openLinkDialog();
          break;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    try {
    const text = e.clipboardData.getData('text/plain');
      if (text) {
        executeCommand('insertText', text);
      }
    } catch (error) {
      console.error('Error pasting content:', error);
      // Fallback: insert text directly
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(e.clipboardData.getData('text/plain')));
    updateContent();
      }
    }
  };

  const openLinkDialog = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      setLinkText(selectedText);
    }
    setShowSidebar(true);
    setSidebarTab('insert');
  };

  const insertImage = () => {
    setShowSidebar(true);
    setSidebarTab('insert');
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      insertLink(linkUrl, linkText || undefined);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleImageSubmit = () => {
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = 'Image';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
      updateContent();
      }
    }
    setImageUrl('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
    setIsUploading(true);
    try {
        const imageUrl = await onImageUpload(file);
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Uploaded image';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
      updateContent();
        }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
    }
  };

  const applyTextColor = (color: string) => {
    setTextColor(color);
    focusEditor();
    setTimeout(() => {
      executeCommand('foreColor', color);
    }, 10);
  };

  const applyBackgroundColor = (color: string) => {
    setBackgroundColor(color);
    focusEditor();
    setTimeout(() => {
      executeCommand('backColor', color);
    }, 10);
  };

  const applyHighlight = (color: string) => {
    setHighlightColor(color);
    focusEditor();
    setTimeout(() => {
      executeCommand('backColor', color);
    }, 10);
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    focusEditor();
    setTimeout(() => {
      executeCommand('styleWithCSS', 'true');
      executeCommand('fontSize', `${size}`);
    }, 10);
  };

  const applyLineHeight = (height: number) => {
    setLineHeight(height);
    focusEditor();
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.style.lineHeight = `${height}`;
        updateContent();
      }
    }, 10);
  };

  const applyLetterSpacing = (spacing: number) => {
    setLetterSpacing(spacing);
    focusEditor();
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.style.letterSpacing = `${spacing}px`;
        updateContent();
      }
    }, 10);
  };

  const applyTextTransform = (transform: string) => {
    focusEditor();
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.style.textTransform = transform;
        updateContent();
      }
    }, 10);
  };

  const applyFontWeight = (weight: number) => {
    focusEditor();
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.style.fontWeight = weight.toString();
        updateContent();
      }
    }, 10);
  };

  // List operations
  const insertUnorderedList = () => {
    focusEditor();
    executeCommand('insertUnorderedList');
  };

  const insertOrderedList = () => {
    focusEditor();
    executeCommand('insertOrderedList');
  };

  // Text alignment
  const justifyLeft = () => {
    focusEditor();
    executeCommand('justifyLeft');
  };

  const justifyCenter = () => {
    focusEditor();
    executeCommand('justifyCenter');
  };

  const justifyRight = () => {
    focusEditor();
    executeCommand('justifyRight');
  };

  const justifyFull = () => {
    focusEditor();
    executeCommand('justifyFull');
  };

  // Headings
  const formatHeading = (level: number) => {
    focusEditor();
    executeCommand('formatBlock', `h${level}`);
  };

  // Link insertion
  const insertLink = (url: string, text?: string) => {
    focusEditor();
    if (text) {
      // Insert link with custom text
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.textContent = text;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        range.deleteContents();
        range.insertNode(linkElement);
        updateContent();
      }
    } else {
      // Insert link with selected text
      executeCommand('createLink', url);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title, 
    isActive = false,
    variant = "ghost"
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string; 
    isActive?: boolean;
    variant?: "default" | "ghost" | "outline";
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : variant}
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className="h-8 w-8 p-0"
      data-toolbar-button="true"
    >
      {children}
    </Button>
  );

  const ColorPicker = ({ 
    label, 
    value, 
    onChange, 
    colors = [
      '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF', 
      '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#00CCFF', '#0066FF', 
      '#6600FF', '#FF00CC', '#8B4513', '#D2691E', '#CD853F', '#F4A460'
    ]
  }: {
    label: string;
    value: string;
    onChange: (color: string) => void;
    colors?: string[];
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="grid grid-cols-6 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
              value === color ? 'border-gray-800' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div className={`border border-gray-300 rounded-lg relative ${className}`}>
      {/* Main Toolbar */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton onClick={() => executeCommand('bold')} title="Bold (Ctrl+B)">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('italic')} title="Italic (Ctrl+I)">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('underline')} title="Underline (Ctrl+U)">
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('strikeThrough')} title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton onClick={() => formatHeading(1)} title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => formatHeading(2)} title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => formatHeading(3)} title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton onClick={insertUnorderedList} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={insertOrderedList} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton onClick={justifyLeft} title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={justifyCenter} title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={justifyRight} title="Align Right">
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={justifyFull} title="Justify">
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Advanced Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'blockquote')} title="Quote">
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('formatBlock', 'pre')} title="Code Block">
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('subscript')} title="Subscript">
            <Subscript className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('superscript')} title="Superscript">
            <Superscript className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Links and Images */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton onClick={openLinkDialog} title="Insert Link (Ctrl+K)">
            <Link className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={insertImage} title="Insert Image">
            <Image className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton onClick={() => executeCommand('undo')} title="Undo (Ctrl+Z)">
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('redo')} title="Redo (Ctrl+Shift+Z)">
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Settings Button */}
        <div className="flex gap-1 ml-auto">
          <ToolbarButton
            onClick={() => setShowSidebar(!showSidebar)} 
            title="More Options"
            variant="outline"
          >
            <Settings className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`min-h-[300px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onMouseUp={() => {
          updateContent();
        }}
        style={{ minHeight: '300px' }}
        data-placeholder={placeholder}
      />

      {/* Placeholder */}
      {!content && !isFocused && (
        <div 
          className="absolute top-4 left-4 text-gray-400 pointer-events-none"
          style={{ top: '60px' }}
        >
          {placeholder}
        </div>
      )}

      {/* Sidebar Panel */}
      {showSidebar && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-300 shadow-lg z-10">
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="border-b border-gray-300 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Format Options</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sidebar Tabs */}
            <div className="border-b border-gray-300 p-2">
              <div className="flex gap-1">
                {[
                  { id: 'text', label: 'Text', icon: Type },
                  { id: 'format', label: 'Format', icon: Type },
                  { id: 'insert', label: 'Insert', icon: Plus },
                  { id: 'advanced', label: 'Advanced', icon: Settings }
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={sidebarTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSidebarTab(tab.id as any)}
                    className="flex-1"
                  >
                    <tab.icon className="h-4 w-4 mr-1" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {sidebarTab === 'text' && (
                <div className="space-y-6">
                  {/* Font Size */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Font Size</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => applyFontSize(value[0])}
                        min={8}
                        max={72}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{fontSize}px</span>
                    </div>
                  </div>

                  {/* Line Height */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Line Height</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[lineHeight]}
                        onValueChange={(value) => applyLineHeight(value[0])}
                        min={0.5}
                        max={3}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{lineHeight}</span>
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Letter Spacing</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[letterSpacing]}
                        onValueChange={(value) => applyLetterSpacing(value[0])}
                        min={-2}
                        max={10}
                        step={0.5}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{letterSpacing}px</span>
                    </div>
                  </div>

                  {/* Colors */}
                  <ColorPicker
                    label="Text Color"
                    value={textColor}
                    onChange={applyTextColor}
                  />

                  <ColorPicker
                    label="Background Color"
                    value={backgroundColor}
                    onChange={applyBackgroundColor}
                  />

                  <ColorPicker
                    label="Highlight Color"
                    value={highlightColor}
                    onChange={applyHighlight}
                    colors={['#ffff00', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39']}
                  />
                </div>
              )}

              {sidebarTab === 'format' && (
                <div className="space-y-6">
                  {/* Text Transform */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Text Transform</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTextTransform('uppercase')}
                      >
                        UPPERCASE
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTextTransform('lowercase')}
                      >
                        lowercase
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTextTransform('capitalize')}
                      >
                        Title Case
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTextTransform('none')}
                      >
                        Normal
                      </Button>
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Font Weight</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                        <Button
                          key={weight}
                          variant="outline"
                          size="sm"
                          onClick={() => applyFontWeight(weight)}
                        >
                          {weight}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Text Decoration */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Text Decoration</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeCommand('underline')}
                      >
                        Underline
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeCommand('strikeThrough')}
                      >
                        Line Through
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Overline is not directly supported, use CSS
                          if (editorRef.current) {
                            editorRef.current.style.textDecoration = 'overline';
                            updateContent();
                          }
                        }}
                      >
                        Overline
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (editorRef.current) {
                            editorRef.current.style.textDecoration = 'none';
                            updateContent();
                          }
                        }}
                      >
                        None
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === 'insert' && (
                <div className="space-y-6">
                  {/* Link */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Insert Link</Label>
                    <div className="space-y-2">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                        className="w-full"
                      />
                      <Input
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        placeholder="Link text (optional)"
                        className="w-full"
                      />
                      <Button onClick={handleLinkSubmit} className="w-full">
                  Insert Link
                </Button>
              </div>
            </div>

                  {/* Image */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Insert Image</Label>
                    <div className="space-y-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                        className="w-full"
                />
                      <Button onClick={handleImageSubmit} className="w-full">
                        Insert Image
                      </Button>
              {onImageUpload && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full p-2 border border-gray-300 rounded"
                    disabled={isUploading}
                  />
                          {isUploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                        </div>
                  )}
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === 'advanced' && (
                <div className="space-y-6">
                  {/* Indentation */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Indentation</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeCommand('indent')}
                        className="flex-1"
                      >
                        <Indent className="h-4 w-4 mr-1" />
                        Indent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeCommand('outdent')}
                        className="flex-1"
                      >
                        <Outdent className="h-4 w-4 mr-1" />
                        Outdent
                      </Button>
                    </div>
                  </div>

                  {/* Clear Formatting */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Clear Formatting</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeCommand('removeFormat')}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Clear All Formatting
                    </Button>
                  </div>

                  {/* Copy/Paste */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Copy/Paste</Label>
                    <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                        size="sm"
                        onClick={() => executeCommand('copy')}
                >
                        Copy
                </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeCommand('paste')}
                      >
                        Paste
                </Button>
              </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}