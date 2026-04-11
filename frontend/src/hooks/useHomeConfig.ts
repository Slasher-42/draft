"use client";

import { useState, useEffect, useCallback } from "react";

export interface HomeConfig {
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  locationLat: number;
  locationLng: number;
  locationLabel: string;
  animationsEnabled: boolean;
  showInvestors: boolean;
  showStartups: boolean;
  showStats: boolean;
  showContact: boolean;
  showMap: boolean;
  heroVideoUrl: string | null;
}

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  heroTitle: "Empowering Africa's Next Generation of Investors & Startups",
  heroSubtitle:
    "RG Partners connects visionary startups with strategic investors through AI-powered investment readiness assessments.",
  ctaPrimaryText: "Get Started",
  ctaSecondaryText: "Learn More",
  contactEmail: "contact@rgpartners.com",
  contactPhone: "+250 788 000 000",
  contactAddress: "Kigali, Rwanda",
  locationLat: -1.9441,
  locationLng: 30.0619,
  locationLabel: "RG Partners HQ — Kigali, Rwanda",
  animationsEnabled: true,
  showInvestors: true,
  showStartups: true,
  showStats: true,
  showContact: true,
  showMap: true,
  heroVideoUrl: null,
};

const STORAGE_KEY = "rg_homepage_config";

export function useHomeConfig() {
  const [config, setConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConfig({ ...DEFAULT_HOME_CONFIG, ...JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors, fall back to defaults
    }
    setIsLoaded(true);
  }, []);

  const saveConfig = useCallback((updates: Partial<HomeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setConfig(DEFAULT_HOME_CONFIG);
  }, []);

  return { config, saveConfig, resetConfig, isLoaded };
}
