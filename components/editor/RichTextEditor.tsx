'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Undo,
  Redo,
  Strikethrough,
  Type,
  Palette,
  Table,
  Minus,
  Plus,
  Save,
  Eye
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
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  const insertLink = () => {
    setShowLinkDialog(true);
  };

  const insertImage = () => {
    setShowImageDialog(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      if (linkText) {
        // Insert link with custom text
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const linkElement = document.createElement('a');
          linkElement.href = linkUrl;
          linkElement.textContent = linkText;
          range.deleteContents();
          range.insertNode(linkElement);
        }
      } else {
        executeCommand('createLink', linkUrl);
      }
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
      updateContent();
    }
  };

  const handleImageSubmit = async () => {
    if (imageUrl) {
      executeCommand('insertImage', imageUrl);
      setShowImageDialog(false);
      setImageUrl('');
      updateContent();
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return;
    
    setIsUploading(true);
    try {
      const url = await onImageUpload(file);
      executeCommand('insertImage', url);
      setShowImageDialog(false);
      updateContent();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const insertTable = () => {
    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px;">Cell 1</td>
          <td style="padding: 8px;">Cell 2</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Cell 3</td>
          <td style="padding: 8px;">Cell 4</td>
        </tr>
      </table>
    `;
    executeCommand('insertHTML', table);
  };

  const insertHorizontalRule = () => {
    executeCommand('insertHorizontalRule');
  };

  const changeFontSize = (size: string) => {
    executeCommand('fontSize', size);
  };

  const changeFontColor = (color: string) => {
    executeCommand('foreColor', color);
  };

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    title, 
    isActive = false 
  }: { 
    onClick: () => void; 
    icon: any; 
    title: string; 
    isActive?: boolean;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Text formatting */}
        <div className="flex gap-1 mr-2 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => executeCommand('bold')}
            icon={Bold}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => executeCommand('italic')}
            icon={Italic}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => executeCommand('underline')}
            icon={Underline}
            title="Underline"
          />
          <ToolbarButton
            onClick={() => executeCommand('strikeThrough')}
            icon={Strikethrough}
            title="Strikethrough"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 mr-2 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'h1')}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'h2')}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'h3')}
            icon={Heading3}
            title="Heading 3"
          />
        </div>

        {/* Lists and quotes */}
        <div className="flex gap-1 mr-2 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => executeCommand('insertUnorderedList')}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => executeCommand('insertOrderedList')}
            icon={ListOrdered}
            title="Numbered List"
          />
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'blockquote')}
            icon={Quote}
            title="Quote"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 mr-2 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => executeCommand('justifyLeft')}
            icon={AlignLeft}
            title="Align Left"
          />
          <ToolbarButton
            onClick={() => executeCommand('justifyCenter')}
            icon={AlignCenter}
            title="Align Center"
          />
          <ToolbarButton
            onClick={() => executeCommand('justifyRight')}
            icon={AlignRight}
            title="Align Right"
          />
        </div>

        {/* Links and media */}
        <div className="flex gap-1 mr-2 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={insertLink}
            icon={Link}
            title="Insert Link"
          />
          <ToolbarButton
            onClick={insertImage}
            icon={Image}
            title="Insert Image"
          />
          <ToolbarButton
            onClick={insertTable}
            icon={Table}
            title="Insert Table"
          />
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', 'pre')}
            icon={Code}
            title="Code Block"
          />
        </div>

        {/* Advanced formatting */}
        <div className="flex gap-1 mr-2 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={insertHorizontalRule}
            icon={Minus}
            title="Horizontal Rule"
          />
          <select 
            onChange={(e) => changeFontSize(e.target.value)}
            className="text-xs border border-gray-300 rounded px-1 py-1"
            defaultValue=""
          >
            <option value="">Font Size</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
          </select>
          <input
            type="color"
            onChange={(e) => changeFontColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="Text Color"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => executeCommand('undo')}
            icon={Undo}
            title="Undo"
          />
          <ToolbarButton
            onClick={() => executeCommand('redo')}
            icon={Redo}
            title="Redo"
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[400px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
        style={{
          fontSize: '16px',
          lineHeight: '1.6'
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Placeholder */}
      {!content && !isFocused && (
        <div className="absolute top-[120px] left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Link Text (optional)</label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL *</label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleLinkSubmit}>
                  Insert Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {onImageUpload && (
                <div>
                  <label className="block text-sm font-medium mb-2">Or Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="w-full"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  )}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowImageDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleImageSubmit}>
                  Insert Image
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
