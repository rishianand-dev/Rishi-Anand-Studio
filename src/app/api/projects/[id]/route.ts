import { NextResponse } from 'next/server';
import { updateProject, deleteProject } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await updateProject(id, body);
    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteProject(id);
    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}

