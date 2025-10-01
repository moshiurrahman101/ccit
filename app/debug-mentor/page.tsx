'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugMentorPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testMentorProfile = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setResult({ error: 'No token found in localStorage' });
        return;
      }

      console.log('Testing mentor profile check API...');
      const response = await fetch('/api/mentor/check-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      console.error('Error testing mentor profile:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testMentorBatches = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setResult({ error: 'No token found in localStorage' });
        return;
      }

      console.log('Testing mentor batches API...');
      const response = await fetch('/api/mentor/batches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      console.error('Error testing mentor batches:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        setResult({ error: 'No token found in localStorage' });
        return;
      }

      console.log('Testing auth API...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Auth response:', data);
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      console.error('Error testing auth:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Mentor API</h1>
      
      <div className="flex gap-4">
        <Button onClick={testAuth} disabled={loading}>
          {loading ? 'Testing...' : 'Test Auth API'}
        </Button>
        <Button onClick={testMentorProfile} disabled={loading}>
          {loading ? 'Testing...' : 'Test Mentor Profile'}
        </Button>
        <Button onClick={testMentorBatches} disabled={loading}>
          {loading ? 'Testing...' : 'Test Mentor Batches API'}
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
