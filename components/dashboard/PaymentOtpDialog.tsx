'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';

interface PaymentOtpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (otp: string) => Promise<void> | void;
}

export default function PaymentOtpDialog({ isOpen, onClose, onVerified }: PaymentOtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const requestOtp = async () => {
    try {
      setIsSending(true);
      setMessage(null);
      const res = await fetch('/api/admin/payments/otp', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage('ইমেইলে OTP পাঠানো হয়েছে');
      } else {
        setMessage(data.message || 'OTP পাঠাতে ব্যর্থ');
      }
    } catch (e) {
      setMessage('OTP পাঠাতে ব্যর্থ');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) return;
    setIsVerifying(true);
    try {
      await onVerified(otp.trim());
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[320px] p-0 overflow-hidden rounded-xl border border-gray-100 shadow-2xl">
        <div className="px-4 pt-4">
          <DialogHeader>
            <DialogTitle className="text-base">সংবেদনশীল ক্রিয়া নিশ্চিতকরণ</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">পেমেন্ট রেকর্ড মুছে ফেলতে ইমেইল OTP যাচাই করুন</DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-800">এই ক্রিয়াটি অপরিবর্তনীয়। আপনি আপনার ইমেইলে পাঠানো OTP দিয়ে নিশ্চিত করুন।</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-xs">ইমেইল OTP</Label>
            <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value.toUpperCase())} placeholder="XXXXXX" className="text-center tracking-widest" maxLength={6} />
          </div>

          {message && (
            <div className="text-[11px] text-gray-600">{message}</div>
          )}

          <div className="flex gap-2 pt-1">
            <Button onClick={requestOtp} variant="outline" className="flex-1 h-9 text-sm" disabled={isSending}>
              {isSending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> পাঠানো হচ্ছে...</>) : 'OTP পাঠান'}
            </Button>
            <Button onClick={handleVerify} className="flex-1 h-9 text-sm bg-red-500 hover:bg-red-600 text-white" disabled={isVerifying || !otp.trim()}>
              {isVerifying ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> যাচাই হচ্ছে...</>) : 'যাচাই করে ডিলিট'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

