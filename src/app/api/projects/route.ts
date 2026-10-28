import { NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('API Error fetching projects:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, description, longDescription, category, tags, imageUrl, demoUrl, githubUrl, metrics } = body;

    if (!title || !description || !imageUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newProject = await createProject({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description,
      longDescription: longDescription || '',
      category: category || 'Full Stack',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
      featured: true,
      imageUrl,
      demoUrl: demoUrl || '',
      githubUrl: githubUrl || '',
      stars: 1,
      metrics: metrics || 'New Launch',
      order: 0,
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('API Error creating project:', error);
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
  }
}

