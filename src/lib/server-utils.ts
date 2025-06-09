import { FIREBASE_TOKEN_COOKIE } from './utils';

interface ServerConfig {
  cookies: {
    name: string;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
  firebase: {
    projectId: string;
  };
}

// Get the server configuration
export function getServerConfig(): ServerConfig {
  // Default cookie max age to 7 days
  const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
  
  return {
    cookies: {
      name: FIREBASE_TOKEN_COOKIE,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: SESSION_MAX_AGE,
    },
    firebase: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    },
  };
}

// Extract token from authorization header
export function extractTokenFromHeader(authHeader: string | null): string {
  if (!authHeader) return '';
  
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  
  return '';
}

// Check if environment variables are properly set
export function checkEnvironmentVariables(): { 
  isValid: boolean, 
  missing: string[] 
} {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missing.length === 0,
    missing,
  };
} 