'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePortfolioStore } from '@/lib/store';

export default function LiquidSphere() {
  const { profile } = usePortfolioStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax motion tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const badgeTranslateX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const badgeTranslateY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full max-w-[540px] aspect-square mx-auto select-none pointer-events-auto"
      style={{ perspective: 1200 }}
    >
      {/* Concentric orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[125%] h-[125%] rounded-full border border-indigo-200/40 opacity-70 animate-pulse-subtle" />
        <div className="absolute w-[105%] h-[105%] rounded-full border border-indigo-300/30" />
        <div className="absolute w-[85%] h-[85%] rounded-full border border-purple-200/40" />
      </div>

      {/* Main Liquid Glass 3D Sphere */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] rounded-full cursor-grab active:cursor-grabbing"
      >
        {/* Deep ambient drop shadow */}
        <div
          className="absolute -inset-4 rounded-full blur-2xl opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 80%)',
            transform: 'translateY(25px) scale(0.95)',
          }}
        />

        {/* Outer refractive glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 opacity-95 shadow-2xl overflow-hidden">
          {/* Internal volumetric refraction gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.2) 20%, transparent 55%),
                radial-gradient(circle at 75% 75%, rgba(67, 56, 202, 0.9) 0%, rgba(109, 40, 217, 0.7) 40%, transparent 70%),
                linear-gradient(135deg, #818cf8 0%, #7c3aed 50%, #4338ca 100%)
              `,
            }}
          />

          {/* Liquid Glass Highlight (top-left glossy reflection) */}
          <div
            className="absolute top-[12%] left-[16%] w-[120px] h-[90px] rounded-full blur-[6px] transform -rotate-12 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 45%, transparent 75%)',
            }}
          />

          {/* Secondary subtle rim highlight */}
          <div
            className="absolute bottom-[8%] right-[14%] w-[90px] h-[60px] rounded-full blur-[8px] opacity-70 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(199, 210, 254, 0.7) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Glass Orb Inner 1px Highlight Ring */}
        <div className="absolute inset-0 rounded-full border border-white/50 pointer-events-none shadow-[inset_0_2px_12px_rgba(255,255,255,0.6)]" />
      </motion.div>

      {/* Floating Badge 1: Code Craft (Top Left) */}
      <motion.div
        style={{
          x: badgeTranslateX,
          y: badgeTranslateY,
          translateZ: 60,
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 left-0 sm:left-4 z-20 liquid-badge px-4 py-3 rounded-2xl min-w-[170px]"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
        </div>
        <pre className="text-xs font-mono text-indigo-950 font-medium leading-relaxed">
          <span className="text-indigo-600 font-semibold">{profile.heroCodeLineOne.split(' ')[0]}</span>{' '}
          {profile.heroCodeLineOne.split(' ').slice(1).join(' ')}<br />
          {'  '}{profile.heroCodeLineTwo}<br />
          {'  '}{profile.heroCodeLineThree}
        </pre>
      </motion.div>

      {/* Floating Badge 2: Currently Status (Bottom Right) */}
      <motion.div
        style={{
          x: useTransform(smoothX, [-0.5, 0.5], [15, -15]),
          y: useTransform(smoothY, [-0.5, 0.5], [15, -15]),
          translateZ: 80,
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-4 right-0 sm:right-4 z-20 liquid-badge px-4 py-3 rounded-2xl"
      >
        <div className="text-[10px] tracking-widest font-semibold uppercase text-indigo-400 mb-0.5">
        {profile.heroStatusLabel}
        </div>
        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
        <span>{profile.heroStatusText}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
