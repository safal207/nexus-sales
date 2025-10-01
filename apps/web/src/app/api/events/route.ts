import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    // In a real application, this would be sent to a robust event pipeline (e.g., Kafka, Kinesis).
    // For our mock, we will simply log it to the console to verify it's being called.
    console.log('EVENT RECEIVED:', eventData);

    return NextResponse.json({ success: true, message: 'Event received' }, { status: 202 });

  } catch (error) {
    console.error('Failed to process event:', error);
    return NextResponse.json({ success: false, message: 'Invalid event data.' }, { status: 400 });
  }
}
