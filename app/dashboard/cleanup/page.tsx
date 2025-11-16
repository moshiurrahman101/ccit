'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  Database,
  UserMinus
} from 'lucide-react';

export default function CleanupPage() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Student-specific cleanup state
  const [studentEmail, setStudentEmail] = useState('');
  const [isCleaningStudent, setIsCleaningStudent] = useState(false);
  const [studentCleanupResult, setStudentCleanupResult] = useState<any>(null);
  const [studentError, setStudentError] = useState<string | null>(null);

  const handleCleanup = async () => {
    setIsCleaning(true);
    setError(null);
    setCleanupResult(null);

    try {
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
      };
      
      const token = getCookie('auth-token');

      const response = await fetch('/api/admin/cleanup-enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCleanupResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Cleanup failed');
      }
    } catch (err) {
      setError('Network error occurred during cleanup');
      console.error('Cleanup error:', err);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleStudentCleanup = async () => {
    if (!studentEmail.trim()) {
      setStudentError('ইমেইল প্রয়োজন');
      return;
    }

    setIsCleaningStudent(true);
    setStudentError(null);
    setStudentCleanupResult(null);

    try {
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
      };
      
      const token = getCookie('auth-token');

      const response = await fetch('/api/admin/cleanup-student-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: studentEmail.trim().toLowerCase() })
      });

      if (response.ok) {
        const result = await response.json();
        setStudentCleanupResult(result);
        setStudentEmail(''); // Clear email after successful cleanup
      } else {
        const errorData = await response.json();
        setStudentError(errorData.error || errorData.details || 'Student cleanup failed');
      }
    } catch (err) {
      setStudentError('Network error occurred during cleanup');
      console.error('Student cleanup error:', err);
    } finally {
      setIsCleaningStudent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ডেটা ক্লিনআপ</h1>
        <p className="text-gray-600 mt-2">এনরোলমেন্ট এবং ইনভয়েস ডেটা পরিচ্ছন্ন করুন</p>
      </div>

      {/* Warning Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>সতর্কতা:</strong> এই অপারেশন সমস্ত এনরোলমেন্ট এবং ইনভয়েস ডেটা মুছে ফেলবে। 
          এটি একটি স্থায়ী অপারেশন যা পূর্বাবস্থায় ফেরানো যাবে না।
        </AlertDescription>
      </Alert>

      {/* Cleanup Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            এনরোলমেন্ট ডেটা ক্লিনআপ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">এই অপারেশন করবে:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• সমস্ত ইনভয়েস ডেটা মুছে ফেলবে</li>
              <li>• সমস্ত ব্যাচের currentStudents কাউন্ট ০-এ রিসেট করবে</li>
              <li>• সমস্ত এনরোলমেন্ট রেকর্ড মুছে ফেলবে</li>
            </ul>
          </div>

          <Button 
            onClick={handleCleanup}
            disabled={isCleaning}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            {isCleaning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ক্লিনআপ চলছে...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                ডেটা ক্লিনআপ করুন
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {cleanupResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              ক্লিনআপ সম্পন্ন হয়েছে
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">মুছে ফেলা ইনভয়েস</p>
                <p className="text-2xl font-bold text-green-600">
                  {cleanupResult.deletedInvoices}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">রিসেট করা ব্যাচ</p>
                <p className="text-2xl font-bold text-green-600">
                  {cleanupResult.resetBatches}
                </p>
              </div>
            </div>
            <div className="text-sm text-green-700">
              <p>মোট ইনভয়েস: {cleanupResult.totalInvoices}</p>
              <p>মোট ব্যাচ: {cleanupResult.totalBatches}</p>
            </div>
            <Alert className="border-green-200 bg-green-100">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ক্লিনআপ সফলভাবে সম্পন্ন হয়েছে। এখন আপনি নতুন করে এনরোল করতে পারবেন।
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Student-Specific Cleanup Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5" />
            নির্দিষ্ট শিক্ষার্থীর ডেটা ক্লিনআপ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">এই অপারেশন করবে:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• নির্দিষ্ট শিক্ষার্থীর সব এনরোলমেন্ট মুছে ফেলবে</li>
              <li>• নির্দিষ্ট শিক্ষার্থীর সব ইনভয়েস মুছে ফেলবে</li>
              <li>• নির্দিষ্ট শিক্ষার্থীর সব পেমেন্ট মুছে ফেলবে</li>
              <li>• নির্দিষ্ট শিক্ষার্থীর সব উপস্থিতি রেকর্ড মুছে ফেলবে</li>
              <li>• সংশ্লিষ্ট ব্যাচের student count আপডেট করবে</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-email">শিক্ষার্থীর ইমেইল</Label>
            <Input
              id="student-email"
              type="email"
              placeholder="student@example.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              disabled={isCleaningStudent}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              শিক্ষার্থীর ইমেইল এড্রেস লিখুন যার ডেটা ক্লিনআপ করতে চান
            </p>
          </div>

          <Button 
            onClick={handleStudentCleanup}
            disabled={isCleaningStudent || !studentEmail.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isCleaningStudent ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ক্লিনআপ চলছে...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                শিক্ষার্থীর ডেটা ক্লিনআপ করুন
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Student Cleanup Results */}
      {studentCleanupResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              শিক্ষার্থীর ডেটা ক্লিনআপ সম্পন্ন হয়েছে
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {studentCleanupResult.student && (
              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600">শিক্ষার্থী তথ্য</p>
                <p className="font-semibold text-gray-900">{studentCleanupResult.student.name}</p>
                <p className="text-sm text-gray-600">{studentCleanupResult.student.email}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">এনরোলমেন্ট</p>
                <p className="text-2xl font-bold text-green-600">
                  {studentCleanupResult.deleted.enrollments}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">ইনভয়েস</p>
                <p className="text-2xl font-bold text-green-600">
                  {studentCleanupResult.deleted.invoices}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">পেমেন্ট</p>
                <p className="text-2xl font-bold text-green-600">
                  {studentCleanupResult.deleted.payments}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">উপস্থিতি</p>
                <p className="text-2xl font-bold text-green-600">
                  {studentCleanupResult.deleted.attendance}
                </p>
              </div>
            </div>

            {studentCleanupResult.deleted.batchesUpdated > 0 && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">আপডেট করা ব্যাচ</p>
                <p className="text-xl font-bold text-green-600">
                  {studentCleanupResult.deleted.batchesUpdated}
                </p>
              </div>
            )}

            {studentCleanupResult.summary.batchIdsAffected.length > 0 && (
              <div className="text-xs text-gray-600">
                <p className="font-semibold mb-1">প্রভাবিত ব্যাচ:</p>
                <div className="flex flex-wrap gap-1">
                  {studentCleanupResult.summary.batchIdsAffected.map((batchId: string, idx: number) => (
                    <span key={idx} className="bg-gray-100 px-2 py-1 rounded">
                      {batchId.substring(0, 8)}...
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Alert className="border-green-200 bg-green-100">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {studentCleanupResult.message || 'শিক্ষার্থীর ডেটা সফলভাবে ক্লিনআপ হয়েছে।'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Student Error */}
      {studentError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {studentError}
          </AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            পরবর্তী ধাপ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <p>১. ক্লিনআপ সম্পন্ন হওয়ার পর, ব্যাচ পেজে যান</p>
            <p>২. এখন "আপনার সিট বুক করুন" বাটন দেখতে পাবেন</p>
            <p>৩. এনরোল করুন এবং ইনভয়েস দেখুন</p>
            <p>৪. ইনভয়েস ডাউনলোড করতে পারবেন</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
