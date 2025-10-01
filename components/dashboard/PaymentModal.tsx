'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, CreditCard, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchName: string;
  amount: number;
  invoiceId: string;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  batchName,
  amount,
  invoiceId,
  onPaymentSuccess
}: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: 'bkash',
    senderNumber: '',
    transactionId: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.senderNumber.trim()) {
      toast.error('প্রেরক নম্বর প্রয়োজন');
      return;
    }

    if (!formData.transactionId.trim()) {
      toast.error('ট্রানজেকশন আইডি প্রয়োজন');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          amount: amount,
          paymentMethod: formData.paymentMethod,
          senderNumber: formData.senderNumber,
          transactionId: formData.transactionId,
          referenceNumber: formData.transactionId, // Using transactionId as reference
          paymentType: amount >= 10000 ? 'full' : 'partial', // Determine based on amount
          paymentScreenshot: '', // Add file upload functionality later
          bankReceipt: '', // Add file upload functionality later
          otherDocuments: []
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('পেমেন্ট সফলভাবে জমা হয়েছে! প্রশাসকের অনুমোদনের অপেক্ষায় রয়েছে।');
        onPaymentSuccess();
        onClose();
        
        // Reset form
        setFormData({
          paymentMethod: 'bkash',
          senderNumber: '',
          transactionId: '',
          notes: ''
        });
      } else {
        toast.error(data.message || 'পেমেন্ট জমা করতে সমস্যা হয়েছে');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('পেমেন্ট জমা করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  সফলভাবে এনরোল হয়েছে!
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {batchName} কোর্সে সফলভাবে এনরোল হয়েছে। পেমেন্ট সম্পন্ন করুন।
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Amount */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">পেমেন্ট পরিমাণ</h3>
                <p className="text-sm text-blue-700">কোর্স ফি</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                পেমেন্ট পদ্ধতি
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleChange('paymentMethod', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="rocket">Rocket</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="senderNumber" className="text-sm font-medium text-gray-700">
                প্রেরক নম্বর *
              </Label>
              <Input
                id="senderNumber"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.senderNumber}
                onChange={(e) => handleChange('senderNumber', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700">
                ট্রানজেকশন আইডি (ঐচ্ছিক)
              </Label>
              <Input
                id="transactionId"
                type="text"
                placeholder="FDGDT13431HNJ"
                value={formData.transactionId}
                onChange={(e) => handleChange('transactionId', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                অতিরিক্ত নোট (ঐচ্ছিক)
              </Label>
              <Textarea
                id="notes"
                placeholder="পেমেন্ট সম্পর্কে অতিরিক্ত তথ্য..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">পেমেন্ট নির্দেশনা:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• পেমেন্ট সম্পন্ন করার পর উপরের তথ্য পূরণ করুন</li>
              <li>• ট্রানজেকশন আইডি সঠিকভাবে লিখুন</li>
              <li>• পেমেন্ট যাচাইকরণের পর কোর্সে অ্যাক্সেস পাবেন</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              পরে করব
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  জমা হচ্ছে...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  পেমেন্ট সাবমিট করুন
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
