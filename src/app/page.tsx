import Hero from '@/components/ui/Hero';
import WorkSection from '@/components/ui/WorkSection';
import AboutSection from '@/components/ui/AboutSection';
import ExperienceSection from '@/components/ui/ExperienceSection';
import ContactSection from '@/components/ui/ContactSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <WorkSection />
      <AboutSection />
      <ExperienceSection />
      <ContactSection />
    </div>
  );
}

