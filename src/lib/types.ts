export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string | null;
  category: 'Full Stack' | 'Frontend' | 'Distributed Systems' | 'AI / Creative';
  tags: string[];
  featured: boolean;
  imageUrl: string;
  demoUrl?: string | null;
  githubUrl?: string | null;
  stars?: number;
  metrics?: string | null;
  order: number;
  createdAt?: string | Date;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  skills: string[];
  order: number;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  location?: string | null;
  description?: string | null;
  order: number;
}

export interface SkillItem {
  id: string;
  category: string;
  name: string;
  order: number;
}

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  attachmentUrl?: string;
  createdAt?: string | Date;
}

export interface ProfileData {
  id: string;
  name: string;
  role: string;
  location: string;
  headline: string;
  subheadline: string;
  availableForWork: boolean;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  contactEmail: string;
  footerBrand: string;
  footerLabel: string;
  footerCopyright: string;
  footerTechStack: string;
  aboutLabel: string;
  aboutHeading: string;
  aboutIntroTitle: string;
  aboutParagraphOne: string;
  aboutParagraphTwo: string;
  aboutResumeLabel: string;
  aboutGithubLabel: string;
  aboutContactLabel: string;
  aboutPrincipleOneTitle: string;
  aboutPrincipleOneDescription: string;
  aboutPrincipleTwoTitle: string;
  aboutPrincipleTwoDescription: string;
  aboutPrincipleThreeTitle: string;
  aboutPrincipleThreeDescription: string;
  heroTechStack: string;
  heroCodeLineOne: string;
  heroCodeLineTwo: string;
  heroCodeLineThree: string;
  heroStatusLabel: string;
  heroStatusText: string;
}

export interface SeoSettingsData {
  id: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  twitterHandle?: string | null;
  robots: string;
}
