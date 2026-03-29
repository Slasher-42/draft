"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import { Loader2, MapPin, Building2, TrendingUp, Star, Sparkles, Users, DollarSign } from "lucide-react";

export default function StartupCollaboratorsPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    matchingService
      .getMatchesForStartup(Number(user.id))
      .then(async (res) => {
        const data = res.data.data ?? [];
        setMatches(data);
        const profileMap: Record<number, any> = {};
        await Promise.allSettled(
          data.map(async (m: any) => {
            try {
              const u = await userService.getById(m.investorUserId);
              const ip = await userService.getInvestorProfile(m.investorUserId);
              profileMap[m.investorUserId] = { ...u, investorProfile: ip };
            } catch {}
          })
        );
        setProfiles(profileMap);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-50)] to-transparent rounded-2xl -z-10" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
              My Collaborators
            </h2>
          </div>
          <p className="text-sm text-[var(--color-neutral-500)] ml-12">
            Investors matched to your startup
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-20 w-20 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
            <Users className="h-9 w-9 text-[var(--color-primary-300)]" />
          </div>
          <p className="text-lg font-semibold text-[var(--color-primary-800)]">
            No collaborators yet
          </p>
          <p className="text-sm text-[var(--color-neutral-400)] text-center max-w-xs">
            Once an investor matches your startup, their profile will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => {
            const profile = profiles[match.investorUserId];
            const ip = profile?.investorProfile;
            const initials = profile?.fullName
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) ?? "I";

            return (
              <div
                key={match.id}
                className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-24 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-400 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                        radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                      backgroundSize: "30px 30px",
                    }}
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                    <span className="text-xs font-bold text-white">
                      {match.matchScore?.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="-mt-8 mb-4 flex items-end justify-between">
                    <div className="relative">
                      {profile?.profilePictureUrl ? (
                        <img
                          src={profile.profilePictureUrl}
                          alt={profile.fullName}
                          className="h-16 w-16 rounded-2xl object-cover border-4 border-[var(--color-surface)] shadow-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-emerald-800 border-4 border-[var(--color-surface)] shadow-lg flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{initials}</span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-[var(--color-surface)]" />
                    </div>
                    <div className="mb-1 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">Investor</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-[var(--color-primary-800)] text-base leading-tight mb-0.5">
                    {profile?.fullName ?? "Investor"}
                  </h3>

                  {ip?.organizationName && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">
                        {ip.organizationName}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {ip?.preferredIndustry && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-neutral-400)]">Focus</span>
                        <span className="text-xs font-medium text-[var(--color-foreground)] bg-[var(--color-neutral-100)] px-2 py-0.5 rounded-full">
                          {ip.preferredIndustry}
                        </span>
                      </div>
                    )}
                    {ip?.investmentBudget && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-neutral-400)]">Budget</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-medium text-[var(--color-foreground)]">
                            ${Number(ip.investmentBudget).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                    {(ip?.country || ip?.city) && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-neutral-400)]">Location</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[var(--color-neutral-400)]" />
                          <span className="text-xs font-medium text-[var(--color-foreground)]">
                            {[ip.city, ip.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-neutral-400)] mb-1">Match reason</p>
                    <p className="text-xs text-[var(--color-neutral-500)] leading-relaxed line-clamp-2">
                      {match.matchReason}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--color-neutral-400)]">
                      {new Date(match.matchedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-16 bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                          style={{ width: `${match.matchScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-600">
                        {match.matchScore?.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}