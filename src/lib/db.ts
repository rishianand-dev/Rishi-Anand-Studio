import { PrismaClient } from '@prisma/client';
import { INITIAL_PROJECTS, INITIAL_EXPERIENCE, INITIAL_PROFILE, INITIAL_EDUCATION, INITIAL_SKILLS, INITIAL_SEO } from './initial-data';
import { Project, ExperienceItem, ContactSubmission, ProfileData, EducationItem, SkillItem, SeoSettingsData } from './types';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// In-memory persistent cache for fallback when Postgres isn't running or during build
let memoryProjects: Project[] = [...INITIAL_PROJECTS];
let memoryExperience: ExperienceItem[] = [...INITIAL_EXPERIENCE];
let memoryEducation: EducationItem[] = [...INITIAL_EDUCATION];
let memorySkills: SkillItem[] = [...INITIAL_SKILLS];
let memoryMessages: ContactSubmission[] = [];
let memoryProfile: ProfileData = { ...INITIAL_PROFILE };
let memorySeo: SeoSettingsData = { ...INITIAL_SEO };

// ---------------- SEO SETTINGS ----------------
export async function getSeoSettings(): Promise<SeoSettingsData> {
  try {
    const seo = await prisma.seoSettings.findFirst();
    if (seo) {
      return {
        id: seo.id,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        keywords: seo.keywords,
        ogImageUrl: seo.ogImageUrl,
        canonicalUrl: seo.canonicalUrl,
        twitterHandle: seo.twitterHandle,
        robots: seo.robots,
      };
    }
    return memorySeo;
  } catch (error) {
    return memorySeo;
  }
}

export async function updateSeoSettings(data: Partial<SeoSettingsData>): Promise<SeoSettingsData> {
  try {
    const current = await getSeoSettings();
    const updated = await prisma.seoSettings.upsert({
      where: { id: current.id || 'default-seo' },
      update: {
        metaTitle: data.metaTitle ?? current.metaTitle,
        metaDescription: data.metaDescription ?? current.metaDescription,
        keywords: data.keywords ?? current.keywords,
        ogImageUrl: data.ogImageUrl ?? current.ogImageUrl,
        canonicalUrl: data.canonicalUrl ?? current.canonicalUrl,
        twitterHandle: data.twitterHandle ?? current.twitterHandle,
        robots: data.robots ?? current.robots,
      },
      create: {
        id: 'default-seo',
        metaTitle: data.metaTitle ?? INITIAL_SEO.metaTitle,
        metaDescription: data.metaDescription ?? INITIAL_SEO.metaDescription,
        keywords: data.keywords ?? INITIAL_SEO.keywords,
        ogImageUrl: data.ogImageUrl ?? INITIAL_SEO.ogImageUrl,
        canonicalUrl: data.canonicalUrl ?? INITIAL_SEO.canonicalUrl,
        twitterHandle: data.twitterHandle ?? INITIAL_SEO.twitterHandle,
        robots: data.robots ?? INITIAL_SEO.robots,
      },
    });
    memorySeo = { ...memorySeo, ...updated };
    return memorySeo;
  } catch (error) {
    memorySeo = { ...memorySeo, ...data };
    return memorySeo;
  }
}

// ---------------- PROFILE & HEADINGS ----------------
export async function getProfile(): Promise<ProfileData> {
  try {
    const profile = await prisma.profile.findFirst();
    if (profile) {
      return {
        id: profile.id,
        name: profile.name,
        role: profile.role,
        location: profile.location,
        headline: profile.headline,
        subheadline: profile.subheadline,
        availableForWork: profile.availableForWork,
        avatarUrl: profile.avatarUrl,
        resumeUrl: profile.resumeUrl,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        twitterUrl: profile.twitterUrl,
      };
    }
    return memoryProfile;
  } catch (error) {
    return memoryProfile;
  }
}

