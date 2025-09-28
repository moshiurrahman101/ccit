'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';

interface BulkActionsProps {
  selectedUsers: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function BulkActions({ selectedUsers, onClearSelection, onRefresh }: BulkActionsProps) {
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleBulkAction = async () => {
    if (!action || selectedUsers.length === 0) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        onClearSelection();
        onRefresh();
      } else {
        setError(data.error || 'একটি সমস্যা হয়েছে');
      }
    } catch (error) {
      setError('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (selectedUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-orange-800">
            {selectedUsers.length} ব্যবহারকারী নির্বাচিত
          </span>
          
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="কর্ম নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activate">সক্রিয় করুন</SelectItem>
              <SelectItem value="deactivate">নিষ্ক্রিয় করুন</SelectItem>
              <SelectItem value="delete">মুছে ফেলুন</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleBulkAction}
            disabled={!action || loading}
            size="sm"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            প্রয়োগ করুন
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
        >
          বাতিল
        </Button>
      </div>

      {message && (
        <Alert className="mt-2">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
