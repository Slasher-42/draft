export type UserRole = "STARTUP" | "INVESTOR" | "EVALUATOR" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  startupProfile?: StartupProfile;
  investorProfile?: InvestorProfile;
  evaluatorProfile?: EvaluatorProfile;
}

export interface StartupProfile {
  id?: string;
  companyName?: string;
  industry?: string;
  country?: string;
  city?: string;
  website?: string;
  teamSize?: number;
  foundedYear?: number;
}

export interface InvestorProfile {
  id?: string;
  organizationName?: string;
  preferredIndustry?: string;
  investmentBudgetRange?: string;
  country?: string;
  city?: string;
}

export interface EvaluatorProfile {
  id?: string;
  department?: string;
  specialization?: string;
  country?: string;
  city?: string;
}