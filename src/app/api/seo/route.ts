import { NextResponse } from 'next/server';
import { getSeoSettings, updateSeoSettings } from '@/lib/db';

export async function GET() {
  try {
    const seo = await getSeoSettings();
    return NextResponse.json({ success: true, seo });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch SEO settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateSeoSettings(body);
    return NextResponse.json({ success: true, seo: updated });
  } catch (error: any) {
    console.error('Error updating SEO settings:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update SEO settings' }, { status: 500 });
  }
}

