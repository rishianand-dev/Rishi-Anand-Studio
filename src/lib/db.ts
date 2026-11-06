import { PrismaClient } from '@prisma/client';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { Project, ExperienceItem, ContactSubmission, ProfileData, EducationItem, SkillItem, SeoSettingsData, ThemeSettingsData, EMPTY_PROFILE } from './types';

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
let memoryProjects: Project[] = [];
let memoryExperience: ExperienceItem[] = [];
let memoryEducation: EducationItem[] = [];
let memorySkills: SkillItem[] = [];
let memoryMessages: ContactSubmission[] = [];
let memoryProfile: ProfileData = { ...EMPTY_PROFILE };
let memorySeo: SeoSettingsData = { id: 'default-seo', metaTitle: '', metaDescription: '', keywords: '', robots: '' };
let memoryTheme: ThemeSettingsData = { id: 'default-theme', accentColor: '#4f46e5' };

const isHexColor = (value: string): boolean => /^#[0-9a-f]{6}$/i.test(value);

const TAGS = {
  theme: 'portfolio-theme',
  seo: 'portfolio-seo',
  profile: 'portfolio-profile',
  projects: 'portfolio-projects',
  education: 'portfolio-education',
  skills: 'portfolio-skills',
  experience: 'portfolio-experience',
} as const;

const invalidate = (tag: string) => revalidateTag(tag);

async function readThemeSettings(): Promise<ThemeSettingsData> {
  try {
    const theme = await prisma.themeSettings.findUnique({ where: { id: 'default-theme' } });
    if (theme && isHexColor(theme.accentColor)) {
      return { id: theme.id, accentColor: theme.accentColor };
    }
    return memoryTheme;
  } catch {
    return memoryTheme;
  }
}

export const getThemeSettings = unstable_cache(readThemeSettings, ['portfolio-theme-settings'], {
  tags: [TAGS.theme],
});

export const getThemeSettingsUncached = readThemeSettings;

export async function updateThemeSettings(data: Partial<ThemeSettingsData>): Promise<ThemeSettingsData> {
  const accentColor = data.accentColor ?? memoryTheme.accentColor;
  if (!isHexColor(accentColor)) {
    throw new Error('Accent color must be a six-digit hex color');
  }
  try {
    const updated = await prisma.themeSettings.upsert({
      where: { id: 'default-theme' },
      update: { accentColor },
      create: { id: 'default-theme', accentColor },
    });
    memoryTheme = { id: updated.id, accentColor: updated.accentColor };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Theme settings persistence failed:', error);
      throw new Error('Theme settings could not be saved. Check the production database connection and schema.');
    }
    memoryTheme = { ...memoryTheme, accentColor };
  }
  return memoryTheme;
}

// ---------------- SEO SETTINGS ----------------
async function readSeoSettings(): Promise<SeoSettingsData> {
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

export const getSeoSettings = unstable_cache(readSeoSettings, ['portfolio-seo-settings'], {
  tags: [TAGS.seo],
});

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
        metaTitle: data.metaTitle ?? '',
        metaDescription: data.metaDescription ?? '',
        keywords: data.keywords ?? '',
        ogImageUrl: data.ogImageUrl ?? null,
        canonicalUrl: data.canonicalUrl ?? null,
        twitterHandle: data.twitterHandle ?? null,
        robots: data.robots ?? '',
      },
    });
    memorySeo = { ...memorySeo, ...updated };
    invalidate(TAGS.seo);
    return memorySeo;
  } catch (error) {
    memorySeo = { ...memorySeo, ...data };
    invalidate(TAGS.seo);
    return memorySeo;
  }
}

// ---------------- PROFILE & HEADINGS ----------------
async function readProfile(): Promise<ProfileData> {
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
        contactEmail: profile.contactEmail,
        footerBrand: profile.footerBrand,
        footerLabel: profile.footerLabel,
        footerCopyright: profile.footerCopyright,
        footerTechStack: profile.footerTechStack,
        aboutLabel: profile.aboutLabel,
        aboutHeading: profile.aboutHeading,
        aboutIntroTitle: profile.aboutIntroTitle,
        aboutParagraphOne: profile.aboutParagraphOne,
        aboutParagraphTwo: profile.aboutParagraphTwo,
        aboutResumeLabel: profile.aboutResumeLabel,
        aboutGithubLabel: profile.aboutGithubLabel,
        aboutContactLabel: profile.aboutContactLabel,
        aboutPrincipleOneTitle: profile.aboutPrincipleOneTitle,
        aboutPrincipleOneDescription: profile.aboutPrincipleOneDescription,
        aboutPrincipleTwoTitle: profile.aboutPrincipleTwoTitle,
        aboutPrincipleTwoDescription: profile.aboutPrincipleTwoDescription,
        aboutPrincipleThreeTitle: profile.aboutPrincipleThreeTitle,
        aboutPrincipleThreeDescription: profile.aboutPrincipleThreeDescription,
        heroTechStack: profile.heroTechStack,
        heroCodeLineOne: profile.heroCodeLineOne,
        heroCodeLineTwo: profile.heroCodeLineTwo,
        heroCodeLineThree: profile.heroCodeLineThree,
        heroStatusLabel: profile.heroStatusLabel,
        heroStatusText: profile.heroStatusText,
        techStackCategoryOrder: profile.techStackCategoryOrder,
      };
    }
    return memoryProfile;
  } catch (error) {
    return memoryProfile;
  }
}

