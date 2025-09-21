'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, User, FileText } from 'lucide-react';

export default function DebugStudentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDebug = async () => {
    setIsLoading(true);
    setError(null);
    setDebugData(null);

    try {
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
      };
      
      const token = getCookie('auth-token');
      console.log('Debug token:', token ? 'present' : 'missing');

      const response = await fetch('/api/debug/student-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setDebugData(data);
      } else {
        setError(data.error || 'Debug failed');
      }
    } catch (err) {
      setError('Network error occurred during debug');
      console.error('Debug error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔍 Student Data Debug</h1>
          <p className="text-xl text-gray-600">Debug student enrollment and invoice data</p>
        </div>

        {/* Debug Button */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Debug Student Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runDebug}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Debug...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Run Debug
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Debug Results */}
        {debugData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <User className="h-5 w-5" />
                Debug Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="text-lg font-bold text-blue-600">
                    {debugData.studentId}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-lg font-bold text-blue-600">
                    {debugData.studentRole}
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-green-600">
                  {debugData.invoiceCount}
                </p>
              </div>

              {debugData.invoices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Invoice Details:</h4>
                  {debugData.invoices.map((invoice: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-semibold">{invoice.invoiceNumber}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Batch: {invoice.batchName}</p>
                        <p>Amount: ৳{invoice.amount}</p>
                        <p>Status: {invoice.status}</p>
                        <p>Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                        {invoice.batchDetails && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs">Batch Status: {invoice.batchDetails.status}</p>
                            <p className="text-xs">Students: {invoice.batchDetails.currentStudents}/{invoice.batchDetails.maxStudents}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>What This Debug Shows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>• Your authentication status and user ID</p>
            <p>• Total number of invoices in the database</p>
            <p>• Detailed invoice information including batch details</p>
            <p>• Whether the data fetching is working correctly</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
