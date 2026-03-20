export const ROUTES = {
  LOGIN:    '/login',
  REGISTER: '/register',
  VERIFY_2FA: '/verify-2fa',

  STARTUP_DASHBOARD: '/startup/dashboard',
  STARTUP_PROFILE:   '/startup/profile',
  STARTUP_PROFILE_EDIT: '/startup/profile/edit',
  INVESTOR_DASHBOARD: '/investor/dashboard',
  INVESTOR_PROFILE:   '/investor/profile',
  INVESTOR_PROFILE_EDIT: '/investor/profile/edit',

  EVALUATOR_DASHBOARD: '/evaluator/dashboard',

  ADMIN_DASHBOARD:    '/admin/dashboard',
  ADMIN_USERS:        '/admin/users',
  ADMIN_CREATE_USER:  '/admin/users/create',
  ADMIN_SETTINGS:     '/admin/settings',
} as const;