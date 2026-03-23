'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard, User, Users, Settings, PlayCircle,
  List, Search, ChevronLeft, ChevronRight, LogOut,
  Sun, Moon, TrendingUp, ClipboardCheck, Activity, X,
} from 'lucide-react';

interface NavItem { label: string; href: string; icon: React.ElementType; badge?: number; }

const startupNav: NavItem[] = [
  { label: 'Dashboard',  href: '/startup/dashboard',  icon: LayoutDashboard },
  { label: 'My Profile', href: '/startup/profile',     icon: User },
  { label: 'Execute',    href: '/startup/execute',     icon: PlayCircle },
  { label: 'Startups',   href: '/startup/executions',  icon: List },
  { label: 'Settings',   href: '/startup/settings',    icon: Settings },
];

const investorNav: NavItem[] = [
  { label: 'Dashboard',          href: '/investor/dashboard',  icon: LayoutDashboard },
  { label: 'My Profile',         href: '/investor/profile',    icon: User },
  { label: 'Investment Execute', href: '/investor/execute',    icon: TrendingUp },
  { label: 'Look Up',            href: '/investor/executions', icon: Search },
  { label: 'Settings',           href: '/investor/settings',   icon: Settings },
];

const evaluatorNav: NavItem[] = [
  { label: 'Dashboard',  href: '/evaluator/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/evaluator/profile',   icon: User },
  { label: 'Reviews',    href: '/evaluator/reviews',   icon: ClipboardCheck },
  { label: 'Activity',   href: '/evaluator/activity',  icon: Activity },
  { label: 'Settings',   href: '/evaluator/settings',  icon: Settings },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Users',     href: '/admin/users',       icon: Users },
  { label: 'Analytics', href: '/admin/analytics',   icon: Activity },
  { label: 'Settings',  href: '/admin/settings',    icon: Settings },
];

function getNavItems(role: string): NavItem[] {
  const n = role?.replace('ROLE_', '');
  if (n === 'STARTUP')   return startupNav;
  if (n === 'INVESTOR')  return investorNav;
  if (n === 'EVALUATOR') return evaluatorNav;
  if (n === 'ADMIN')     return adminNav;
  return [];
}

function getRoleLabel(role: string) {
  const n = role?.replace('ROLE_', '');
  const map: Record<string, string> = {
    STARTUP: 'Startup', INVESTOR: 'Investor',
    EVALUATOR: 'Evaluator', ADMIN: 'Administrator',
  };
  return map[n] ?? n;
}

function getRoleBadgeColor(role: string) {
  const n = role?.replace('ROLE_', '');
  if (n === 'STARTUP')   return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (n === 'INVESTOR')  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (n === 'EVALUATOR') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  if (n === 'ADMIN')     return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

function InitialsAvatar({ name }: { name?: string }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  return (
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 ring-2 ring-white/10">
      {initials}
    </div>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const pathname = usePathname();
  const navItems = getNavItems(user?.role ?? '');

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const Logo = () => (
    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M3 17l4-8 4 4 3-6 4 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="6" r="2" fill="white" opacity="0.7"/>
      </svg>
    </div>
  );

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
      {!collapsed && (
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Navigation
        </p>
      )}
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative',
              active
                ? 'nav-active font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
              collapsed && 'justify-center px-2',
            )}
          >
            <Icon className={cn(
              'h-4 w-4 flex-shrink-0',
              active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]',
            )} />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto h-5 min-w-[20px] px-1.5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--bg-border)] text-xs text-[var(--text-primary)] whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const BottomSection = ({ showLabels }: { showLabels: boolean }) => (
    <div className={cn(
      'border-t border-[var(--bg-border)] p-2 flex-shrink-0',
      showLabels ? 'space-y-1' : 'flex flex-col items-center gap-1',
    )}>
      <button
        onClick={toggle}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium w-full transition-colors',
          'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
          !showLabels && 'justify-center px-2',
        )}
      >
        {isDark
          ? <Sun className="h-4 w-4 flex-shrink-0 text-amber-400" />
          : <Moon className="h-4 w-4 flex-shrink-0 text-blue-400" />
        }
        {showLabels && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
      </button>

      <div className={cn(
        'flex items-center gap-2.5 rounded-lg px-2 py-2 group',
        showLabels && 'hover:bg-[var(--bg-hover)]',
        !showLabels && 'justify-center',
      )}>
        <InitialsAvatar name={user?.fullName} />
        {showLabels && (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate leading-tight">
                {user?.fullName ?? 'User'}
              </p>
              <span className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
                getRoleBadgeColor(user?.role ?? ''),
              )}>
                {getRoleLabel(user?.role ?? '')}
              </span>
            </div>
            <button
              onClick={() => logout?.()}
              className="flex-shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        className="hidden md:flex flex-col h-full border-r bg-[var(--bg-sidebar)] border-[var(--bg-border)] overflow-hidden flex-shrink-0"
        animate={{ width: collapsed ? 68 : 248 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo row */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-[var(--bg-border)] flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}>
          {collapsed ? (
            <button onClick={() => setCollapsed(false)}>
              <Logo />
            </button>
          ) : (
            <>
              <Link href="/" className="flex items-center gap-2.5 min-w-0">
                <Logo />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[var(--text-primary)] font-display leading-none truncate">
                    RG Partners
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-none">
                    Investment Readiness
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="h-6 w-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex-shrink-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        <NavItems />
        <BottomSection showLabels={!collapsed} />
      </motion.aside>

      {/* ── Mobile hamburger button ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 h-9 w-9 rounded-lg bg-[var(--bg-card)] border border-[var(--bg-border)] flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <svg className="h-4 w-4 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full z-50 md:hidden w-[248px] flex flex-col border-r bg-[var(--bg-sidebar)] border-[var(--bg-border)]"
              initial={{ x: -248 }} animate={{ x: 0 }} exit={{ x: -248 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--bg-border)] flex-shrink-0">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <Logo />
                  <div>
                    <p className="text-[13px] font-bold text-[var(--text-primary)] font-display leading-none">RG Partners</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-none">Investment Readiness</p>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavItems onNavigate={() => setMobileOpen(false)} />
              <BottomSection showLabels={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}