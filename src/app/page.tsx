import Hero from '@/components/ui/Hero';
import WorkSection from '@/components/ui/WorkSection';
import AboutSection from '@/components/ui/AboutSection';
import ExperienceSection from '@/components/ui/ExperienceSection';
import ContactSection from '@/components/ui/ContactSection';
import StoreHydrator from '@/components/StoreHydrator';
import { getEducations, getExperiences, getProfile, getProjects, getSkills } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [projects, experiences, educations, skills, profile] = await Promise.all([
    getProjects(),
    getExperiences(),
    getEducations(),
    getSkills(),
    getProfile(),
  ]);

  return (
    <StoreHydrator
      serverProjects={projects}
      serverExperiences={experiences}
      serverEducations={educations}
      serverSkills={skills}
      serverProfile={profile}
    >
      <div className="flex flex-col min-h-screen">
        <Hero />
        <WorkSection />
        <AboutSection />
        <ExperienceSection />
        <ContactSection />
      </div>
    </StoreHydrator>
  );
}
