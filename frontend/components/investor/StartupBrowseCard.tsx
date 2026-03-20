'use client';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INDUSTRY_LABELS } from '@/types/common';
import { formatCurrency } from '@/lib/utils';
import type { StartupProfile } from '@/types/startup';

interface StartupBrowseCardProps {
  profile: StartupProfile;
  delay?: number;
}

export function StartupBrowseCard({ profile, delay = 0 }: StartupBrowseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:border-gold-500/30 transition-colors duration-200">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold font-display truncate">
                {profile.companyName}
              </h3>
              <Badge variant="startup" className="mt-0.5">
                {INDUSTRY_LABELS[profile.industry]}
              </Badge>
            </div>
          </div>

          {profile.description && (
            <p className="text-surface-muted text-sm font-body line-clamp-2 leading-relaxed">
              {profile.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {profile.foundedYear && (
              <div className="flex items-center gap-1.5 text-xs text-surface-muted">
                <Calendar className="h-3.5 w-3.5 text-brand-400" />
                Founded {profile.foundedYear}
              </div>
            )}
            {profile.teamSize && (
              <div className="flex items-center gap-1.5 text-xs text-surface-muted">
                <Users className="h-3.5 w-3.5 text-brand-400" />
                {profile.teamSize} members
              </div>
            )}
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1.5 text-xs text-surface-muted">
                <MapPin className="h-3.5 w-3.5 text-brand-400" />
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gold-400 font-semibold">
              <DollarSign className="h-3.5 w-3.5" />
              {formatCurrency(profile.fundingNeeded)}
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-1">
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}