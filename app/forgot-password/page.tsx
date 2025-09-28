'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে');
      } else {
        toast.error(data.message || 'একটি ত্রুটি হয়েছে');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('সার্ভার ত্রুটির কারণে অনুরোধ ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                ইমেইল পাঠানো হয়েছে
              </CardTitle>
              <CardDescription>
                পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>{email}</strong> ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। 
                  ইমেইল চেক করুন এবং লিংকে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  ইমেইল পেলেন না? স্প্যাম ফোল্ডার চেক করুন।
                </p>
                <p className="text-sm text-gray-600">
                  লিংক ১৫ মিনিটের জন্য বৈধ থাকবে।
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  আবার চেষ্টা করুন
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  লগইন পেজে যান
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              পাসওয়ার্ড ভুলে গেছেন?
            </CardTitle>
            <CardDescription className="text-center">
              আপনার ইমেইল ঠিকানা দিন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠাব
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="আপনার ইমেইল ঠিকানা দিন"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                disabled={isLoading}
              >
                {isLoading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-orange-600 hover:text-orange-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                লগইন পেজে ফিরে যান
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
