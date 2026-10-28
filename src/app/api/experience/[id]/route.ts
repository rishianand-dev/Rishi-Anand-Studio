import { NextResponse } from 'next/server';
import { updateExperience, deleteExperience } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await updateExperience(id, {
      ...body,
      skills: Array.isArray(body.skills) ? body.skills : typeof body.skills === 'string' ? body.skills.split(',').map((s: string) => s.trim()) : undefined,
    });
    return NextResponse.json({ success: true, experience: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update experience' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteExperience(id);
    return NextResponse.json({ success: true, message: 'Experience deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete experience' }, { status: 500 });
  }
}

