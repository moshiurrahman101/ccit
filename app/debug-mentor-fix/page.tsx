'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DebugMentorFixPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixMentorInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/fix-mentor-info?batchId=68ceda1b24d6e204a4d297b9');
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to fix mentor info');
      }
    } catch (error) {
      console.error('Error fixing mentor info:', error);
      toast.error('Failed to fix mentor info');
    } finally {
      setLoading(false);
    }
  };

  const checkMentorInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/batch-mentor-info?batchId=68ceda1b24d6e204a4d297b9');
      const data = await response.json();
      
      if (response.ok) {
        setResult(data.debug);
        toast.success('Mentor info checked');
      } else {
        toast.error('Failed to check mentor info');
      }
    } catch (error) {
      console.error('Error checking mentor info:', error);
      toast.error('Failed to check mentor info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mentor Information Debug & Fix</CardTitle>
          <p className="text-gray-600">Batch ID: 68ceda1b24d6e204a4d297b9</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={checkMentorInfo} disabled={loading} variant="outline">
              Check Current Status
            </Button>
            <Button onClick={fixMentorInfo} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              Fix Mentor Info
            </Button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Result:</h3>
              <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
