import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Configure the API route to handle multipart/form-data
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('Upload API called');
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('Request method:', request.method);
  console.log('Content-Type header:', request.headers.get('content-type'));
  
  // Check if we're in a production environment that doesn't support file uploads
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'File uploads not supported in production. Files cannot be stored on Vercel\'s read-only file system. Please set up cloud storage like Cloudinary, AWS S3, or Vercel Blob.',
      suggestion: 'For now, you can add cars without images. Contact your developer to set up cloud storage.'
    }, { status: 501 });
  }
  
  try {
    console.log('Attempting to parse formData...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('FormData received:', 
      'Has file:', !!file,
      file ? `Type: ${file.type}, Size: ${file.size}, Name: ${file.name}` : ''
    );

    if (!file) {
      console.log('Error: No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      console.log('Error: File is not an image type:', file.type);
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('Error: File size too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Create unique filename - use timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    console.log('Uploads directory path:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('Creating uploads directory');
      await mkdir(uploadsDir, { recursive: true });
    } else {
      console.log('Uploads directory already exists');
    }

    try {
      // Write file to disk
      const filePath = join(uploadsDir, fileName);
      console.log('Saving file to:', filePath);
      const buffer = Buffer.from(await file.arrayBuffer());
      console.log('Buffer created, size:', buffer.length);
      await writeFile(filePath, buffer);
      console.log('File saved successfully');
      
      // Return the URL to the file
      const imageUrl = `/uploads/${fileName}`;
      console.log('Returning image URL:', imageUrl);
      return NextResponse.json({ url: imageUrl }, { status: 201 });
    } catch (fileError: any) {
      console.error('Error writing file:', fileError);
      return NextResponse.json({ error: `Failed to write file: ${fileError.message}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ error: `Failed to upload file: ${error.message}` }, { status: 500 });
  }
} 