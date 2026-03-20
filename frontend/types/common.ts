export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type IndustryType =
  | 'TECHNOLOGY'
  | 'HEALTHCARE'
  | 'FINANCE'
  | 'EDUCATION'
  | 'AGRICULTURE'
  | 'ENERGY'
  | 'REAL_ESTATE'
  | 'MANUFACTURING'
  | 'RETAIL'
  | 'TRANSPORTATION'
  | 'ENTERTAINMENT'
  | 'OTHER';

export const INDUSTRY_LABELS: Record<IndustryType, string> = {
  TECHNOLOGY:     'Technology',
  HEALTHCARE:     'Healthcare',
  FINANCE:        'Finance',
  EDUCATION:      'Education',
  AGRICULTURE:    'Agriculture',
  ENERGY:         'Energy',
  REAL_ESTATE:    'Real Estate',
  MANUFACTURING:  'Manufacturing',
  RETAIL:         'Retail',
  TRANSPORTATION: 'Transportation',
  ENTERTAINMENT:  'Entertainment',
  OTHER:          'Other',
};