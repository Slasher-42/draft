export type ExecutionStatus = "PENDING" | "MATCHED" | "REJECTED";

export type CompanySize = "MICRO" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

export interface StartupExecution {
  id: number;
  userId: number;
  targetCompanySize: CompanySize;
  suggestedFundingRange: string;
  problemStatement: string;
  businessModel: string;
  targetMarket: string;
  teamDetails: string;
  annualRevenue: number;
  monthlyBurnRate: number;
  fundingNeeded: number;
  aiSessionId?: string;
  additionalConsiderations?: string;
  status: ExecutionStatus;
  statusReason?: string;
  statusUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartupExecutionRequest {
  targetCompanySize: CompanySize;
  problemStatement: string;
  businessModel: string;
  targetMarket: string;
  teamDetails: string;
  annualRevenue: number;
  monthlyBurnRate: number;
  fundingNeeded: number;
}

export interface InvestorExecution {
  id: number;
  userId: number;
  preferredIndustry: string;
  investmentReason: string;
  investmentBudget: number;
  expectedReturnTimeline: string;
  successCriteria?: string;
  aiSessionId?: string;
  additionalConsiderations?: string;
  status: ExecutionStatus;
  statusReason?: string;
  statusUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorExecutionRequest {
  preferredIndustry: string;
  investmentReason: string;
  investmentBudget: number;
  expectedReturnTimeline: string;
  successCriteria?: string;
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