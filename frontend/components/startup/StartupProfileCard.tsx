'use client';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Globe, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INDUSTRY_LABELS } from '@/types/common';
import { formatCurrency } from '@/lib/utils';
import type { StartupProfile } from '@/types/startup';
import Link from 'next/link';

interface StartupProfileCardProps {
  profile: StartupProfile;
  showEditButton?: boolean;
}

export function StartupProfileCard({ profile, showEditButton = true }: StartupProfileCardProps) {
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
              <div className="h-14 w-14 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-brand-400" />
              </div>
              <div>
                <CardTitle>{profile.companyName}</CardTitle>
                <Badge variant="startup" className="mt-1">
                  {INDUSTRY_LABELS[profile.industry]}
                </Badge>
              </div>
            </div>
            {showEditButton && (
              <Link href="/startup/profile/edit">
                <Button variant="outline" size="sm">Edit Profile</Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {profile.description && (
            <p className="text-surface-muted text-sm font-body leading-relaxed">
              {profile.description}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.foundedYear && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Founded</p>
                  <p className="text-white font-medium">{profile.foundedYear}</p>
                </div>
              </div>
            )}
            {profile.teamSize && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Team Size</p>
                  <p className="text-white font-medium">{profile.teamSize} members</p>
                </div>
              </div>
            )}
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
            {profile.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-brand-400 shrink-0" />
                <div>
                  <p className="text-surface-muted text-xs">Website</p>
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    Visit Site
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gold-400 shrink-0" />
              <div>
                <p className="text-surface-muted text-xs">Funding Needed</p>
                <p className="text-gold-400 font-semibold">
                  {formatCurrency(profile.fundingNeeded)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}