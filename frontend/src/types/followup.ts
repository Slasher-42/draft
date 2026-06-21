export type MeetupStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ContractStatus =
  | "PENDING_SIGNATURES"
  | "INVESTOR_SIGNED"
  | "STARTUP_SIGNED"
  | "BOTH_SIGNED"
  | "VALIDATED"
  | "REJECTED";
export type PaymentMethod = "BANK_TRANSFER" | "CREDIT_CARD" | "MOBILE_MONEY" | "CRYPTO";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Meetup {
  id: number;
  matchId: number;
  investorUserId: number;
  startupUserId: number;
  scheduledByAdminId: number;
  scheduledAt: string;
  status: MeetupStatus;
  roomId: string;
  adminNotes?: string;
  feedback?: string;
  adjournedByUserId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: number;
  meetupId: number;
  matchId: number;
  investorUserId: number;
  startupUserId: number;
  contractDetails?: string;
  investorSignature?: string;
  startupSignature?: string;
  adminValidationSignature?: string;
  validatedByAdminId?: number;
  status: ContractStatus;
  investorSignedAt?: string;
  startupSignedAt?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  userId: number;
  userRole: string;
  balance: number;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  fromUserId: number;
  toUserId: number;
  matchId: number;
  contractId?: number;
  amount: number;
  description?: string;
  status: TransactionStatus;
  createdAt: string;
}
