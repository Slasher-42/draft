import type { IndustryType } from './common';

export interface InvestorProfile {
  id: number;
  organizationName: string;
  preferredIndustry: IndustryType;
  investmentBudget: number;
  country?: string;
  city?: string;
}

export interface InvestorProfileRequest {
  organizationName: string;
  preferredIndustry: IndustryType;
  investmentBudget: number;
  country?: string;
  city?: string;
}