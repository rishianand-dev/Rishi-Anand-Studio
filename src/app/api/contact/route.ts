import { NextResponse } from 'next/server';
import { saveContactMessage } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, attachmentUrl } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }

    const saved = await saveContactMessage({
      name,
      email,
      subject: subject || 'Portfolio Contact Inquiry',
      message,
      attachmentUrl: attachmentUrl || undefined,
    });

    return NextResponse.json({ success: true, message: 'Message received successfully', data: saved });
  } catch (error) {
    console.error('API Error saving contact message:', error);
    return NextResponse.json({ success: false, error: 'Failed to process message' }, { status: 500 });
  }
}

