import type { IndustryType } from './common';

export interface StartupProfile {
  id: number;
  companyName: string;
  industry: IndustryType;
  description?: string;
  foundedYear?: number;
  teamSize?: number;
  website?: string;
  country?: string;
  city?: string;
  fundingNeeded: number;
}

export interface StartupProfileRequest {
  companyName: string;
  industry: IndustryType;
  description?: string;
  foundedYear?: number;
  teamSize?: number;
  website?: string;
  country?: string;
  city?: string;
  fundingNeeded: number;
}