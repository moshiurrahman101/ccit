'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, TrendingUp, Loader2, Plus } from 'lucide-react';
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
}

export function AdminReviewForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    email: '',
    role: '',
    company: '',
    rating: 5,
    review: '',
    earning: '',
    isSuccessStory: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create review');
      }

      toast.success('রিভিউ সফলভাবে তৈরি হয়েছে এবং অনুমোদিত হয়েছে!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: '',
        company: '',
        rating: 5,
        review: '',
        earning: '',
        isSuccessStory: false
      });

      // Call success callback to refresh reviews list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'রিভিউ তৈরি করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">নতুন রিভিউ যোগ করুন</CardTitle>
        <CardDescription>
          শিক্ষার্থীর রিভিউ ম্যানুয়ালি তৈরি করুন এবং সরাসরি প্রকাশ করুন
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">শিক্ষার্থীর নাম *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="শিক্ষার্থীর নাম লিখুন"
                required
              />
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

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                তৈরি করা হচ্ছে...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                রিভিউ তৈরি করুন
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
