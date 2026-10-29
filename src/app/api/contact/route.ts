import { NextResponse } from 'next/server';
import { getProfile, saveContactMessage } from '@/lib/db';
import { sendContactEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, attachmentUrl } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }

    let saved;
    try {
      saved = await saveContactMessage({
        name,
        email,
        subject: subject || 'Portfolio Contact Inquiry',
        message,
        attachmentUrl: attachmentUrl || undefined,
      });
    } catch (error) {
      console.error('API Error persisting contact message:', error);
      return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 });
    }

    const profile = await getProfile();
    try {
      const attachmentAbsoluteUrl = attachmentUrl
        ? new URL(attachmentUrl, process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).toString()
        : undefined;

      await sendContactEmail(profile.contactEmail, {
        name,
        email,
        subject: subject || 'Portfolio Contact Inquiry',
        message,
        attachmentUrl: attachmentAbsoluteUrl,
      });
    } catch (error) {
      console.error('API Error delivering contact email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Email delivery failed';
      return NextResponse.json(
        { success: false, error: `Message saved but email delivery failed: ${errorMessage}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: 'Message received successfully', data: saved });
  } catch (error) {
    console.error('API Error saving contact message:', error);
    return NextResponse.json({ success: false, error: 'Failed to process message' }, { status: 500 });
  }
}
