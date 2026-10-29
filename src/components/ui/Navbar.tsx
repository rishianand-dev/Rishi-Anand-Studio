'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePortfolioStore } from '@/lib/store';
import { FileText } from 'lucide-react';

export default function Navbar() {
  const { activeSection, setActiveSection, profile } = usePortfolioStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Work', href: '#work' },
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5 sm:pt-6 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
          scrolled ? 'liquid-glass-nav shadow-lg scale-[0.98]' : 'liquid-glass-nav'
        } max-w-5xl w-full min-w-0`}
      >
        {/* Brand / Logo */}
        <Link
          href="/"
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors shrink-0"
        >
          {profile.footerBrand}
        </Link>

        {/* Navigation Links */}
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const isActive = activeSection === item.name.toLowerCase();
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveSection(item.name.toLowerCase())}
                className={`relative shrink-0 px-2 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-900 bg-white/70 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {item.name}
              </a>
            );
          })}
        </div>

        {/* Right side: Resume CTA, Status & Admin Login */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Direct Resume Button */}
          <a
            href={profile.resumeUrl || '/resume.pdf'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-indigo-900 border border-indigo-200/70 text-xs font-semibold shadow-2xs transition-all"
            title="Access Official Resume"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Resume</span>
          </a>

          {/* Available for work badge */}
          {profile.availableForWork && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-emerald-500/20 text-xs font-medium text-slate-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Available</span>
            </div>
          )}

        </div>
      </nav>
    </header>
  );
}
