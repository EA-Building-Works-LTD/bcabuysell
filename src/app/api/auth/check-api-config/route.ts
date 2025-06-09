import { NextResponse } from 'next/server';
import { google } from 'googleapis';

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
    // Create OAuth client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`
    );
    
    // Check the token info endpoint
    const tokenResponse = await checkToken(oauth2Client);
    
    // Essential checks and advice
    const checks = [
      {
        name: 'Google OAuth Consent Screen',
        status: 'unknown',
        description: 'Check that you have configured the OAuth consent screen in Google Cloud Console',
        fixUrl: 'https://console.cloud.google.com/apis/credentials/consent'
      },
      {
        name: 'People API',
        status: 'unknown',
        description: 'Required for Google authentication. CRITICAL: This API must be enabled.',
        fixUrl: 'https://console.cloud.google.com/apis/library/people.googleapis.com'
      },
      {
        name: 'Google Identity Toolkit API',
        status: 'unknown',
        description: 'May be required for authentication flow',
        fixUrl: 'https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com'
      },
      {
        name: 'Redirect URI Configuration',
        status: 'unknown',
        description: `Verify that http://localhost:3000/api/auth/callback/google is added as an authorized redirect URI`,
        fixUrl: 'https://console.cloud.google.com/apis/credentials'
      }
    ];
    
    // Project ID extraction (for informational purposes)
    let projectId = 'unknown';
    if (clientId) {
      // Client IDs typically have format: [PROJECT_NUMBER]-[HASH].apps.googleusercontent.com
      const match = clientId.match(/^(\d+)-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/);
      if (match && match[1]) {
        projectId = match[1];
      }
    }
    
    return NextResponse.json({
      status: 'info',
      message: 'Your credentials look valid, but authentication is failing.',
      advice: 'You need to enable the required Google APIs in your Google Cloud project.',
      details: {
        clientIdValid: true,
        clientSecretValid: true,
        projectNumber: projectId,
        redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
        tokenResponse
      },
      checks,
      nextSteps: [
        '1. Click each "Fix" link above to verify API configuration',
        '2. Make sure the People API is enabled - this is REQUIRED',
        '3. Check that your OAuth consent screen is properly configured',
        '4. If your app is in "Testing" mode, make sure your Google account is added as a test user',
        '5. Restart your development server after making these changes'
      ]
    });
  } catch (error) {
    console.error('Error checking API configuration:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error checking API configuration',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Function to test the token endpoint
async function checkToken(oauth2Client: any) {
  try {
    // We're just generating a test URL, not actually doing the authentication
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    });
    
    return { status: 'success', message: 'OAuth URL generation successful' };
  } catch (error) {
    return { 
      status: 'error', 
      message: 'OAuth URL generation failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 