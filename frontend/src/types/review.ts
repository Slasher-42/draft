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
  evaluatorName?: string;
  score: AssessmentScore;
  decision?: ReviewDecision;
  reason?: string;
  createdAt: string;
  updatedAt: string;
  startupInfo?: {
    companySize: string;
    businessModel: string;
    targetMarket: string;
    fundingNeeded: number;
    problemStatement: string;
  };
}