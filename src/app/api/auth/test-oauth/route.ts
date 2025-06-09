import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';

export async function GET() {
  // Test environment variables
  const googleConfigStatus = {
    clientIdExists: !!process.env.GOOGLE_CLIENT_ID,
    clientSecretExists: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdFormat: process.env.GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com'),
    nextAuthUrlExists: !!process.env.NEXTAUTH_URL,
    nextAuthSecretExists: !!process.env.NEXTAUTH_SECRET
  };

  // Test database connection
  let dbStatus = 'not tested';
  try {
    await connectDB();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  // Expected callback URL - this should match what's configured in Google Cloud Console
  const expectedCallbackUrl = new URL('/api/auth/callback/google', process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();

  // Check authorization configuration
  const oauthStatus = {
    expectedCallbackUrl,
    authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(expectedCallbackUrl)}&response_type=code&scope=openid+email+profile`,
    recommendations: [] as string[]
  };

  // Add any recommendations
  if (!googleConfigStatus.clientIdExists || !googleConfigStatus.clientSecretExists) {
    oauthStatus.recommendations.push('Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local');
  }
  
  if (!googleConfigStatus.clientIdFormat) {
    oauthStatus.recommendations.push('GOOGLE_CLIENT_ID should end with .apps.googleusercontent.com');
  }

  if (!googleConfigStatus.nextAuthUrlExists) {
    oauthStatus.recommendations.push('Set NEXTAUTH_URL to your base URL (e.g., http://localhost:3000)');
  }

  if (!googleConfigStatus.nextAuthSecretExists) {
    oauthStatus.recommendations.push('Generate a strong NEXTAUTH_SECRET value');
  }

  oauthStatus.recommendations.push('Verify that your OAuth consent screen is configured correctly in Google Cloud Console');
  oauthStatus.recommendations.push('Ensure the following APIs are enabled: Google+ API, People API');
  oauthStatus.recommendations.push(`Check that ${expectedCallbackUrl} is added as an authorized redirect URI in Google Cloud Console`);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    googleConfigStatus,
    dbStatus,
    oauthStatus
  });
} 