'use client';

import { useEffect } from 'react';
import { usePortfolioStore } from '@/lib/store';

interface Props {
  initialColor: string;
}

export default function ThemeController({ initialColor }: Props) {
  const accentColor = usePortfolioStore((state) => state.accentColor);
  const setAccentColor = usePortfolioStore((state) => state.setAccentColor);

  useEffect(() => {
    setAccentColor(initialColor);
  }, [initialColor, setAccentColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  return null;
}