export async function updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
  try {
    const current = await getProfile();
    const updated = await prisma.profile.upsert({
      where: { id: current.id || 'default-profile' },
      update: {
        name: data.name ?? current.name,
        role: data.role ?? current.role,
        location: data.location ?? current.location,
        headline: data.headline ?? current.headline,
        subheadline: data.subheadline ?? current.subheadline,
        availableForWork: data.availableForWork ?? current.availableForWork,
        avatarUrl: data.avatarUrl ?? current.avatarUrl,
        resumeUrl: data.resumeUrl ?? current.resumeUrl,
        githubUrl: data.githubUrl ?? current.githubUrl,
        linkedinUrl: data.linkedinUrl ?? current.linkedinUrl,
        twitterUrl: data.twitterUrl ?? current.twitterUrl,
      },
      create: {
        id: 'default-profile',
        name: data.name ?? INITIAL_PROFILE.name,
        role: data.role ?? INITIAL_PROFILE.role,
        location: data.location ?? INITIAL_PROFILE.location,
        headline: data.headline ?? INITIAL_PROFILE.headline,
        subheadline: data.subheadline ?? INITIAL_PROFILE.subheadline,
        availableForWork: data.availableForWork ?? true,
        resumeUrl: data.resumeUrl ?? INITIAL_PROFILE.resumeUrl,
        githubUrl: data.githubUrl ?? INITIAL_PROFILE.githubUrl,
        linkedinUrl: data.linkedinUrl ?? INITIAL_PROFILE.linkedinUrl,
        twitterUrl: data.twitterUrl ?? INITIAL_PROFILE.twitterUrl,
      },
    });
    memoryProfile = { ...memoryProfile, ...updated };
    return memoryProfile;
  } catch (error) {
    memoryProfile = { ...memoryProfile, ...data };
    return memoryProfile;
  }
}

// ---------------- PROJECTS ----------------
export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    });
    if (projects && projects.length > 0) {
      return projects.map((p) => ({
        ...p,
        category: p.category as Project['category'],
      }));
    }
    return memoryProjects;
  } catch (error) {
    return memoryProjects;
  }
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  try {
    const created = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        longDescription: data.longDescription || null,
        category: data.category,
        tags: data.tags,
        featured: data.featured,
        imageUrl: data.imageUrl,
        demoUrl: data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        stars: data.stars || 0,
        metrics: data.metrics || null,
        order: data.order || memoryProjects.length + 1,
      },
    });
    const proj = { ...created, category: created.category as Project['category'] };
    memoryProjects = [proj, ...memoryProjects];
    return proj;
  } catch (error) {
    const newProj: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    memoryProjects = [newProj, ...memoryProjects];
    return newProj;
  }
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        longDescription: data.longDescription,
        category: data.category,
        tags: data.tags,
        featured: data.featured,
        imageUrl: data.imageUrl,
        demoUrl: data.demoUrl,
        githubUrl: data.githubUrl,
        stars: data.stars,
        metrics: data.metrics,
        order: data.order,
      },
    });
    const result = { ...updated, category: updated.category as Project['category'] };
    memoryProjects = memoryProjects.map((p) => (p.id === id ? result : p));
    return result;
  } catch (error) {
    memoryProjects = memoryProjects.map((p) => (p.id === id ? { ...p, ...data } : p));
    const found = memoryProjects.find((p) => p.id === id);
    if (!found) throw new Error('Project not found');
    return found;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { id } });
  } catch (error) {
    // fallback
  }
  memoryProjects = memoryProjects.filter((p) => p.id !== id);
  return true;
}

// ---------------- EDUCATION ----------------
export async function getEducations(): Promise<EducationItem[]> {
  try {
    const items = await prisma.education.findMany({ orderBy: { order: 'asc' } });
    if (items && items.length > 0) return items;
    return memoryEducation;
  } catch (error) {
    return memoryEducation;
  }
}

export async function createEducation(data: Omit<EducationItem, 'id'>): Promise<EducationItem> {
  try {
    const created = await prisma.education.create({
      data: {
        degree: data.degree,
        institution: data.institution,
        period: data.period,
        location: data.location || null,
        description: data.description || null,
        order: data.order || memoryEducation.length + 1,
      },
    });
    memoryEducation = [...memoryEducation, created];
    return created;
  } catch (error) {
    const item: EducationItem = { ...data, id: `edu-${Date.now()}` };
    memoryEducation = [...memoryEducation, item];
    return item;
  }
}

export async function updateEducation(id: string, data: Partial<EducationItem>): Promise<EducationItem> {
  try {
    const updated = await prisma.education.update({
      where: { id },
      data: {
        degree: data.degree,
        institution: data.institution,
        period: data.period,
        location: data.location,
        description: data.description,
        order: data.order,
      },
    });
    memoryEducation = memoryEducation.map((e) => (e.id === id ? updated : e));
    return updated;
  } catch (error) {
    memoryEducation = memoryEducation.map((e) => (e.id === id ? { ...e, ...data } : e));
    const found = memoryEducation.find((e) => e.id === id);
    if (!found) throw new Error('Education item not found');
    return found;
  }
}

