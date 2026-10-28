'use client';

import React from 'react';
import { Github, Linkedin, Twitter, ArrowUp, Heart } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200/60 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 tracking-tight text-base">AM.</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500">Liquid Glass Engineer Portfolio</span>
        </div>

        <div className="flex items-center gap-6 text-slate-500">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-full liquid-badge hover:bg-white text-slate-600 transition-colors ml-2"
            title="Back to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>© {new Date().getFullYear()} Alex Miller. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed with Next.js, PostgreSQL, Firebase, Zustand & TypeScript
        </p>
      </div>
    </footer>
  );
}

