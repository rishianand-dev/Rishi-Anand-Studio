'use client';

import React from 'react';
import { ArrowRight, MessageSquare, FileText, ExternalLink } from 'lucide-react';
import LiquidSphere from './LiquidSphere';
import { usePortfolioStore } from '@/lib/store';

export default function Hero() {
  const { setContactModalOpen, profile } = usePortfolioStore();

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start z-10 text-left">
          {/* Subtitle tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-[11px] sm:text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-6 shadow-sm">
            <span>{profile.role || 'SOFTWARE ENGINEER · BASED IN NEW YORK'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-slate-900 leading-[1.08] mb-6">
            {profile.headline.includes('effortless') ? (
              <>
                {profile.headline.split('effortless')[0]}
                <span className="text-gradient-purple">effortless.</span>
              </>
            ) : (
              profile.headline
            )}
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-xl font-normal leading-relaxed mb-8">
            {profile.subheadline}
          </p>

          {/* CTA Buttons with View Resume Button */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#work"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore my work</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* View Resume Button */}
            <a
              href={profile.resumeUrl || '/resume.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full liquid-glass-card hover:bg-white/95 text-indigo-950 text-sm font-semibold transition-all duration-200 shadow-sm border border-indigo-200/70"
              title="Access & View Official Resume"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>View Resume</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </a>

            <button
              onClick={() => setContactModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full liquid-glass-card hover:bg-white/90 text-slate-700 text-sm font-medium transition-all duration-200 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Let&apos;s talk</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Liquid Sphere with Floating Frosted Badges */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end items-center relative">
          <LiquidSphere />
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="mt-16 pt-8 flex items-center justify-between text-xs tracking-widest font-semibold uppercase text-slate-400 border-t border-slate-200/50">
        <a href="#work" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
          <span>SCROLL TO EXPLORE</span>
          <span className="font-mono">────→</span>
        </a>

        <div className="hidden sm:flex items-center gap-6 text-[11px] text-slate-500 font-mono">
          {profile.heroTechStack.split(',').map((technology) => (
            <span key={technology}>{technology.trim()}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
