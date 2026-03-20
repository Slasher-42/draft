'use client';

import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Globe, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INDUSTRY_LABELS } from '@/types/common';
import { formatCurrency } from '@/lib/utils';
import type { StartupProfile } from '@/types/startup';

interface StartupDetailViewProps {
  profile: StartupProfile;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

export function StartupDetailView({
  profile,
  onApprove,
  onReject,
  isLoading,
}: StartupDetailViewProps) {
  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-brand-400" />
            </div>

            <div>
              <CardTitle className="text-2xl">{profile.companyName}</CardTitle>

              <div className="flex items-center gap-2 mt-1">
                <Badge variant="startup">
                  {INDUSTRY_LABELS[profile.industry]}
                </Badge>
                <Badge variant="warning">Pending Review</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {profile.description && (
            <p className="text-surface-muted text-sm font-body leading-relaxed">
              {profile.description}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.foundedYear && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Founded</p>
                  <p className="text-white font-medium">{profile.foundedYear}</p>
                </div>
              </div>
            )}

            {profile.teamSize && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Team Size</p>
                  <p className="text-white font-medium">{profile.teamSize}</p>
                </div>
              </div>
            )}

            {(profile.city || profile.country) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Location</p>
                  <p className="text-white font-medium">
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Website</p>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors"
                  >
                    Visit Site
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
            <DollarSign className="h-5 w-5 text-gold-400" />
            <div>
              <p className="text-surface-muted text-xs">Funding Needed</p>
              <p className="text-gold-400 text-xl font-bold font-display">
                {formatCurrency(profile.fundingNeeded)}
              </p>
            </div>
          </div>

          {(onApprove || onReject) && (
            <div className="flex gap-3 pt-2">
              {onReject && (
                <Button
                  variant="danger"
                  size="lg"
                  className="flex-1"
                  onClick={onReject}
                  disabled={isLoading}
                >
                  Reject
                </Button>
              )}

              {onApprove && (
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={onApprove}
                  loading={isLoading}
                >
                  Approve
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