export async function deleteEducation(id: string): Promise<boolean> {
  try {
    await prisma.education.delete({ where: { id } });
  } catch (error) {
    // fallback
  }
  memoryEducation = memoryEducation.filter((e) => e.id !== id);
  return true;
}

// ---------------- SKILLS / TECH STACK ----------------
export async function getSkills(): Promise<SkillItem[]> {
  try {
    const items = await prisma.skill.findMany({ orderBy: { order: 'asc' } });
    if (items && items.length > 0) return items;
    return memorySkills;
  } catch (error) {
    return memorySkills;
  }
}

export async function createSkill(data: Omit<SkillItem, 'id'>): Promise<SkillItem> {
  try {
    const created = await prisma.skill.create({
      data: {
        category: data.category,
        name: data.name,
        order: data.order || memorySkills.length + 1,
      },
    });
    memorySkills = [...memorySkills, created];
    return created;
  } catch (error) {
    const item: SkillItem = { ...data, id: `sk-${Date.now()}` };
    memorySkills = [...memorySkills, item];
    return item;
  }
}

export async function updateSkill(id: string, data: Partial<SkillItem>): Promise<SkillItem> {
  try {
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        category: data.category,
        name: data.name,
        order: data.order,
      },
    });
    memorySkills = memorySkills.map((s) => (s.id === id ? updated : s));
    return updated;
  } catch (error) {
    memorySkills = memorySkills.map((s) => (s.id === id ? { ...s, ...data } : s));
    const found = memorySkills.find((s) => s.id === id);
    if (!found) throw new Error('Skill not found');
    return found;
  }
}

export async function deleteSkill(id: string): Promise<boolean> {
  try {
    await prisma.skill.delete({ where: { id } });
  } catch (error) {
    // fallback
  }
  memorySkills = memorySkills.filter((s) => s.id !== id);
  return true;
}

// ---------------- EXPERIENCE ----------------
export async function getExperiences(): Promise<ExperienceItem[]> {
  try {
    const exps = await prisma.experience.findMany({
      orderBy: { order: 'asc' },
    });
    if (exps && exps.length > 0) return exps;
    return memoryExperience;
  } catch (error) {
    return memoryExperience;
  }
}

export async function createExperience(data: Omit<ExperienceItem, 'id'>): Promise<ExperienceItem> {
  try {
    const created = await prisma.experience.create({
      data: {
        role: data.role,
        company: data.company,
        period: data.period,
        location: data.location,
        description: data.description,
        skills: data.skills,
        order: data.order || memoryExperience.length + 1,
      },
    });
    memoryExperience = [...memoryExperience, created];
    return created;
  } catch (error) {
    const item: ExperienceItem = { ...data, id: `exp-${Date.now()}` };
    memoryExperience = [...memoryExperience, item];
    return item;
  }
}

export async function updateExperience(id: string, data: Partial<ExperienceItem>): Promise<ExperienceItem> {
  try {
    const updated = await prisma.experience.update({
      where: { id },
      data: {
        role: data.role,
        company: data.company,
        period: data.period,
        location: data.location,
        description: data.description,
        skills: data.skills,
        order: data.order,
      },
    });
    memoryExperience = memoryExperience.map((e) => (e.id === id ? updated : e));
    return updated;
  } catch (error) {
    memoryExperience = memoryExperience.map((e) => (e.id === id ? { ...e, ...data } : e));
    const found = memoryExperience.find((e) => e.id === id);
    if (!found) throw new Error('Experience not found');
    return found;
  }
}

export async function deleteExperience(id: string): Promise<boolean> {
  try {
    await prisma.experience.delete({ where: { id } });
  } catch (error) {
    // fallback
  }
  memoryExperience = memoryExperience.filter((e) => e.id !== id);
  return true;
}

// ---------------- CONTACT ----------------
export async function saveContactMessage(submission: ContactSubmission): Promise<ContactSubmission> {
  try {
    const saved = await prisma.contactMessage.create({
      data: {
        name: submission.name,
        email: submission.email,
        subject: submission.subject || null,
        message: submission.message,
        attachmentUrl: submission.attachmentUrl || null,
      },
    });
    return {
      ...saved,
      subject: saved.subject ?? undefined,
      attachmentUrl: saved.attachmentUrl ?? undefined,
    };
  } catch (error) {
    const fallbackMsg = {
      ...submission,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    memoryMessages.push(fallbackMsg);
    return fallbackMsg;
  }
}
