'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, TrendingUp, Loader2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';

interface ReviewFormData {
  name: string;
  email: string;
  role: string;
  company: string;
  rating: number;
  review: string;
  earning: string;
  isSuccessStory: boolean;
  avatar: string;
  earningScreenshot: string;
}

interface Review {
  _id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  rating: number;
  review: string;
  earning?: string;
  avatar?: string;
  earningScreenshot?: string;
  isSuccessStory: boolean;
}

interface AdminReviewFormProps {
  review?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdminReviewForm({ review, onSuccess, onCancel }: AdminReviewFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ReviewFormData>({
    name: review?.name || '',
    email: review?.email || '',
    role: review?.role || '',
    company: review?.company || '',
    rating: review?.rating || 5,
    review: review?.review || '',
    earning: review?.earning || '',
    isSuccessStory: review?.isSuccessStory || false,
    avatar: review?.avatar || '',
    earningScreenshot: review?.earningScreenshot || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  // Update form data when review prop changes
  useEffect(() => {
    if (review) {
      setFormData({
        name: review.name || '',
        email: review.email || '',
        role: review.role || '',
        company: review.company || '',
        rating: review.rating || 5,
        review: review.review || '',
        earning: review.earning || '',
        isSuccessStory: review.isSuccessStory || false,
        avatar: review.avatar || '',
        earningScreenshot: review.earningScreenshot || ''
      });
    }
  }, [review]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'screenshot') => {
    try {
      if (type === 'avatar') {
        setUploadingAvatar(true);
      } else {
        setUploadingScreenshot(true);
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, avatar: data.url }));
        toast.success('প্রোফাইল ছবি আপলোড হয়েছে!');
      } else {
        setFormData(prev => ({ ...prev, earningScreenshot: data.url }));
        toast.success('সালামির স্ক্রিনশট আপলোড হয়েছে!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setUploadingAvatar(false);
      setUploadingScreenshot(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const url = review ? `/api/admin/reviews` : '/api/reviews';
      const method = review ? 'PATCH' : 'POST';

      const body = review
        ? JSON.stringify({
            reviewId: review._id,
            action: 'update',
            data: formData
          })
        : JSON.stringify(formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (review ? 'Failed to update review' : 'Failed to create review'));
      }

      toast.success(review ? 'রিভিউ সফলভাবে আপডেট হয়েছে!' : 'রিভিউ সফলভাবে তৈরি হয়েছে এবং অনুমোদিত হয়েছে!');
      
      // Reset form only if creating new review
      if (!review) {
        setFormData({
          name: '',
          email: '',
          role: '',
          company: '',
          rating: 5,
          review: '',
          earning: '',
          isSuccessStory: false,
          avatar: '',
          earningScreenshot: ''
        });
      }

      // Call success callback to refresh reviews list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (review ? 'রিভিউ আপডেট করতে ব্যর্থ হয়েছে' : 'রিভিউ তৈরি করতে ব্যর্থ হয়েছে'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{review ? 'রিভিউ সম্পাদনা করুন' : 'নতুন রিভিউ যোগ করুন'}</CardTitle>
        <CardDescription>
          {review ? 'রিভিউ তথ্য আপডেট করুন' : 'শিক্ষার্থীর রিভিউ ম্যানুয়ালি তৈরি করুন এবং সরাসরি প্রকাশ করুন'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">শিক্ষার্থীর নাম (ইংলিশে লিখুন) *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student name in English"
                required
                pattern="[A-Za-z ]+"
                title="Please enter name in English only (A-Z, a-z, and spaces)"
              />
              <p className="text-xs text-gray-500 mt-1">ইংলিশে নাম লিখুন (শুধুমাত্র A-Z, a-z এবং স্পেস)</p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="শিক্ষার্থীর ইমেইল"
              />
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div>
            <Label>প্রোফাইল ছবি (ঐচ্ছিক)</Label>
            <div className="mt-2 flex items-center gap-4">
              {formData.avatar ? (
                <div className="relative inline-block">
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-orange-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'avatar');
                  }}
                  disabled={uploadingAvatar}
                />
                <div className="flex items-center gap-2">
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      <span className="text-sm text-gray-600">আপলোড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {formData.avatar ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">ছবি না দিলে নাম থেকে স্বয়ংক্রিয়ভাবে এভাটার তৈরি হবে</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <Label htmlFor="role">বর্তমান পদ *</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="যেমন, Full Stack Developer"
                required
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company">কোম্পানি (ঐচ্ছিক)</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="কোম্পানির নাম"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label>রেটিং *</Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {formData.rating}/৫ ⭐
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review">রিভিউ *</Label>
            <Textarea
              id="review"
              name="review"
              value={formData.review}
              onChange={handleChange}
              placeholder="শিক্ষার্থীর রিভিউ লিখুন..."
              rows={6}
              required
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.review.length}/১০০০ অক্ষর
            </p>
          </div>

          {/* Earning */}
          <div>
            <Label htmlFor="earning">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              অর্জন (ঐচ্ছিক)
            </Label>
            <Input
              id="earning"
              name="earning"
              value={formData.earning}
              onChange={handleChange}
              placeholder="যেমন, ৳৮০,০০০/মাস"
            />
          </div>

          {/* Earnings Screenshot Upload */}
          <div>
            <Label>
              <ImageIcon className="inline w-4 h-4 mr-1" />
              অর্জনের স্ক্রিনশট (ঐচ্ছিক)
            </Label>
            <div className="mt-2 space-y-2">
              {formData.earningScreenshot && (
                <div className="relative inline-block">
                  <img
                    src={formData.earningScreenshot}
                    alt="Earning Screenshot"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, earningScreenshot: '' }))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'screenshot');
                  }}
                  disabled={uploadingScreenshot}
                />
                <div className="flex items-center gap-2">
                  {uploadingScreenshot ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                      <span className="text-sm text-gray-600">আপলোড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {formData.earningScreenshot ? 'ছবি পরিবর্তন করুন' : 'স্ক্রিনশট আপলোড করুন'}
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">অর্জনের প্রমাণ হিসেবে ছবি আপলোড করুন (যেমন: বেতনের স্ক্রিনশট)</p>
          </div>

          {/* Success Story Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSuccessStory"
              name="isSuccessStory"
              checked={formData.isSuccessStory}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <Label htmlFor="isSuccessStory" className="cursor-pointer">
              এটি একটি সফলতার গল্প হিসেবে চিহ্নিত করুন
            </Label>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-3">
            {review && onCancel && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                বাতিল করুন
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              className={review ? "flex-1" : "w-full"}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {review ? 'আপডেট করা হচ্ছে...' : 'তৈরি করা হচ্ছে...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {review ? 'রিভিউ আপডেট করুন' : 'রিভিউ তৈরি করুন'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