export const getProfile = unstable_cache(readProfile, ['portfolio-profile'], {
  tags: [TAGS.profile],
});

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
        contactEmail: data.contactEmail ?? current.contactEmail,
        footerBrand: data.footerBrand ?? current.footerBrand,
        footerLabel: data.footerLabel ?? current.footerLabel,
        footerCopyright: data.footerCopyright ?? current.footerCopyright,
        footerTechStack: data.footerTechStack ?? current.footerTechStack,
        aboutLabel: data.aboutLabel ?? current.aboutLabel,
        aboutHeading: data.aboutHeading ?? current.aboutHeading,
        aboutIntroTitle: data.aboutIntroTitle ?? current.aboutIntroTitle,
        aboutParagraphOne: data.aboutParagraphOne ?? current.aboutParagraphOne,
        aboutParagraphTwo: data.aboutParagraphTwo ?? current.aboutParagraphTwo,
        aboutResumeLabel: data.aboutResumeLabel ?? current.aboutResumeLabel,
        aboutGithubLabel: data.aboutGithubLabel ?? current.aboutGithubLabel,
        aboutContactLabel: data.aboutContactLabel ?? current.aboutContactLabel,
        aboutPrincipleOneTitle: data.aboutPrincipleOneTitle ?? current.aboutPrincipleOneTitle,
        aboutPrincipleOneDescription: data.aboutPrincipleOneDescription ?? current.aboutPrincipleOneDescription,
        aboutPrincipleTwoTitle: data.aboutPrincipleTwoTitle ?? current.aboutPrincipleTwoTitle,
        aboutPrincipleTwoDescription: data.aboutPrincipleTwoDescription ?? current.aboutPrincipleTwoDescription,
        aboutPrincipleThreeTitle: data.aboutPrincipleThreeTitle ?? current.aboutPrincipleThreeTitle,
        aboutPrincipleThreeDescription: data.aboutPrincipleThreeDescription ?? current.aboutPrincipleThreeDescription,
        heroTechStack: data.heroTechStack ?? current.heroTechStack,
        heroCodeLineOne: data.heroCodeLineOne ?? current.heroCodeLineOne,
        heroCodeLineTwo: data.heroCodeLineTwo ?? current.heroCodeLineTwo,
        heroCodeLineThree: data.heroCodeLineThree ?? current.heroCodeLineThree,
        heroStatusLabel: data.heroStatusLabel ?? current.heroStatusLabel,
        heroStatusText: data.heroStatusText ?? current.heroStatusText,
        techStackCategoryOrder: data.techStackCategoryOrder ?? current.techStackCategoryOrder,
      },
      create: {
        id: 'default-profile',
        name: data.name ?? current.name,
        role: data.role ?? current.role,
        location: data.location ?? current.location,
        headline: data.headline ?? current.headline,
        subheadline: data.subheadline ?? current.subheadline,
        availableForWork: data.availableForWork ?? true,
        resumeUrl: data.resumeUrl ?? current.resumeUrl,
        githubUrl: data.githubUrl ?? current.githubUrl,
        linkedinUrl: data.linkedinUrl ?? current.linkedinUrl,
        twitterUrl: data.twitterUrl ?? current.twitterUrl,
        contactEmail: data.contactEmail ?? current.contactEmail,
        footerBrand: data.footerBrand ?? current.footerBrand,
        footerLabel: data.footerLabel ?? current.footerLabel,
        footerCopyright: data.footerCopyright ?? current.footerCopyright,
        footerTechStack: data.footerTechStack ?? current.footerTechStack,
        aboutLabel: data.aboutLabel ?? current.aboutLabel,
        aboutHeading: data.aboutHeading ?? current.aboutHeading,
        aboutIntroTitle: data.aboutIntroTitle ?? current.aboutIntroTitle,
        aboutParagraphOne: data.aboutParagraphOne ?? current.aboutParagraphOne,
        aboutParagraphTwo: data.aboutParagraphTwo ?? current.aboutParagraphTwo,
        aboutResumeLabel: data.aboutResumeLabel ?? current.aboutResumeLabel,
        aboutGithubLabel: data.aboutGithubLabel ?? current.aboutGithubLabel,
        aboutContactLabel: data.aboutContactLabel ?? current.aboutContactLabel,
        aboutPrincipleOneTitle: data.aboutPrincipleOneTitle ?? current.aboutPrincipleOneTitle,
        aboutPrincipleOneDescription: data.aboutPrincipleOneDescription ?? current.aboutPrincipleOneDescription,
        aboutPrincipleTwoTitle: data.aboutPrincipleTwoTitle ?? current.aboutPrincipleTwoTitle,
        aboutPrincipleTwoDescription: data.aboutPrincipleTwoDescription ?? current.aboutPrincipleTwoDescription,
        aboutPrincipleThreeTitle: data.aboutPrincipleThreeTitle ?? current.aboutPrincipleThreeTitle,
        aboutPrincipleThreeDescription: data.aboutPrincipleThreeDescription ?? current.aboutPrincipleThreeDescription,
        heroTechStack: data.heroTechStack ?? current.heroTechStack,
        heroCodeLineOne: data.heroCodeLineOne ?? current.heroCodeLineOne,
        heroCodeLineTwo: data.heroCodeLineTwo ?? current.heroCodeLineTwo,
        heroCodeLineThree: data.heroCodeLineThree ?? current.heroCodeLineThree,
        heroStatusLabel: data.heroStatusLabel ?? current.heroStatusLabel,
        heroStatusText: data.heroStatusText ?? current.heroStatusText,
        techStackCategoryOrder: data.techStackCategoryOrder ?? current.techStackCategoryOrder,
      },
    });
    memoryProfile = { ...memoryProfile, ...updated };
    invalidate(TAGS.profile);
    return memoryProfile;
  } catch (error) {
    memoryProfile = { ...memoryProfile, ...data };
    invalidate(TAGS.profile);
    return memoryProfile;
  }
}

