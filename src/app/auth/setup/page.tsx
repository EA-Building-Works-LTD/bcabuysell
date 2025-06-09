'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SetupGuidePage() {
  const [setupData, setSetupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/auth/setup-guide')
      .then(res => res.json())
      .then(data => {
        setSetupData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching setup guide:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Google OAuth Setup Guide</h1>
      
      <Card className="p-6 mb-8 border-red-300 bg-red-50">
        <h2 className="text-xl font-semibold mb-4 text-red-800">Your Google OAuth Credentials Are Invalid</h2>
        <p className="mb-4">
          We've detected that your Google OAuth credentials are not working. Follow the steps below to create new credentials
          and fix the authentication.
        </p>
      </Card>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
            <div className="space-y-2 font-mono text-sm p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-2">
                <div className="font-medium">NEXTAUTH_URL:</div>
                <div>{setupData?.currentConfig?.nextAuthUrl}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="font-medium">GOOGLE_CLIENT_ID:</div>
                <div>{setupData?.currentConfig?.googleClientId}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="font-medium">GOOGLE_CLIENT_SECRET:</div>
                <div>{setupData?.currentConfig?.googleClientSecretFirstChars}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="font-medium">Expected Redirect URI:</div>
                <div className="break-all">{setupData?.expectedRedirectUri}</div>
              </div>
            </div>
          </Card>
          
          <div className="space-y-8">
            {setupData?.setupSteps?.map((section: any, i: number) => (
              <Card key={i} className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Step {i+1}: {section.title}
                </h2>
                <ol className="list-decimal list-inside space-y-3 ml-4">
                  {section.steps.map((step: string, j: number) => (
                    <li key={j} className="text-gray-700">
                      {step.includes('http') ? (
                        <div>
                          {step.split('http')[0]}
                          <a 
                            href={`http${step.split('http')[1]}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            http{step.split('http')[1]}
                          </a>
                        </div>
                      ) : (
                        step
                      )}
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
          
          <Card className="p-6 mt-8 border-amber-200 bg-amber-50">
            <h2 className="text-xl font-semibold mb-4 text-amber-800">Common Issues</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-amber-700">
              {setupData?.commonIssues?.map((issue: string, i: number) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </Card>
        </>
      )}
      
      <div className="flex justify-center space-x-4 mt-8">
        <a 
          href="https://console.cloud.google.com/apis/credentials" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>Open Google Cloud Console</Button>
        </a>
        <Link href="/auth/signin">
          <Button variant="outline">Try Sign In Again</Button>
        </Link>
      </div>
    </div>
  );
} 