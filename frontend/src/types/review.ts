export type ReviewDecision = "APPROVED" | "REJECTED" | "ESCALATED";

export type Classification =
  | "HIGHLY_READY"
  | "MODERATELY_READY"
  | "NOT_READY";

export interface AssessmentScore {
  id: string;
  executionId: string;
  userId: string;
  financialHealth: number;
  teamStrength: number;
  marketPotential: number;
  businessViability: number;
  overallScore: number;
  classification: Classification;
  reasoning: string;
  createdAt: string;
}

export interface EvaluatorReview {
  id: string;
  executionId: string;
  evaluatorId: string;
  startupUserId: string;
  financialHealth: number;
  teamStrength: number;
  marketPotential: number;
  businessViability: number;
  overallScore: number;
  classification: Classification;
  aiReasoning: string;
  companySize: string;
  problemStatement: string;
  businessModel: string;
  targetMarket: string;
  fundingNeeded: number;
  decision?: ReviewDecision;
  reason?: string;
  status: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}
