import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, DocumentData } from 'firebase/firestore';
import { retryFirestoreOperation } from '@/lib/firestore-utils';

// Emergency API route that doesn't require authentication
// Use only for troubleshooting and diagnostics
export async function GET(request: NextRequest) {
  try {
    console.log('Emergency API called');
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const maxLimit = limitParam ? parseInt(limitParam) : 100;
    
    // Check if Firestore is initialized
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Firestore not initialized',
        emergency: true
      }, { status: 500 });
    }
    
    // Build query
    let carsQuery = collection(db, 'cars');
    let q = query(carsQuery, orderBy('createdAt', 'desc'), limit(maxLimit));
    
    // Add status filter if provided
    if (statusFilter) {
      q = query(carsQuery, where('status', '==', statusFilter), orderBy('createdAt', 'desc'), limit(maxLimit));
    }
    
    // Use retry wrapper for better reliability
    const snapshot = await retryFirestoreOperation(() => getDocs(q));
    
    const cars: DocumentData[] = [];
    
    snapshot.forEach(doc => {
      cars.push({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      });
    });
    
    return NextResponse.json({
      success: true,
      data: cars,
      count: cars.length,
      emergency: true,
      message: 'Emergency mode: Authentication bypassed'
    });
  } catch (error: any) {
    console.error('Emergency API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred fetching data',
      emergency: true
    }, { status: 500 });
  }
} 