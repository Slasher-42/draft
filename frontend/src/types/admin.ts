export interface SystemConfig {
  updateInterval: string;
  scoringWeights: {
    financialHealth: number;
    teamStrength: number;
    marketPotential: number;
    businessViability: number;
  };
  minimumPassingScore: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  actionType: string;
  affectedResource: string;
  outcome: string;
  createdAt: string;
  serviceName: string;
  details?: string;
}

export interface AnalyticsData {
  totalExecutions: number;
  totalApproved: number;
  totalRejected: number;
  totalMatched: number;
  totalPending: number;
  averageScore: number;
  scoreByIndustry: { industry: string; avgScore: number }[];
  executionTrend: { date: string; count: number }[];
  classificationDistribution: {
    highlyReady: number;
    moderatelyReady: number;
    notReady: number;
  };
}

export interface AdminNotification {
  id: string;
  type: string;
  recipientId: string;
  recipientName?: string;
  message: string;
  sentAt: string;
  read: boolean;
}