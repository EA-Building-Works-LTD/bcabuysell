# BCA Buy Sell Platform

A car marketplace application built with Next.js, Firebase, and MongoDB.

## Deployment Guide for Vercel

### Prerequisites

1. A Firebase project with:
   - Authentication enabled (Google sign-in method)
   - Firestore database created
   - Firebase Admin SDK service account key

2. A MongoDB database (MongoDB Atlas recommended)

3. A Vercel account connected to your GitHub repository

### Environment Variables Setup

Your app requires several environment variables to function correctly. For detailed help, visit `/vercel-config` in your deployed app.

#### Firebase Client Configuration

These variables are used for client-side authentication:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Firebase Admin SDK Configuration

These variables are used for server-side token verification:

```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

**Important**: The `FIREBASE_PRIVATE_KEY` must:
- Be enclosed in double quotes
- Have line breaks represented as `\n`
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts

#### MongoDB Configuration

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Setting Up in Vercel

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the "Settings" tab
3. Navigate to the "Environment Variables" section
4. Add each variable with its corresponding value
5. Make sure to select all environments (Production, Preview, Development)
6. Click "Save" to apply the changes
7. Redeploy your application for the changes to take effect

### Troubleshooting Authentication Issues

If you're experiencing authentication issues after deployment:

1. Visit `/firebase-debug` in your deployed app to diagnose authentication status
2. Check that your Firebase project has Google Authentication enabled
3. Make sure your Firebase project allows your Vercel domain in the Authentication → Sign-in method → Authorized domains section
4. Verify all environment variables are correctly set in Vercel
5. Check that the Firebase Admin SDK private key is properly formatted with `\n` for line breaks

### Local Development

1. Clone the repository
2. Create a `.env.local` file with all the environment variables listed above
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

### Additional Resources

- Visit `/vercel-config` in your deployed app for more detailed instructions
- Firebase Documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Vercel Documentation: [https://vercel.com/docs](https://vercel.com/docs)

## Features

- User authentication with Firebase
- Car listing and management
- Admin dashboard for user management
- Responsive design for all devices
- Real-time data updates with Firestore
- Secure API routes with Firebase token verification

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- Firebase account (for authentication and database)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bca-buy-sell.git
   cd bca-buy-sell
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following Firebase variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Setting Up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the Firebase configuration values to your `.env.local` file
5. Enable Authentication with Google sign-in method
6. Set up Firestore Database with appropriate security rules

### Environment Variables Setup

There are multiple ways to set up your environment variables:

#### Option 1: Use the Interactive Setup Script (Recommended)

Run the interactive setup script that will prompt you for Firebase configuration values:

```bash
npm run setup-env
```

This script will:
- Guide you through entering each Firebase configuration value
- Create a proper `.env.local` file with the correct format
- Ensure the `.env.local` file is added to your `.gitignore`

#### Option 2: Manual Setup

1. Create a `.env.local` file in the root directory
2. Add the following variables (without quotes around values):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Verify Your Setup

You can verify that your environment variables are set correctly by running:

```bash
npm run check-env
```

To test the actual Firebase connection with your credentials:

```bash
npm run test-firebase
```

### Running the Application

```
npm run dev
```

The application will be available at http://localhost:3000. The first user to sign in will be automatically assigned the admin role.

## User Roles

- **Admin**: Can manage users, see all cars, and has full access to the system
- **User**: Can only manage their own cars and see their own statistics

## Limitations

- Maximum of 5 users can be registered in the system
- The first user to sign in becomes the admin
- Only admin users can promote/demote other users

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **State Management**: React Hooks
- **Styling**: TailwindCSS with custom theme
- **Authentication**: NextAuth.js (planned)

## Car Data Structure

Each car record includes:

- **Make/Model**: Brand and model of the car
- **Auction Source**: Where the car was purchased (e.g., BCA)
- **Purchase Price**: Cost to buy the car
- **Recovery Cost**: Cost to recover/transport the car
- **Fuel Cost**: Fuel expenses
- **Insurance Cost**: Insurance expenses
- **Repair Costs**: Flexible addition of repair types and costs
- **Sale Price (Listed)**: Asking price
- **Sold Price (Final)**: Actual selling price
- **Auto-calculated Profit**: Sold Price minus all costs
- **Purchase Date**: When the car was purchased
- **Sold Date**: When the car was sold
- **Status**: Purchased, Listed, or Sold
- **Notes**: Additional information

## Project Structure

- `/src/app`: Next.js App Router pages and layouts
- `/src/components`: Reusable UI components
- `/src/lib`: Utility functions and database connection
- `/src/models`: MongoDB schema models
- `/src/app/api`: API routes for backend functionality

## API Routes

- `GET /api/cars`: Get all cars (with optional status filter)
- `POST /api/cars`: Create a new car
- `GET /api/cars/:id`: Get a specific car
- `PUT /api/cars/:id`: Update a car
- `DELETE /api/cars/:id`: Delete a car

## Future Enhancements

- User authentication and multi-user support
- Image upload for car photos
- Advanced reporting and analytics
- Export data to CSV/PDF
- Mobile app using React Native

## License

This project is licensed under the MIT License.
