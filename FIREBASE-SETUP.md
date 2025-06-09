# Firebase Setup Guide

## Problem

You're encountering the following error:
```
Runtime Error

FirebaseError: Firebase: Error (auth/invalid-api-key).
```

This is because your Firebase credentials are either missing or invalid. Let's fix this!

## Solution

### 1. Create a `.env.local` file

Create a file named `.env.local` in the root of your project with the following variables from your Firebase project:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Get Firebase Config Values

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon (⚙️) near "Project Overview" to access Project settings
4. Scroll down to "Your apps" section and click on the web app (or create one if none exists)
5. In the "Firebase SDK snippet" section, select "Config"
6. Copy the values from the config object to your `.env.local` file

For example, if your Firebase config looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA86hLTOVcIXFmQnBJ2M8W7TU1D5nWz64A",
  authDomain: "bca-buy-sell.firebaseapp.com",
  projectId: "bca-buy-sell",
  storageBucket: "bca-buy-sell.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0"
};
```

Your `.env.local` should contain:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA86hLTOVcIXFmQnBJ2M8W7TU1D5nWz64A
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bca-buy-sell.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bca-buy-sell
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bca-buy-sell.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8i9j0
```

### 3. Important Rules for Environment Variables

- Do NOT use quotes around the values
- Do NOT add spaces around the equals sign
- Make sure the file is named exactly `.env.local` (not `.env`)
- Make sure the file is in the root directory of your project

### 4. Set Up Authentication in Firebase Console

1. Go to the Firebase Console
2. Navigate to "Authentication" from the left sidebar
3. Click on "Get started" or "Sign-in method" tab
4. Enable the Google sign-in provider
5. Add your domain (localhost for development) to the "Authorized domains" list at the bottom of the page

### 5. Verify Your Setup

After creating the `.env.local` file, run these commands:

```bash
# Verify environment variables
npm run check-env

# Test if your Firebase API key is valid
npm run test-firebase

# Restart your development server
npm run dev
```

### 6. Debugging Tools

If you're still having issues, visit `/firebase-check` in your application to see a detailed diagnostic page.

### Common Issues

1. **Invalid API Key**: Make sure you've copied the exact API key from Firebase Console
2. **Missing Environment Variables**: All required variables must be present in `.env.local`
3. **Quotes Around Values**: Environment variables should not have quotes
4. **No .env.local File**: The file must exist and be in the root directory
5. **Restart Required**: You need to restart the dev server after creating/editing `.env.local`

## Need More Help?

If you're still encountering issues after following these steps, check out:

- [Firebase Documentation](https://firebase.google.com/docs/web/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Authentication](https://firebase.google.com/docs/auth) 