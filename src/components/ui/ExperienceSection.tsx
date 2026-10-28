'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { Briefcase, Calendar, MapPin, GraduationCap, Award } from 'lucide-react';

export default function ExperienceSection() {
  const { experiences, educations } = usePortfolioStore();

  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Experience Header */}
      <div className="mb-12">
        <div className="text-xs font-mono font-semibold tracking-widest uppercase text-indigo-600 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>CAREER TIMELINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Proven impact at high-growth engineering teams.
        </h2>
      </div>

      {/* Experience Timeline */}
      <div className="relative border-l-2 border-indigo-100/80 ml-4 sm:ml-8 space-y-10 mb-20">
        {experiences.map((exp, index) => (
          <div key={exp.id || index} className="relative pl-8 sm:pl-10 group">
            {/* Timeline Node Orb */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-sm group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200" />

            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {exp.role}
                  </h3>
                  <div className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 mt-0.5">
                    <Briefcase className="w-4 h-4" />
                    <span>{exp.company}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-slate-200/50">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{exp.period}</span>
                  </div>
                  {exp.location && (
                    <div className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-slate-200/50">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                {exp.description}
              </p>

              {/* Stack Pills */}
              <div className="flex flex-wrap gap-1.5">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-white/60 border border-slate-200/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Education & Academic Section */}
      {educations.length > 0 && (
        <div>
          <div className="mb-8">
            <div className="text-xs font-mono font-semibold tracking-widest uppercase text-indigo-600 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>EDUCATION & ACADEMICS</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Foundational Knowledge & Degrees
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educations.map((edu) => (
              <div key={edu.id} className="liquid-glass-card rounded-3xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-white/70 px-3 py-1 rounded-full border border-slate-200/60">
                    {edu.period}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 mb-1">{edu.degree}</h4>
                <div className="text-sm font-semibold text-indigo-600 mb-2">
                  {edu.institution} {edu.location && `• ${edu.location}`}
                </div>
                {edu.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
