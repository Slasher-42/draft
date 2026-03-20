'use client';
import { motion } from 'framer-motion';
import { Building2, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INDUSTRY_LABELS } from '@/types/common';
import { formatCurrency } from '@/lib/utils';
import type { InvestorProfile } from '@/types/investor';
import Link from 'next/link';

interface InvestorProfileCardProps {
  profile: InvestorProfile;
  showEditButton?: boolean;
}

export function InvestorProfileCard({ profile, showEditButton = true }: InvestorProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-gold-400" />
              </div>
              <div>
                <CardTitle>{profile.organizationName}</CardTitle>
                <Badge variant="investor" className="mt-1">
                  {INDUSTRY_LABELS[profile.preferredIndustry]}
                </Badge>
              </div>
            </div>
            {showEditButton && (
              <Link href="/investor/profile/edit">
                <Button variant="outline" size="sm">Edit Profile</Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gold-400 shrink-0" />
              <div>
                <p className="text-surface-muted text-xs">Investment Budget</p>
                <p className="text-gold-400 font-semibold">
                  {formatCurrency(profile.investmentBudget)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-brand-400 shrink-0" />
              <div>
                <p className="text-surface-muted text-xs">Preferred Industry</p>
                <p className="text-white font-medium">
                  {INDUSTRY_LABELS[profile.preferredIndustry]}
                </p>
              </div>
            </div>

            {(profile.city || profile.country) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Location</p>
                  <p className="text-white font-medium">
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}