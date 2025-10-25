'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Star as StarIcon, Star, Filter, Trash2, TrendingUp, Eye, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { AdminReviewForm } from '@/components/review/AdminReviewForm';

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
  isApproved: boolean;
  isFeatured: boolean;
  isSuccessStory: boolean;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function ReviewsManagementPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন - দয়াকরে লগইন করুন');
        return;
      }

      let url = '/api/admin/reviews?limit=100';
      if (filter === 'pending') {
        url += '&isApproved=false';
      } else if (filter === 'approved') {
        url += '&isApproved=true';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'রিভিউ লোড করতে ব্যর্থ হয়েছে');
      }

      setReviews(data.reviews || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'রিভিউ লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete' | 'feature' | 'unfeature') => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('অনুমোদন প্রয়োজন');
        return;
      }

      let url = '/api/admin/reviews';
      let options: RequestInit = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (action === 'delete') {
        // DELETE method with query parameter
        url += `?id=${reviewId}`;
        options.method = 'DELETE';
      } else {
        // PATCH method with body
        options.method = 'PATCH';
        options.headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        options.body = JSON.stringify({
          reviewId,
          action
        });
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'অপারেশন ব্যর্থ হয়েছে');
      }

      toast.success(data.message || 'সফল হয়েছে');
      fetchReviews();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'অপারেশন ব্যর্থ হয়েছে');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const pendingCount = reviews.filter(r => !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">রিভিউ ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-2">শিক্ষার্থীদের রিভিউ দেখুন, অনুমোদন করুন এবং পরিচালনা করুন</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showAddForm ? 'ফর্ম লুকান' : 'নতুন রিভিউ যোগ করুন'}
        </Button>
      </div>

      {/* Add Review Form */}
      {showAddForm && !editingReview && (
        <div className="mb-8">
          <AdminReviewForm onSuccess={() => {
            setShowAddForm(false);
            fetchReviews();
          }} />
        </div>
      )}

      {/* Edit Review Form */}
      {editingReview && (
        <div className="mb-8">
          <AdminReviewForm 
            review={editingReview}
            onSuccess={() => {
              setEditingReview(null);
              fetchReviews();
            }}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট রিভিউ</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অনুমোদন অপেক্ষা করছে</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অনুমোদিত</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          সব রিভিউ ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="inline w-4 h-4 mr-2" />
          অনুমোদন অপেক্ষা ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'approved'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          অনুমোদিত ({approvedCount})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">কোনো রিভিউ পাওয়া যায়নি</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id} className={!review.isApproved ? 'border-orange-300 bg-orange-50/50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <CardDescription>
                        {review.role} {review.company && `at ${review.company}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.isFeatured && (
                      <Badge className="bg-yellow-500">বৈশিষ্ট্যযুক্ত</Badge>
                    )}
                    {review.isSuccessStory && (
                      <Badge className="bg-green-500">সফলতার গল্প</Badge>
                    )}
                    {review.isApproved ? (
                      <Badge className="bg-green-500">অনুমোদিত</Badge>
                    ) : (
                      <Badge className="bg-orange-500">অনুমোদন অপেক্ষা</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>

                  {/* Earning */}
                  {review.earning && (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">{review.earning}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {!review.isApproved && (
                      <Button
                        onClick={() => handleAction(review._id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        অনুমোদন করুন
                      </Button>
                    )}
                    {review.isApproved && (
                      <Button
                        onClick={() => handleAction(review._id, 'reject')}
                        variant="outline"
                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        প্রত্যাখ্যান করুন
                      </Button>
                    )}
                    {review.isApproved && !review.isFeatured && (
                      <Button
                        onClick={() => handleAction(review._id, 'feature')}
                        variant="outline"
                        className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                      >
                        বৈশিষ্ট্যযুক্ত করুন
                      </Button>
                    )}
                    {review.isFeatured && (
                      <Button
                        onClick={() => handleAction(review._id, 'unfeature')}
                        variant="outline"
                        className="border-gray-600 text-gray-600 hover:bg-gray-50"
                      >
                        বৈশিষ্ট্য সরান
                      </Button>
                    )}
                    <Button
                      onClick={() => setEditingReview(review)}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      সম্পাদনা করুন
                    </Button>
                    <Button
                      onClick={() => handleAction(review._id, 'delete')}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 ml-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      মুছুন
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
