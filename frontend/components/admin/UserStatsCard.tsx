'use client';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Building2, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { UserResponse } from '@/types/user';

interface UserStatsCardProps {
  users: UserResponse[];
}

export function UserStatsCard({ users }: UserStatsCardProps) {
  const total     = users.length;
  const startups  = users.filter((u) => u.role === 'ROLE_STARTUP').length;
  const investors = users.filter((u) => u.role === 'ROLE_INVESTOR').length;
  const evaluators = users.filter((u) => u.role === 'ROLE_EVALUATOR').length;

  const stats = [
    {
      label:   'Total Users',
      value:   total,
      icon:    <Users className="h-5 w-5" />,
      color:   'text-brand-400',
      bg:      'bg-brand-500/10 border-brand-500/20',
    },
    {
      label:   'Startups',
      value:   startups,
      icon:    <Building2 className="h-5 w-5" />,
      color:   'text-brand-300',
      bg:      'bg-brand-500/10 border-brand-500/20',
    },
    {
      label:   'Investors',
      value:   investors,
      icon:    <Briefcase className="h-5 w-5" />,
      color:   'text-gold-400',
      bg:      'bg-gold-500/10 border-gold-500/20',
    },
    {
      label:   'Evaluators',
      value:   evaluators,
      icon:    <TrendingUp className="h-5 w-5" />,
      color:   'text-blue-400',
      bg:      'bg-blue-500/10 border-blue-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-surface-muted text-xs font-body">{stat.label}</p>
                <p className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}