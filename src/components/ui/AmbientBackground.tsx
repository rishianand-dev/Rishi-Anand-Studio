'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Light aesthetic base canvas */}
      <div className="absolute inset-0 bg-[#f7f8fc]" />

      {/* Primary Top Right Iris Glow */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.35, 0.5, 0.35],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[15%] right-[-5%] w-[750px] h-[750px] rounded-full blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(165, 180, 252, 0.7) 0%, rgba(199, 210, 254, 0.3) 50%, transparent 70%)',
        }}
      />

      {/* Left Center Subtle Violet Mist */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.4, 0.25],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[25%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(224, 231, 255, 0.8) 0%, rgba(243, 232, 255, 0.4) 60%, transparent 80%)',
        }}
      />

      {/* Bottom Center Accent Glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-[-10%] left-[20%] w-[800px] h-[600px] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.5) 0%, rgba(224, 231, 255, 0.2) 60%, transparent 80%)',
        }}
      />

      {/* Subtle micro-grid noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.2) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}

