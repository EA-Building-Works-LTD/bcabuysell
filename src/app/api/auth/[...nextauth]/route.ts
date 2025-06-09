import { NextResponse } from 'next/server';

// This is a placeholder for the NextAuth route that has been replaced by Firebase Auth
// It exists only to satisfy import references that haven't been updated yet

// Empty auth options to satisfy imports
export const authOptions = {
  providers: [],
};

// Return a 410 Gone status for any requests to this endpoint
export async function GET() {
  return NextResponse.json(
    { error: 'NextAuth has been replaced with Firebase Auth' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'NextAuth has been replaced with Firebase Auth' },
    { status: 410 }
  );
} 