'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ResponsivePaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  invoiceId: string;
  batchName: string;
  amount: number;
  remainingAmount: number;
  totalAmount: number;
}

export default function ResponsivePaymentForm({
  isOpen,
  onClose,
  onPaymentSuccess,
  invoiceId,
  batchName,
  amount,
  remainingAmount,
  totalAmount
}: ResponsivePaymentFormProps) {
  console.log('ResponsivePaymentForm rendered with:', {
    isOpen,
    invoiceId,
    batchName,
    amount,
    remainingAmount
  });
  const [formData, setFormData] = useState({
    paymentType: 'full', // 'full' or 'partial'
    paymentAmount: remainingAmount.toString(),
    paymentMethod: 'bkash',
    senderNumber: '',
    transactionId: '',
    referenceNumber: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.senderNumber.trim()) {
      newErrors.senderNumber = 'প্রেরক নম্বর প্রয়োজন';
    } else if (!/^(\+88)?01[3-9]\d{8}$/.test(formData.senderNumber)) {
      newErrors.senderNumber = 'সঠিক ফোন নম্বর দিন (01XXXXXXXXX)';
    }

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'ট্রানজেকশন আইডি প্রয়োজন';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'পেমেন্ট পদ্ধতি নির্বাচন করুন';
    }

    if (!formData.paymentAmount.trim()) {
      newErrors.paymentAmount = 'পেমেন্ট পরিমাণ প্রয়োজন';
    } else {
      const amount = parseFloat(formData.paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.paymentAmount = 'সঠিক পরিমাণ দিন';
      } else if (amount > remainingAmount) {
        newErrors.paymentAmount = `পরিমাণ ${remainingAmount.toLocaleString('en-BD')} টাকার বেশি হতে পারবে না`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন');
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
          amount: parseFloat(formData.paymentAmount),
          paymentMethod: formData.paymentMethod,
          senderNumber: formData.senderNumber,
          transactionId: formData.transactionId,
          referenceNumber: formData.referenceNumber || formData.transactionId,
          paymentType: formData.paymentType,
          paymentScreenshot: '', // Add file upload later
          bankReceipt: '', // Add file upload later
          otherDocuments: []
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('পেমেন্ট সফলভাবে জমা হয়েছে! প্রশাসকের অনুমোদনের অপেক্ষায় রয়েছে।');
        onPaymentSuccess();
        onClose();
        resetForm();
      } else {
        toast.error(data.message || 'পেমেন্ট জমা করতে সমস্যা হয়েছে');
      }
      
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('পেমেন্ট জমা করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      paymentType: 'full',
      paymentAmount: remainingAmount.toString(),
      paymentMethod: 'bkash',
      senderNumber: '',
      transactionId: '',
      referenceNumber: '',
      notes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      case 'bank': return 'Bank Transfer';
      case 'cash': return 'Cash';
      default: return method;
    }
  };

  console.log('Rendering ResponsivePaymentForm dialog, isOpen:', isOpen);
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-orange-600" />
            পেমেন্ট করুন
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            <div className="space-y-2">
              <div><strong>ব্যাচ:</strong> {batchName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>মোট পরিমাণ:</strong> ৳{totalAmount.toLocaleString('en-BD')}</div>
                  <div><strong>বাকি পরিমাণ:</strong> ৳{remainingAmount.toLocaleString('en-BD')}</div>
                </div>
                <div>
                  <div><strong>পরিশোধিত:</strong> ৳{(totalAmount - remainingAmount).toLocaleString('en-BD')}</div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Type */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">পেমেন্ট টাইপ *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.paymentType === 'full' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    paymentType: 'full',
                    paymentAmount: remainingAmount.toString()
                  }));
                }}
                className="w-full"
              >
                পূর্ণ পেমেন্ট
              </Button>
              <Button
                type="button"
                variant={formData.paymentType === 'partial' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    paymentType: 'partial',
                    paymentAmount: ''
                  }));
                }}
                className="w-full"
              >
                আংশিক পেমেন্ট
              </Button>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="paymentAmount" className="text-gray-700 font-medium">
              পেমেন্ট পরিমাণ *
            </Label>
            <div className="relative">
              <Input
                id="paymentAmount"
                type="number"
                placeholder="0"
                value={formData.paymentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                className="w-full pr-20"
                disabled={formData.paymentType === 'full'}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                টাকা
              </div>
            </div>
            {errors.paymentAmount && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.paymentAmount}
              </p>
            )}
            {formData.paymentType === 'partial' && (
              <p className="text-xs text-gray-500">
                সর্বোচ্চ: ৳{remainingAmount.toLocaleString('en-BD')} টাকা
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-gray-700 font-medium">
              পেমেন্ট পদ্ধতি *
            </Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger id="paymentMethod" className="w-full">
                <SelectValue placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="rocket">Rocket</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.paymentMethod}
              </p>
            )}
          </div>

          {/* Sender Number */}
          <div className="space-y-2">
            <Label htmlFor="senderNumber" className="text-gray-700 font-medium">
              প্রেরক নম্বর *
            </Label>
            <Input
              id="senderNumber"
              placeholder="01XXXXXXXXX"
              value={formData.senderNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, senderNumber: e.target.value }))}
              className="w-full"
            />
            {errors.senderNumber && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.senderNumber}
              </p>
            )}
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="transactionId" className="text-gray-700 font-medium">
              ট্রানজেকশন আইডি *
            </Label>
            <Input
              id="transactionId"
              placeholder="FDGDT13431HNJ"
              value={formData.transactionId}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
              className="w-full"
            />
            {errors.transactionId && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.transactionId}
              </p>
            )}
          </div>

          {/* Reference Number (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="referenceNumber" className="text-gray-700">
              রেফারেন্স নম্বর (ঐচ্ছিক)
            </Label>
            <Input
              id="referenceNumber"
              placeholder="রেফারেন্স নম্বর"
              value={formData.referenceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700">
              নোট (ঐচ্ছিক)
            </Label>
            <Textarea
              id="notes"
              placeholder="পেমেন্ট সম্পর্কে অতিরিক্ত তথ্য..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full"
              rows={3}
            />
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-semibold text-blue-900 mb-2">পেমেন্ট নির্দেশনা:</div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {formData.paymentType === 'full' ? 'পূর্ণ পেমেন্ট' : 'আংশিক পেমেন্ট'} করুন</li>
              <li>• পরিমাণ: ৳{formData.paymentAmount ? parseFloat(formData.paymentAmount).toLocaleString('en-BD') : '0'} টাকা</li>
              <li>• {getPaymentMethodText(formData.paymentMethod)} এর মাধ্যমে পেমেন্ট করুন</li>
              <li className="font-semibold mt-2">পেমেন্ট করুন এই নম্বরে:</li>
              {formData.paymentMethod === 'bkash' && (
                <li className="ml-4">• bKash: <strong>০১৬০৩৭১৮৩৭৯</strong></li>
              )}
              {formData.paymentMethod === 'nagad' && (
                <li className="ml-4">• Nagad: <strong>০১৮৪৫২০২১০১</strong></li>
              )}
              {formData.paymentMethod === 'rocket' && (
                <li className="ml-4">• Rocket: <strong>০১৮৪৫২০২১০১</strong></li>
              )}
              <li>• সঠিক ট্রানজেকশন আইডি প্রদান করুন</li>
              <li>• পেমেন্ট স্লিপ/স্ক্রিনশট সংরক্ষণ করুন</li>
              <li>• প্রশাসক যাচাই করার পর পেমেন্ট অনুমোদিত হবে</li>
              {formData.paymentType === 'partial' && (
                <li>• আংশিক পেমেন্টের পর বাকি পরিমাণ: ৳{(remainingAmount - parseFloat(formData.paymentAmount || '0')).toLocaleString('en-BD')} টাকা</li>
              )}
            </ul>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                সাবমিট হচ্ছে...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                পেমেন্ট সাবমিট করুন
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
