"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/lib/store";

interface Props {
  initialColor: string;
}

export default function ThemeController({ initialColor }: Props) {
  const accentColor = usePortfolioStore((state) => state.accentColor);
  const setAccentColor = usePortfolioStore((state) => state.setAccentColor);

  useEffect(() => {
    if (accentColor !== initialColor) {
      setAccentColor(initialColor);
      return;
    }

    document.documentElement.style.setProperty("--accent-color", accentColor);
  }, [accentColor, initialColor, setAccentColor]);

  return null;
}
