import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/utils/firebase-admin';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Create session cookie with shorter expiry
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Get cookies instance and await it
    const cookieStore = await cookies();
    
    // Set the cookie
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Add DELETE method to handle logout
export async function DELETE() {
  // Get cookies instance and await it
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ success: true });
} 