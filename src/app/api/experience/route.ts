import { NextResponse } from 'next/server';
import { getExperiences, createExperience } from '@/lib/db';

export async function GET() {
  try {
    const items = await getExperiences();
    return NextResponse.json({ success: true, experiences: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch experience' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, company, period, location, description, skills } = body;
    if (!role || !company || !period) {
      return NextResponse.json({ success: false, error: 'Role, company, and period are required' }, { status: 400 });
    }
    const created = await createExperience({
      role,
      company,
      period,
      location: location || '',
      description: description || '',
      skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()) : [],
      order: 0,
    });
    return NextResponse.json({ success: true, experience: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create experience' }, { status: 500 });
  }
}

