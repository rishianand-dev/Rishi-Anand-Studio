import { NextResponse } from 'next/server';
import { getProfile, updateProfile, getExperiences, getEducations, getSkills } from '@/lib/db';

export async function GET() {
  try {
    const [profile, experiences, educations, skills] = await Promise.all([
      getProfile(),
      getExperiences(),
      getEducations(),
      getSkills(),
    ]);
    return NextResponse.json({ success: true, profile, experiences, educations, skills });
  } catch (error) {
    console.error('API Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateProfile(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('API Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
