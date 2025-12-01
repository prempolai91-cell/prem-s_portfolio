
'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { AboutMeSection } from '@/components/about-me-section';
import { SkillsSection } from '@/components/skills-section';
import { ProjectsSection } from '@/components/projects-section';
import { ContactSection } from '@/components/contact-section';
import { Navbar } from '@/components/navbar';
import { Separator } from '@/components/ui/separator';
import { TechnologiesSection } from '@/components/technologies-section';
import { CertificatesSection } from '@/components/certificates-section';
import { BioSection } from '@/components/bio-section';

export default function HomePage() {
  const sections = {
    home: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
    certificates: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    technologies: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  const router = useRouter();

  const handleScrollTo = (id: string) => {
    const sectionRef = sections[id as keyof typeof sections];
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleNavigate = (path: string) => {
    router.push(path);
  }

  // Effect to handle initial scroll if a hash is present
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && sections[hash as keyof typeof sections]) {
      // Use a timeout to ensure the page has had time to layout
      setTimeout(() => {
        handleScrollTo(hash);
      }, 100);
    }
  }, []); // Run only once on mount

  return (
    <>
      <Navbar onScroll={handleScrollTo} onNavigate={handleNavigate} />
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={sections.home} id="home">
          <Header />
        </div>

        <div className="space-y-20 md:space-y-32">
           <div ref={sections.about} id="about">
            <AboutMeSection />
          </div>

          <Separator />
          
          <div ref={sections.education} id="education">
            <BioSection />
          </div>

          <Separator />

          <div ref={sections.certificates} id="certificates">
            <CertificatesSection />
          </div>

          <Separator />

          <div ref={sections.skills} id="skills">
            <SkillsSection />
          </div>
          
          <Separator />

          <div ref={sections.technologies} id="technologies">
            <TechnologiesSection />
          </div>

          <Separator />

          <div ref={sections.projects} id="projects">
            <ProjectsSection />
          </div>

          <Separator />

          <div ref={sections.contact} id="contact" className="pb-20">
            <ContactSection />
          </div>
        </div>
      </main>
    </>
  );
}