// ---------------- PROJECTS ----------------
async function readProjects(): Promise<Project[]> {
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

export const getProjects = unstable_cache(readProjects, ['portfolio-projects'], {
  tags: [TAGS.projects],
});

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
    invalidate(TAGS.projects);
    return proj;
  } catch (error) {
    const newProj: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    memoryProjects = [newProj, ...memoryProjects];
    invalidate(TAGS.projects);
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
    invalidate(TAGS.projects);
    return result;
  } catch (error) {
    memoryProjects = memoryProjects.map((p) => (p.id === id ? { ...p, ...data } : p));
    const found = memoryProjects.find((p) => p.id === id);
    if (!found) throw new Error('Project not found');
    invalidate(TAGS.projects);
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
  invalidate(TAGS.projects);
  return true;
}

// ---------------- EDUCATION ----------------
async function readEducations(): Promise<EducationItem[]> {
  try {
    const items = await prisma.education.findMany({ orderBy: { order: 'asc' } });
    if (items && items.length > 0) return items;
    return memoryEducation;
  } catch (error) {
    return memoryEducation;
  }
}

export const getEducations = unstable_cache(readEducations, ['portfolio-education'], {
  tags: [TAGS.education],
});

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
    invalidate(TAGS.education);
    return created;
  } catch (error) {
    const item: EducationItem = { ...data, id: `edu-${Date.now()}` };
    memoryEducation = [...memoryEducation, item];
    invalidate(TAGS.education);
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
    invalidate(TAGS.education);
    return updated;
  } catch (error) {
    memoryEducation = memoryEducation.map((e) => (e.id === id ? { ...e, ...data } : e));
    const found = memoryEducation.find((e) => e.id === id);
    if (!found) throw new Error('Education item not found');
    invalidate(TAGS.education);
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
  invalidate(TAGS.education);
  return true;
}

// ---------------- SKILLS / TECH STACK ----------------
async function readSkills(): Promise<SkillItem[]> {
  try {
    const items = await prisma.skill.findMany({ orderBy: { order: 'asc' } });
    if (items && items.length > 0) return items;
    return memorySkills;
  } catch (error) {
    return memorySkills;
  }
}

export const getSkills = unstable_cache(readSkills, ['portfolio-skills'], {
  tags: [TAGS.skills],
});

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
    invalidate(TAGS.skills);
    return created;
  } catch (error) {
    const item: SkillItem = { ...data, id: `sk-${Date.now()}` };
    memorySkills = [...memorySkills, item];
    invalidate(TAGS.skills);
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
    invalidate(TAGS.skills);
    return updated;
  } catch (error) {
    memorySkills = memorySkills.map((s) => (s.id === id ? { ...s, ...data } : s));
    const found = memorySkills.find((s) => s.id === id);
    if (!found) throw new Error('Skill not found');
    invalidate(TAGS.skills);
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
  invalidate(TAGS.skills);
  return true;
}

// ---------------- EXPERIENCE ----------------
async function readExperiences(): Promise<ExperienceItem[]> {
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

export const getExperiences = unstable_cache(readExperiences, ['portfolio-experience'], {
  tags: [TAGS.experience],
});

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
    invalidate(TAGS.experience);
    return created;
  } catch (error) {
    const item: ExperienceItem = { ...data, id: `exp-${Date.now()}` };
    memoryExperience = [...memoryExperience, item];
    invalidate(TAGS.experience);
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
    invalidate(TAGS.experience);
    return updated;
  } catch (error) {
    memoryExperience = memoryExperience.map((e) => (e.id === id ? { ...e, ...data } : e));
    const found = memoryExperience.find((e) => e.id === id);
    if (!found) throw new Error('Experience not found');
    invalidate(TAGS.experience);
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
  invalidate(TAGS.experience);
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
