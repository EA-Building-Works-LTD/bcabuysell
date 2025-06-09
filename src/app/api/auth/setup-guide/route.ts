import { NextResponse } from 'next/server';

export async function GET() {
  // Get the current environment configuration
  const envConfig = {
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    googleClientId: process.env.GOOGLE_CLIENT_ID || 'not-set',
    googleClientIdValid: process.env.GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com') || false,
    googleClientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
    googleClientSecretFirstChars: process.env.GOOGLE_CLIENT_SECRET ? 
      `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 5)}...` : 'not-set',
  };

  // Expected redirect URI
  const redirectUri = `${envConfig.nextAuthUrl}/api/auth/callback/google`;
  
  return NextResponse.json({
    message: "Google OAuth Setup Guide",
    currentConfig: envConfig,
    expectedRedirectUri: redirectUri,
    setupSteps: [
      {
        title: "Create New OAuth Credentials",
        steps: [
          "Go to https://console.cloud.google.com/apis/credentials",
          "Click 'CREATE CREDENTIALS' and select 'OAuth client ID'",
          "Choose 'Web application' as the Application type",
          `Add "${envConfig.nextAuthUrl}" as an Authorized JavaScript origin`,
          `Add "${redirectUri}" as an Authorized redirect URI`,
          "Click 'CREATE'",
          "Copy the new Client ID and Client Secret"
        ]
      },
      {
        title: "Update Environment Variables",
        steps: [
          "Open or create .env.local file in your project root",
          "Update or add the following lines:",
          `NEXTAUTH_URL=${envConfig.nextAuthUrl}`,
          "NEXTAUTH_SECRET=[your-secret]",
          "GOOGLE_CLIENT_ID=[your-new-client-id]",
          "GOOGLE_CLIENT_SECRET=[your-new-client-secret]",
          "Make sure there are NO spaces or quotes around the values",
          "Restart your development server after saving"
        ]
      },
      {
        title: "Configure OAuth Consent Screen",
        steps: [
          "Go to https://console.cloud.google.com/apis/credentials/consent",
          "Ensure your app has a name, support email, and developer contact info",
          "Add 'localhost' to authorized domains (for development)",
          "Under 'Test users', add your Google account email",
          "Make sure the required scopes are enabled: .../auth/userinfo.email, .../auth/userinfo.profile"
        ]
      },
      {
        title: "Test the Authentication",
        steps: [
          "Restart your development server",
          "Try logging in again with Google"
        ]
      }
    ],
    commonIssues: [
      "Client ID or Client Secret contains extra spaces or quotes",
      "Redirect URI is misconfigured or has different capitalization",
      "OAuth Consent Screen missing required information",
      "Test users not added (when in testing mode)",
      "People API not enabled"
    ]
  });
} 