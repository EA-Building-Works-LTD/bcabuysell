# BCA Buy Sell - Deployment & Authentication Troubleshooting Guide

This guide provides specific instructions to fix Firebase authentication issues with your Vercel deployment.

## 1. Required Environment Variables

Ensure all of these environment variables are correctly set in your Vercel project settings:

**Firebase Client (Public)**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Firebase Admin SDK (Private)**
```
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

**MongoDB Connection**
```
MONGODB_URI
```

## 2. Fix for Firestore "400 Bad Request" Errors

The "400 Bad Request" errors from Firestore are typically caused by:

1. Incorrect Firebase project configuration
2. CORS issues with Vercel domain
3. Expired or invalid Firebase tokens

### Solution Steps:

1. **Update Firebase Project Settings**:
   - Go to Firebase Console → Your Project → Project Settings
   - Make sure your Firebase project plan supports the usage you need (Spark/Blaze)
   - Check if there are any billing alerts or limitations

2. **Update Firebase Security Rules** for Firestore:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Add Vercel Domain to Authorized Domains**:
   - Go to Firebase Console → Authentication → Settings → Authorized Domains
   - Add your Vercel domain (e.g., `bcabuysell.vercel.app`)
   - Also add custom domains if you have any

## 3. Fix for API "401 Unauthorized" Errors

The "401 Unauthorized" errors are typically caused by:

1. Missing or invalid Firebase ID token
2. Issues with token cookies not being properly set or sent
3. Server-side verification errors

### Solution Steps:

1. **Check Firebase Admin SDK Configuration**:
   - Verify that `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are correctly set in Vercel
   - For `FIREBASE_PRIVATE_KEY`, ensure it includes the full key with line breaks as `\n`
   - Make sure the private key is enclosed in double quotes: `"-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"`

2. **Manually Test Authentication**:
   - After deploying, visit `/firebase-debug` on your site
   - Sign in with Google
   - Click "Force Token Refresh" then "Test Cars API"
   - Check the debug logs for any errors

3. **Clear Browser Cookies and Cache**:
   - Sometimes old/corrupted cookies can cause issues
   - Have users clear their cookies for your domain and sign in again

## 4. Firebase Admin SDK Service Account Setup

If you're still having issues with the Firebase Admin SDK:

1. **Generate a New Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Open the downloaded JSON file

2. **Update Vercel Environment Variables**:
   - Set `FIREBASE_CLIENT_EMAIL` to the `client_email` value from the JSON
   - Set `FIREBASE_PRIVATE_KEY` to the `private_key` value from the JSON
   - Remember to format the private key correctly with escaped newlines

3. **Redeploy Your Application**:
   - After updating the environment variables, trigger a new deployment in Vercel

## 5. Testing the Deployment

1. Visit the following pages to verify functionality:
   - `/firebase-debug` - Check authentication status and debug
   - `/vercel-config` - Verify environment variable setup
   - `/auth-test` - Simple authentication test page

2. Look for these specific issues:
   - Check if token refresh is working (debug page shows this)
   - Verify API calls succeed after authentication
   - Check if Firestore connections work properly

## 6. Common Issues and Solutions

| Problem | Solution |
|---------|----------|
| "Invalid JWT" errors | Force token refresh, check Admin SDK setup |
| Cookies not persisting | Check SameSite/Secure settings in utils.ts |
| CORS errors | Add your domain to Firebase authorized domains |
| "Project not found" errors | Check that project ID matches in all places |
| "Service account not found" | Regenerate service account key, update env vars |

## 7. Getting Additional Help

If you're still experiencing issues:

1. Check Firebase console logs for authentication failures
2. Review Vercel function logs for detailed error messages
3. Use `/firebase-debug` page and share screenshots of the output
4. Check browser console for CORS or network errors

## 8. Final Production Checklist

- Ensure all Firebase env vars are correctly set
- Add all domains to Firebase authorized domains list
- Update Firestore security rules
- Enable Google Auth in Firebase Console
- Set up proper error monitoring
- Test sign-in flow completely before sharing with users 