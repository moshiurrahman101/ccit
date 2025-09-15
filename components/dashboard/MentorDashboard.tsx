'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Clock, Upload } from 'lucide-react';

export function MentorDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          মেন্টর ড্যাশবোর্ড
        </h1>
        <p className="text-gray-600">
          আপনার কোর্স এবং শিক্ষার্থীদের ব্যবস্থাপনা
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আমার কোর্স</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৫</div>
            <p className="text-xs text-muted-foreground">
              সক্রিয় কোর্স
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">শিক্ষার্থী</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">১৫০</div>
            <p className="text-xs text-muted-foreground">
              এনরোল করা শিক্ষার্থী
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের ক্লাস</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">২</div>
            <p className="text-xs text-muted-foreground">
              শিডিউল করা ক্লাস
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">রিসোর্স</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৪৫</div>
            <p className="text-xs text-muted-foreground">
              আপলোড করা ফাইল
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          মেন্টর ড্যাশবোর্ড উন্নয়নাধীন
        </h2>
        <p className="text-gray-600">
            শীঘ্রই সম্পূর্ণ মেন্টর ড্যাশবোর্ড পাওয়া যাবে
        </p>
      </div>
    </div>
  );
}
