import { NextResponse } from 'next/server';
import { db } from '@/utils/firebase-admin';

interface RouteContext {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { orderId } = await context.params;
    const fulfillmentRef = db.collection('orders').doc(orderId).collection('fulfillments');
    const snapshot = await fulfillmentRef.get();

    const fulfillments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ fulfillments });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch fulfillment details' }, { status: 500 });
  }
}