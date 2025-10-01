'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (notes?: string) => void;
  onReject: (reason: string) => void;
  isLoading?: boolean;
  paymentId?: string;
  studentName?: string;
  amount?: number;
}

export default function PaymentVerificationModal({
  isOpen,
  onClose,
  onVerify,
  onReject,
  isLoading = false,
  paymentId,
  studentName,
  amount
}: PaymentVerificationModalProps) {
  const [action, setAction] = useState<'verify' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (action === 'verify') {
      onVerify(notes || undefined);
    } else if (action === 'reject' && reason.trim()) {
      onReject(reason);
    }
  };

  const handleClose = () => {
    setAction(null);
    setNotes('');
    setReason('');
    onClose();
  };

  const isSubmitDisabled = action === 'reject' && !reason.trim();

  const formatAmount = (amt?: number) => {
    if (!amt && amt !== 0) return '';
    try {
      return new Intl.NumberFormat('bn-BD').format(amt);
    } catch {
      return amt.toLocaleString();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[300px] sm:max-w-[300px] p-0 overflow-hidden rounded-xl border border-gray-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="px-4 pt-4 text-base">পেমেন্ট যাচাই</DialogTitle>
          <DialogDescription className="px-4 pb-2 text-xs text-gray-500">পেমেন্ট যাচাই করুন বা প্রত্যাখ্যান করুন</DialogDescription>
        </DialogHeader>

        {(studentName || amount !== undefined) && (
          <div className="mx-4 mb-3 rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1">
            {studentName && (
              <div className="text-sm"><span className="font-semibold text-gray-700">শিক্ষার্থী:</span> {studentName}</div>
            )}
            {amount !== undefined && (
              <div className="text-sm"><span className="font-semibold text-gray-700">পরিমাণ:</span> ৳{formatAmount(amount)}</div>
            )}
          </div>
        )}

        <div className="px-4 pb-4 space-y-4">
          {!action && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">পেমেন্ট যাচাই করুন বা প্রত্যাখ্যান করুন:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setAction('verify')}
                  className="w-full h-9 text-sm bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  যাচাই করুন
                </Button>
                <Button
                  onClick={() => setAction('reject')}
                  className="w-full h-9 text-sm bg-red-500 hover:bg-red-600 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  প্রত্যাখ্যান
                </Button>
              </div>
            </div>
          )}

          {action === 'verify' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">পেমেন্ট যাচাই করুন</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs">যাচাই নোট (ঐচ্ছিক)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যাচাই সম্পর্কে অতিরিক্ত নোট লিখুন..."
                  className="min-h-[84px] text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 h-9 text-sm bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      যাচাই করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      যাচাই করুন
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setAction(null)}
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                >
                  ফিরে যান
                </Button>
              </div>
            </div>
          )}

          {action === 'reject' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">পেমেন্ট প্রত্যাখ্যান করুন</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-xs">প্রত্যাখ্যানের কারণ *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="পেমেন্ট প্রত্যাখ্যানের কারণ লিখুন..."
                  className="min-h-[84px] text-sm"
                  required
                />
                <p className="text-[11px] text-gray-500">
                  প্রত্যাখ্যানের কারণ অবশ্যই লিখতে হবে
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled || isLoading}
                  className="flex-1 h-9 text-sm bg-red-500 hover:bg-red-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      প্রত্যাখ্যান করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      প্রত্যাখ্যান করুন
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setAction(null)}
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                >
                  ফিরে যান
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
