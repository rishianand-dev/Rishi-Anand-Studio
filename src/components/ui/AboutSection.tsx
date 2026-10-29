'use client';

import React from 'react';
import { Code2, Cpu, FileText, Globe2, Sparkles, Terminal, Zap, ExternalLink } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store';

export default function AboutSection() {
  const { profile, skills } = usePortfolioStore();

  const principles = [
    {
      icon: <Zap className="w-5 h-5 text-indigo-600" />,
      title: profile.aboutPrincipleOneTitle,
      description: profile.aboutPrincipleOneDescription,
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      title: profile.aboutPrincipleTwoTitle,
      description: profile.aboutPrincipleTwoDescription,
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
      title: profile.aboutPrincipleThreeTitle,
      description: profile.aboutPrincipleThreeDescription,
    },
  ];

  // Group dynamic skills by category
  const categories = ['Frontend', 'Backend', 'Practices'];
  const groupedSkills = categories.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category.toLowerCase() === cat.toLowerCase());
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="mb-12">
        <div className="text-xs font-mono font-semibold tracking-widest uppercase text-indigo-600 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>{profile.aboutLabel}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {profile.aboutHeading}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Bio Card */}
        <div className="lg:col-span-7 liquid-glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {profile.aboutIntroTitle.replace('{name}', profile.name)}
            </h3>
            <div className="space-y-4 text-slate-600 leading-relaxed text-base">
              <p>
                {profile.aboutParagraphOne}
              </p>
              <p>
                {profile.aboutParagraphTwo}
              </p>
            </div>
          </div>

          {/* Action CTAs including direct Resume Access */}
          <div className="pt-8 border-t border-slate-200/50 mt-8 flex flex-wrap items-center gap-4">
            {/* Access Resume Button */}
            <a
              href={profile.resumeUrl || '/resume.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{profile.aboutResumeLabel}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-badge hover:bg-white text-slate-800 text-xs font-semibold transition-colors"
              >
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span>{profile.aboutGithubLabel}</span>
              </a>
            )}

            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{profile.aboutContactLabel}</span>
            </a>
          </div>
        </div>

        {/* Principles Bento Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="liquid-glass-card rounded-2xl p-6 transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100/80">
                  {principle.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900">{principle.title}</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Matrix (Dynamic from Zustand & DB) */}
      <div className="mt-8 liquid-glass-card rounded-3xl p-8 sm:p-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <span>Core Tech Stack & Engineering Toolkit</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-700">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {(groupedSkills[category] || []).map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white/80 border border-slate-200/60 shadow-2xs hover:border-indigo-300 hover:text-indigo-900 transition-colors"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
