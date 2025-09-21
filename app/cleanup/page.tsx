'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  Database
} from 'lucide-react';

export default function CleanupPage() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCleanup = async () => {
    setIsCleaning(true);
    setError(null);
    setCleanupResult(null);

    try {
      const response = await fetch('/api/admin/cleanup-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔧 Database Cleanup</h1>
          <p className="text-xl text-gray-600">Fix enrollment data issues</p>
        </div>

        {/* Warning Alert */}
        <Alert className="border-red-200 bg-red-50 mb-6">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> This will delete ALL enrollment and invoice data. 
            This is a permanent operation that cannot be undone.
          </AlertDescription>
        </Alert>

        {/* Cleanup Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Enrollment Data Cleanup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">This operation will:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Delete all invoice data</li>
                <li>• Reset all batch currentStudents count to 0</li>
                <li>• Remove all enrollment records</li>
              </ul>
            </div>

            <Button 
              onClick={handleCleanup}
              disabled={isCleaning}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              {isCleaning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cleaning up data...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clean Up All Enrollment Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {cleanupResult && (
          <Card className="border-green-200 bg-green-50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Cleanup Completed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">Deleted Invoices</p>
                  <p className="text-2xl font-bold text-green-600">
                    {cleanupResult.deletedInvoices}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">Reset Batches</p>
                  <p className="text-2xl font-bold text-green-600">
                    {cleanupResult.resetBatches}
                  </p>
                </div>
              </div>
              <div className="text-sm text-green-700">
                <p>Total Invoices Found: {cleanupResult.totalInvoices}</p>
                <p>Total Batches Found: {cleanupResult.totalBatches}</p>
              </div>
              <Alert className="border-green-200 bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Cleanup completed successfully! You can now enroll in courses fresh.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
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
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p>After cleanup, go to the batch detail page</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p>You should now see "Book Your Seat" button instead of "Already Enrolled"</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p>Click enroll and it should work properly</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <p>Check your dashboard to see enrolled courses and download invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
