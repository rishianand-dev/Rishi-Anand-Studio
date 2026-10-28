import { NextResponse } from 'next/server';
import { getEducations, createEducation } from '@/lib/db';

export async function GET() {
  try {
    const items = await getEducations();
    return NextResponse.json({ success: true, educations: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch education' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { degree, institution, period, location, description } = body;
    if (!degree || !institution || !period) {
      return NextResponse.json({ success: false, error: 'Degree, institution, and period are required' }, { status: 400 });
    }
    const created = await createEducation({
      degree,
      institution,
      period,
      location,
      description,
      order: 0,
    });
    return NextResponse.json({ success: true, education: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create education' }, { status: 500 });
  }
}

