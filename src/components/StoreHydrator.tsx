'use client';

import React, { useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { Project, ExperienceItem, EducationItem, SkillItem, ProfileData } from '@/lib/types';

interface Props {
  serverProjects: Project[];
  serverExperiences: ExperienceItem[];
  serverEducations: EducationItem[];
  serverSkills: SkillItem[];
  serverProfile: ProfileData;
  children: React.ReactNode;
}

/**
 * Hydrates the Zustand store with server-fetched data on mount.
 * This ensures the portfolio pages always display the latest DB data.
 */
export default function StoreHydrator({
  serverProjects,
  serverExperiences,
  serverEducations,
  serverSkills,
  serverProfile,
  children,
}: Props) {
  const hydrated = useRef(false);
  const {
    setProjects,
    setExperiences,
    setEducations,
    setSkills,
    setProfile,
  } = usePortfolioStore();

  useEffect(() => {
    if (!hydrated.current) {
      setProjects(serverProjects);
      setExperiences(serverExperiences);
      setEducations(serverEducations);
      setSkills(serverSkills);
      setProfile(serverProfile);
      hydrated.current = true;
    }
  }, [serverProjects, serverExperiences, serverEducations, serverSkills, serverProfile, setProjects, setExperiences, setEducations, setSkills, setProfile]);

  return <>{children}</>;
}

