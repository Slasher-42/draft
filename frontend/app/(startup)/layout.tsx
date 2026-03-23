'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Bell, Search, Sun, Moon, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'match' | 'review' | 'system';
}

function usePageTitle() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  const labelMap: Record<string, string> = {
    startup: 'Startup', investor: 'Investor', evaluator: 'Evaluator', admin: 'Admin',
    dashboard: 'Dashboard', profile: 'Profile', execute: 'Execute',
    executions: 'Executions', settings: 'Settings', users: 'Users',
    reviews: 'Reviews', conversation: 'AI Conversation', analytics: 'Analytics',
    activity: 'Activity',
  };
  const crumbs = parts.map((p) => labelMap[p] ?? p.charAt(0).toUpperCase() + p.slice(1));
  return { title: crumbs[crumbs.length - 1] ?? 'Dashboard', crumbs };
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { isDark, toggle } = useTheme();
  const derived = usePageTitle();
  const displayTitle = title ?? derived.title;

  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'New Match Found',  body: 'Your startup matched with an investor!', time: '2m ago', read: false, type: 'match'  },
    { id: '2', title: 'Review Completed', body: 'Evaluator approved your submission.',    time: '1h ago', read: false, type: 'review' },
    { id: '3', title: 'System Update',    body: 'Assessment interval updated to 24h.',   time: '3h ago', read: true,  type: 'system' },
  ]);
  const unread = notifications.filter((n) => !n.read).length;
  const dotColor: Record<string, string> = {
    match: 'bg-blue-500', review: 'bg-emerald-500', system: 'bg-amber-500',
  };

  return (
    <header className="border-b border-[var(--bg-border)] bg-[var(--bg-card)] px-6 md:px-8 py-5 flex items-start justify-between gap-4 flex-shrink-0">

      {/* ── Left: breadcrumb + title + subtitle ── */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1 mb-2">
          {derived.crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />}
              <span className={cn(
                'text-xs',
                i === derived.crumbs.length - 1
                  ? 'text-[var(--brand)] font-semibold'
                  : 'text-[var(--text-muted)]',
              )}>
                {c}
              </span>
            </span>
          ))}
        </div>

        {/* Title — properly large */}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display leading-tight truncate">
          {displayTitle}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-[var(--text-muted)] mt-1 truncate">{subtitle}</p>
        )}
      </div>

      {/* ── Right: actions + controls ── */}
      <div className="flex items-center gap-2 flex-shrink-0 pt-1">
        {/* Page-level action buttons (e.g. "Complete Profile") */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Search */}
        <AnimatePresence>
          {showSearch ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  autoFocus
                  placeholder="Search…"
                  className="w-full h-9 pl-9 pr-8 rounded-lg text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          )}
        </AnimatePresence>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          {isDark
            ? <Sun className="h-4.5 w-4.5 text-amber-400" />
            : <Moon className="h-4.5 w-4.5 text-blue-500" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors relative"
          >
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-blue-500 text-[9px] font-bold text-white flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotif(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-40 w-80 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--bg-border)]">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
                    {unread > 0 && (
                      <span className="text-xs text-blue-400 font-medium">{unread} unread</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] cursor-pointer border-b border-[var(--bg-border)] last:border-0 transition-colors',
                          !n.read && 'bg-blue-500/5',
                        )}
                      >
                        <span className={cn('h-2 w-2 rounded-full mt-1.5 flex-shrink-0', dotColor[n.type])} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{n.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-[var(--bg-border)]">
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}