import { NextResponse } from 'next/server';
import { getSkills, createSkill } from '@/lib/db';

export async function GET() {
  try {
    const items = await getSkills();
    return NextResponse.json({ success: true, skills: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, name } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: 'Skill name is required' }, { status: 400 });
    }
    const created = await createSkill({
      category: category || 'Frontend',
      name,
      order: 0,
    });
    return NextResponse.json({ success: true, skill: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create skill' }, { status: 500 });
  }
}

