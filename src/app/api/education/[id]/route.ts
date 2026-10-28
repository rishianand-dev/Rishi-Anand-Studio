import { NextResponse } from 'next/server';
import { updateEducation, deleteEducation } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await updateEducation(id, body);
    return NextResponse.json({ success: true, education: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update education' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteEducation(id);
    return NextResponse.json({ success: true, message: 'Education deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete education' }, { status: 500 });
  }
}

