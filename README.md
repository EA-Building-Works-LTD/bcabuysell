# BCA Buy Sell - Car Market Application

A comprehensive application for tracking car purchases, sales, and profits with Google authentication.

## Features

- **User Authentication**: Secure Google Sign-In with role-based access control
- **Car Inventory Management**: Track purchased, listed, and sold cars
- **Image Upload**: Add images for car listings
- **Dashboard & Statistics**: Visual analytics of sales performance
- **Admin Controls**: User management for admins
- **Responsive Design**: Works on desktop and mobile devices

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
