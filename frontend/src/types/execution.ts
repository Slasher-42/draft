export type ExecutionStatus = "PENDING" | "MATCHED" | "REJECTED";

export type CompanySize =
  | "PRE_SEED"
  | "SEED"
  | "SERIES_A"
  | "SERIES_B"
  | "GROWTH";

export interface StartupExecution {
  id: string;
  userId: string;
  companySize: CompanySize;
  problemStatement: string;
  businessModel: string;
  targetMarket: string;
  teamDetails: string;
  financialDetails: string;
  fundingNeeded: number;
  additionalConsiderations?: string;
  status: ExecutionStatus;
  reason?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorExecution {
  id: string;
  userId: string;
  industry: string;
  reasonForInvesting: string;
  investmentBudget: number;
  dreamOfSuccess: string;
  specificCriteria?: string;
  additionalConsiderations?: string;
  status: ExecutionStatus;
  reason?: string;
  sessionId?: string;
  matchedStartups?: MatchedStartup[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchedStartup {
  id: string;
  companyName: string;
  industry: string;
  fundingNeeded: number;
  targetMarket: string;
  overallScore?: number;
  classification?: string;
}

export interface AISessionResponse {
  sessionId: string;
  firstQuestion: string;
}

export interface AIAnswerResponse {
  done: boolean;
  nextQuestion?: string;
  message?: string;
}