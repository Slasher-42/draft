export interface EvaluatorProfile {
  id: number;
  department: string;
  specialization?: string;
  country?: string;
  city?: string;
}

export interface EvaluatorProfileRequest {
  department: string;
  specialization?: string;
  country?: string;
  city?: string;
}