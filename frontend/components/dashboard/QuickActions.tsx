'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface Action {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
  variant?: 'brand' | 'gold';
}

interface QuickActionsProps { actions: Action[]; }

const variantStyles = {
  brand: { iconBg: 'rgba(34,145,99,0.1)',  iconColor: '#44b282' },
  gold:  { iconBg: 'rgba(245,158,11,0.1)', iconColor: '#fbbf24' },
};

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
        Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {actions.map((action, i) => {
          const s = variantStyles[action.variant ?? 'brand'];
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                href={action.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 12,
                  border: '1px solid #1e3352', background: '#111f35',
                  textDecoration: 'none', transition: 'all .15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#229163';
                  (e.currentTarget as HTMLElement).style.background = '#0d1c30';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1e3352';
                  (e.currentTarget as HTMLElement).style.background = '#111f35';
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.iconBg, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{action.label}</div>
                  <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>{action.description}</div>
                </div>
                <ChevronRight size={14} style={{ color: '#1e3352', flexShrink: 0 }} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}