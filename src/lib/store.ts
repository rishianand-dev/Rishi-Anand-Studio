import { create } from 'zustand';
import { Project, ExperienceItem, ProfileData, EducationItem, SkillItem } from './types';
import { INITIAL_PROJECTS, INITIAL_EXPERIENCE, INITIAL_PROFILE, INITIAL_EDUCATION, INITIAL_SKILLS } from './initial-data';

interface PortfolioState {
  // Navigation & Sections
  activeSection: string;
  setActiveSection: (section: string) => void;

  // Projects filtering & selection
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;

  // Modals & Panels
  isContactModalOpen: boolean;
  setContactModalOpen: (open: boolean) => void;
  isAdminDrawerOpen: boolean;
  setAdminDrawerOpen: (open: boolean) => void;

  // Glass Aesthetics Settings
  blurLevel: 'subtle' | 'standard' | 'ultra';
  setBlurLevel: (level: 'subtle' | 'standard' | 'ultra') => void;
  liquidGlow: boolean;
  toggleLiquidGlow: () => void;

  // Data & State Updaters
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProjectInStore: (project: Project) => void;
  deleteProjectFromStore: (id: string) => void;

  experiences: ExperienceItem[];
  setExperiences: (experiences: ExperienceItem[]) => void;
  addExperience: (exp: ExperienceItem) => void;
  updateExperienceInStore: (exp: ExperienceItem) => void;
  deleteExperienceFromStore: (id: string) => void;

  educations: EducationItem[];
  setEducations: (educations: EducationItem[]) => void;
  addEducation: (edu: EducationItem) => void;
  updateEducationInStore: (edu: EducationItem) => void;
  deleteEducationFromStore: (id: string) => void;

  skills: SkillItem[];
  setSkills: (skills: SkillItem[]) => void;
  addSkill: (skill: SkillItem) => void;
  updateSkillInStore: (skill: SkillItem) => void;
  deleteSkillFromStore: (id: string) => void;

  profile: ProfileData;
  setProfile: (profile: ProfileData) => void;
  updateProfileInStore: (profile: Partial<ProfileData>) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  activeSection: 'work',
  setActiveSection: (section) => set({ activeSection: section }),

  selectedCategory: 'All',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),

  isContactModalOpen: false,
  setContactModalOpen: (open) => set({ isContactModalOpen: open }),

  isAdminDrawerOpen: false,
  setAdminDrawerOpen: (open) => set({ isAdminDrawerOpen: open }),

  blurLevel: 'standard',
  setBlurLevel: (level) => set({ blurLevel: level }),

  liquidGlow: true,
  toggleLiquidGlow: () => set((state) => ({ liquidGlow: !state.liquidGlow })),

  projects: INITIAL_PROJECTS,
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects.filter((p) => p.id !== project.id)],
    })),
  updateProjectInStore: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    })),
  deleteProjectFromStore: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),

  experiences: INITIAL_EXPERIENCE,
  setExperiences: (experiences) => set({ experiences }),
  addExperience: (exp) =>
    set((state) => ({
      experiences: [...state.experiences, exp],
    })),
  updateExperienceInStore: (exp) =>
    set((state) => ({
      experiences: state.experiences.map((e) => (e.id === exp.id ? exp : e)),
    })),
  deleteExperienceFromStore: (id) =>
    set((state) => ({
      experiences: state.experiences.filter((e) => e.id !== id),
    })),

  educations: INITIAL_EDUCATION,
  setEducations: (educations) => set({ educations }),
  addEducation: (edu) =>
    set((state) => ({
      educations: [...state.educations, edu],
    })),
  updateEducationInStore: (edu) =>
    set((state) => ({
      educations: state.educations.map((e) => (e.id === edu.id ? edu : e)),
    })),
  deleteEducationFromStore: (id) =>
    set((state) => ({
      educations: state.educations.filter((e) => e.id !== id),
    })),

  skills: INITIAL_SKILLS,
  setSkills: (skills) => set({ skills }),
  addSkill: (skill) =>
    set((state) => ({
      skills: [...state.skills, skill],
    })),
  updateSkillInStore: (skill) =>
    set((state) => ({
      skills: state.skills.map((s) => (s.id === skill.id ? skill : s)),
    })),
  deleteSkillFromStore: (id) =>
    set((state) => ({
      skills: state.skills.filter((s) => s.id !== id),
    })),

  profile: INITIAL_PROFILE,
  setProfile: (profile) => set({ profile }),
  updateProfileInStore: (partial) =>
    set((state) => ({
      profile: { ...state.profile, ...partial },
    })),
}));
