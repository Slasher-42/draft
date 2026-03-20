export const ROLE_PERMISSIONS = {
  STARTUP: [
    'view:own-profile',
    'edit:own-profile',
    'view:own-readiness',
  ],
  INVESTOR: [
    'view:own-profile',
    'edit:own-profile',
    'view:startups',
  ],
  EVALUATOR: [
    'view:startups',
    'review:startups',
  ],
  ADMIN: [
    'view:all-users',
    'delete:users',
    'view:startups',
    'view:investors',
  ],
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ROLE_STARTUP:   'Startup',
  ROLE_INVESTOR:  'Investor',
  ROLE_EVALUATOR: 'Evaluator',
  ROLE_ADMIN:     'Administrator',
};

export const ROLE_COLORS: Record<string, string> = {
  ROLE_STARTUP:   'bg-brand-500 text-white',
  ROLE_INVESTOR:  'bg-gold-500 text-white',
  ROLE_EVALUATOR: 'bg-blue-600 text-white',
  ROLE_ADMIN:     'bg-red-600 text-white',
};