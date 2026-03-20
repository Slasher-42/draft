'use client';
import { motion } from 'framer-motion';
import { Building2, DollarSign, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INDUSTRY_LABELS } from '@/types/common';
import { formatCurrency } from '@/lib/utils';
import type { StartupProfile } from '@/types/startup';
import Link from 'next/link';

interface StartupReviewCardProps {
  profile: StartupProfile;
  delay?: number;
}

export function StartupReviewCard({ profile, delay = 0 }: StartupReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:border-brand-500/30 transition-colors duration-200">
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
            <Badge variant="warning">Pending Review</Badge>
          </div>

          {profile.description && (
            <p className="text-surface-muted text-sm font-body line-clamp-2 leading-relaxed">
              {profile.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-surface-muted">
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-400" />
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-gold-400 font-semibold">
              <DollarSign className="h-3.5 w-3.5" />
              {formatCurrency(profile.fundingNeeded)}
            </div>
          </div>

          <Link href={`/evaluator/startups/${profile.id}`}>
            <Button variant="outline" size="sm" className="w-full mt-1">
              Review Startup
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}