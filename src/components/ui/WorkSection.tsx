'use client';

import React from 'react';
import Image from 'next/image';
import { usePortfolioStore } from '@/lib/store';
import { ExternalLink, Github, Star, ArrowUpRight } from 'lucide-react';
import { Project } from '@/lib/types';

export default function WorkSection() {
  const { projects, selectedCategory, setSelectedCategory, setSelectedProject } = usePortfolioStore();

  const categories = ['All', 'Full Stack', 'Frontend', 'Backend', 'Distributed Systems', 'AI / Creative'];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="work" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="text-xs font-mono font-semibold tracking-widest uppercase text-indigo-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>SELECTED WORK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Engineered for performance, crafted for delight.
          </h2>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-3xl liquid-glass-nav w-fit">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredProjects.map((project: Project, index: number) => (
          <div
            key={project.id || index}
            onClick={() => setSelectedProject(project)}
            className="group cursor-pointer liquid-glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative"
          >
            {/* Top Bar with category and star count */}
            <div className="flex items-center justify-between mb-5 z-10">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-indigo-50/90 text-indigo-700 border border-indigo-100">
                {project.category}
              </span>

              <div className="flex items-center gap-3">
                {project.stars && (
                  <span className="flex items-center gap-1 text-xs font-mono font-medium text-slate-500">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{project.stars}</span>
                  </span>
                )}
                <div className="p-1.5 rounded-full bg-white/70 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>

            {/* Showcase Image with glass bezel */}
            <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-white/60 shadow-inner">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-xs font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  Click to inspect architecture & live demo
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {project.description}
                </p>
              </div>

              {/* Metrics Pill & Tech Tags */}
              <div className="pt-2">
                {project.metrics && (
                  <div className="mb-3 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50/60 px-3 py-1 rounded-lg border border-indigo-100/70 inline-block">
                    ⚡ {project.metrics}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-white/70 border border-slate-200/50 shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
