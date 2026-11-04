import { NextResponse } from 'next/server';
import { getThemeSettings, updateThemeSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const response = NextResponse.json({ success: true, theme: await getThemeSettings() });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('API Error fetching theme settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch theme settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, theme: await updateThemeSettings(body) });
  } catch (error) {
    console.error('API Error updating theme settings:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update theme settings' },
      { status: 400 }
    );
  }
}
