'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  variant?: 'brand' | 'gold' | 'warning' | 'success' | 'danger';
  delay?: number;
}

const variantStyles = {
  brand:   { accent: '#229163', accentEnd: '#167550', iconBg: 'rgba(34,145,99,0.1)',  iconColor: '#44b282', valueColor: '#44b282' },
  gold:    { accent: '#f59e0b', accentEnd: '#d97706', iconBg: 'rgba(245,158,11,0.1)', iconColor: '#fbbf24', valueColor: '#fbbf24' },
  warning: { accent: '#f59e0b', accentEnd: 'transparent', iconBg: 'rgba(245,158,11,0.08)', iconColor: '#f59e0b', valueColor: '#f59e0b' },
  success: { accent: '#10b981', accentEnd: '#059669', iconBg: 'rgba(16,185,129,0.1)', iconColor: '#34d399', valueColor: '#34d399' },
  danger:  { accent: '#ef4444', accentEnd: '#dc2626', iconBg: 'rgba(239,68,68,0.1)',  iconColor: '#f87171', valueColor: '#f87171' },
};

export function StatsCard({ title, value, subtitle, icon, variant = 'brand', delay = 0 }: StatsCardProps) {
  const s = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        background: '#111f35',
        border: '1px solid #1e3352',
        borderRadius: 12,
        padding: '16px 18px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${s.accent}, ${s.accentEnd})`,
      }} />

      <div style={{
        position: 'absolute', top: 16, right: 16,
        width: 36, height: 36, borderRadius: 8,
        background: s.iconBg, color: s.iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>

      <div style={{ fontSize: 11, fontWeight: 500, color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: s.valueColor, margin: '6px 0 2px', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#4a6080' }}>
        {subtitle}
      </div>
    </motion.div>
  );
}