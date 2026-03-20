import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function getRoleLabel(role: string): string {
  return role
    .replace('ROLE_', '')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function getDashboardPath(role: string): string {
  const r = role?.replace('ROLE_', '') ?? '';

  switch (r) {
    case 'STARTUP':   return '/startup/dashboard';
    case 'INVESTOR':  return '/investor/dashboard';
    case 'EVALUATOR': return '/evaluator/dashboard';
    case 'ADMIN':     return '/admin/dashboard';
    default:
      console.warn(`getDashboardPath: unknown role "${role}" — falling back to /login`);
      return '/login';
  }
}