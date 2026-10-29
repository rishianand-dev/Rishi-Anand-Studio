'use client';

import React from 'react';
import Image from 'next/image';
import { usePortfolioStore } from '@/lib/store';
import { X, ExternalLink, Github, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProjectModal() {
  const { selectedProject, setSelectedProject } = usePortfolioStore();

  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 pt-24 sm:p-6 sm:pt-28 bg-slate-900/40 backdrop-blur-md transition-all">
      <div
        className="relative w-full max-w-3xl max-h-[calc(100vh-7rem)] overflow-y-auto liquid-glass-card bg-white/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setSelectedProject(null)}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            {selectedProject.category}
          </span>
          {selectedProject.metrics && (
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {selectedProject.metrics}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
          {selectedProject.title}
        </h2>

        {/* Image Display */}
        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-200/60 shadow-inner">
          <Image
            src={selectedProject.imageUrl}
            alt={selectedProject.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Description & Architecture */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Overview & Architecture
          </h4>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            {selectedProject.longDescription || selectedProject.description}
          </p>
        </div>

        {/* Tech Stack Chips */}
        <div className="mb-8">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
            Technologies & Tools
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedProject.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-900 bg-indigo-50/80 border border-indigo-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-200/70">
          {selectedProject.demoUrl && (
            <a
              href={selectedProject.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Live Preview</span>
            </a>
          )}
          {selectedProject.githubUrl && (
            <a
              href={selectedProject.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full liquid-badge hover:bg-white text-slate-800 text-xs font-semibold transition-colors"
            >
              <Github className="w-4 h-4 text-slate-700" />
              <span>Source Repository</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
