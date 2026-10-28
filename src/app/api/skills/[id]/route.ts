import { NextResponse } from 'next/server';
import { updateSkill, deleteSkill } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await updateSkill(id, body);
    return NextResponse.json({ success: true, skill: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update skill' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteSkill(id);
    return NextResponse.json({ success: true, message: 'Skill deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete skill' }, { status: 500 });
  }
}

