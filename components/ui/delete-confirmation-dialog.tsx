'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { getStatusText } from '@/lib/utils/statusDictionary';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
  isDestructive = true
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100' : 'bg-orange-100'}`}>
              {isDestructive ? (
                <Trash2 className={`h-5 w-5 ${isDestructive ? 'text-red-600' : 'text-orange-600'}`} />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 mt-3">
            {description}
            {itemName && (
              <span className="block mt-2 font-medium text-gray-900">
                &ldquo;{itemName}&rdquo;
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            disabled={isDeleting || isLoading}
            className="w-full sm:w-auto"
          >
            {getStatusText('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || isLoading}
            className={`w-full sm:w-auto ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
            }`}
          >
            {isDeleting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isLoading ? 'Processing...' : 'Deleting...'}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDestructive ? 'Delete' : 'Confirm'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
