'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  User,
  Users,
  Settings,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const startupNav: NavItem[] = [
  { label: 'Dashboard',    href: '/startup/dashboard',         icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Profile',   href: '/startup/profile',           icon: <User className="h-4 w-4" /> },
  { label: 'Settings',     href: '/startup/settings',          icon: <Settings className="h-4 w-4" /> },
];

const investorNav: NavItem[] = [
  { label: 'Dashboard',    href: '/investor/dashboard',        icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Profile',   href: '/investor/profile',          icon: <User className="h-4 w-4" /> },
  { label: 'Settings',     href: '/investor/settings',         icon: <Settings className="h-4 w-4" /> },
];

const evaluatorNav: NavItem[] = [
  { label: 'Dashboard',    href: '/evaluator/dashboard',       icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Profile',   href: '/evaluator/profile',         icon: <User className="h-4 w-4" /> },
  { label: 'Settings',     href: '/evaluator/settings',        icon: <Settings className="h-4 w-4" /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard',    href: '/admin/dashboard',           icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Users',        href: '/admin/users',               icon: <Users className="h-4 w-4" /> },
  { label: 'Settings',     href: '/admin/settings',            icon: <Settings className="h-4 w-4" /> },
];

function getNavItems(role: string): NavItem[] {
  const normalized = role?.replace('ROLE_', '');
  switch (normalized) {
    case 'STARTUP':   return startupNav;
    case 'INVESTOR':  return investorNav;
    case 'EVALUATOR': return evaluatorNav;
    case 'ADMIN':     return adminNav;
    default:          return [];
  }
}

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const navItems = getNavItems(user?.role ?? '');

  return (
    <motion.aside
      className="w-60 min-h-screen bg-surface-subtle border-r border-surface-border flex flex-col py-6 px-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-body transition-all duration-200 group',
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                    : 'text-surface-muted hover:text-white hover:bg-surface-card'
                )}
              >
                <span className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-brand-400' : 'text-surface-muted group-hover:text-brand-400'
                )}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-3 w-3 text-brand-400 opacity-70" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto pt-4 border-t border-surface-border flex items-center gap-3 px-1">
          <Avatar src={user.profilePictureUrl} name={user.fullName} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{user.fullName}</span>
            <span className="text-xs text-surface-muted truncate">{user.email}</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}