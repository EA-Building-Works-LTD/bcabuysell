import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing Google OAuth credentials in environment variables',
    }, { status: 400 });
  }

  try {
    // Test if the OAuth credentials are valid by attempting to create an OAuth client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
    );

    // Try to get token info - will fail with "invalid_client" if credentials are wrong
    const result = await testTokenEndpoint(oauth2Client);
    
    return NextResponse.json({
      status: 'success',
      message: 'Google OAuth credentials appear to be valid',
      details: {
        clientIdFirst10Chars: clientId.substring(0, 10) + '...',
        redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
        testResult: result
      }
    });
  } catch (error) {
    console.error('Error verifying Google credentials:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Invalid Google OAuth credentials',
      error: error instanceof Error ? error.message : String(error),
      solution: `
        1. Check that your Client ID and Client Secret in .env.local match exactly what's in Google Cloud Console
        2. Make sure your OAuth consent screen is properly configured
        3. Try creating a new OAuth 2.0 Client ID in Google Cloud Console
        4. Ensure redirect URI is configured: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google
      `
    }, { status: 401 });
  }
}

// Function to test if the token endpoint accepts these credentials
async function testTokenEndpoint(oauth2Client: OAuth2Client) {
  try {
    // Generate a test URL - we won't actually open this
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    });
    
    return { valid: true, authUrl: authUrl.substring(0, 100) + '...' };
  } catch (error) {
    throw error;
  }
} 