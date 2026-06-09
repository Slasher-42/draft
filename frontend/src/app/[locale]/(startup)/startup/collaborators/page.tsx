"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import {
  Loader2, MapPin, Building2, TrendingUp, Star, Sparkles,
  Users, DollarSign, ChevronDown, ChevronUp, Calendar,
} from "lucide-react";

export default function StartupCollaboratorsPage() {
  const { user } = useAuth();
  const t = useTranslations("startup.collaborators");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["startup-collaborators", user?.id],
    queryFn: async () => {
      const res = await matchingService.getMatchesForStartup(Number(user!.id));
      const rawMatches: any[] = res.data.data ?? [];

      const uniqueInvestorIds = [...new Set(rawMatches.map((m) => m.investorUserId))];
      const profileMap: Record<number, any> = {};
      await Promise.allSettled(
        uniqueInvestorIds.map(async (investorId) => {
          try {
            const u = await userService.getById(investorId);
            let ip = null;
            try { ip = await userService.getInvestorProfile(investorId); } catch {}
            profileMap[investorId] = { ...u, investorProfile: ip };
          } catch {}
        })
      );
      return { matches: rawMatches, profiles: profileMap };
    },
    enabled: !!user?.id,
  });

  const matches  = data?.matches  ?? [];
  const profiles = data?.profiles ?? {};

  const collaborators = useMemo(() => {
    const map: Record<number, any[]> = {};
    matches.forEach((m: any) => {
      if (!map[m.investorUserId]) map[m.investorUserId] = [];
      map[m.investorUserId].push(m);
    });
    return Object.entries(map).map(([id, list]) => ({
      investorUserId: Number(id),
      matches: list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)),
      bestScore: Math.max(...list.map((m) => m.matchScore ?? 0)),
    }));
  }, [matches]);

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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
              {t("title")}
            </h2>
            {collaborators.length > 0 && (
              <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                {collaborators.length !== 1
                  ? t("investorCountPlural", { count: collaborators.length })
                  : t("investorCount", { count: collaborators.length })}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-neutral-500)] ml-12">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {collaborators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-20 w-20 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
            <Users className="h-9 w-9 text-[var(--color-primary-300)]" />
          </div>
          <p className="text-lg font-semibold text-[var(--color-primary-800)]">{t("noCollaborators")}</p>
          <p className="text-sm text-[var(--color-neutral-400)] text-center max-w-xs">
            {t("noCollaboratorsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborators.map(({ investorUserId, matches: investorMatches, bestScore }) => {
            const profile  = profiles[investorUserId];
            const ip       = profile?.investorProfile;
            const initials = profile?.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "I";
            const isOpen   = expanded.has(investorUserId);
            const hasMany  = investorMatches.length > 1;

            return (
              <div
                key={investorUserId}
                className="group relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="h-24 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-400 relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                      backgroundSize: "30px 30px",
                    }}
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                    <span className="text-xs font-bold text-white">{bestScore.toFixed(0)}</span>
                  </div>
                  {hasMany && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <span className="text-[10px] font-bold text-white">{investorMatches.length} matches</span>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 flex flex-col flex-1">
                  <div className="-mt-8 mb-4 flex items-end justify-between">
                    <div className="relative">
                      {profile?.profilePictureUrl ? (
                        <img
                          src={profile.profilePictureUrl}
                          alt={profile.fullName}
                          className="h-16 w-16 rounded-2xl object-cover border-4 border-[var(--color-card)] shadow-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-emerald-800 border-4 border-[var(--color-card)] shadow-lg flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{initials}</span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-[var(--color-card)]" />
                    </div>
                    <div className="mb-1 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">{t("investorBadge")}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-[var(--color-primary-800)] text-base leading-tight mb-0.5">
                    {profile?.fullName ?? "Investor"}
                  </h3>

                  {ip?.organizationName && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">{ip.organizationName}</span>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {ip?.preferredIndustry && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-neutral-400)]">{t("focusLabel")}</span>
                        <span className="text-xs font-medium text-[var(--color-foreground)] bg-[var(--color-neutral-100)] px-2 py-0.5 rounded-full">
                          {ip.preferredIndustry}
                        </span>
                      </div>
                    )}
                    {ip?.investmentBudget && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-neutral-400)]">{t("budgetLabel")}</span>
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
                        <span className="text-xs text-[var(--color-neutral-400)]">{t("locationLabel")}</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[var(--color-neutral-400)]" />
                          <span className="text-xs font-medium text-[var(--color-foreground)]">
                            {[ip.city, ip.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>
                    )}
                    {profile?.phoneNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-neutral-400)]">{t("phoneLabel")}</span>
                        <span className="text-xs font-medium text-[var(--color-foreground)]">{profile.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[var(--color-neutral-500)] uppercase tracking-wider">
                        {t("matchedExecutions")}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {investorMatches.length}×
                      </span>
                    </div>

                    <MatchRow match={investorMatches[0]} accentColor="emerald" />

                    {hasMany && (
                      <>
                        {isOpen && investorMatches.slice(1).map((m: any) => (
                          <MatchRow key={m.id} match={m} accentColor="emerald" />
                        ))}
                        <button
                          onClick={() => toggleExpand(investorUserId)}
                          className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-1 rounded-lg hover:bg-emerald-50"
                        >
                          {isOpen ? (
                            <><ChevronUp className="h-3 w-3" /> {t("hide")}</>
                          ) : (
                            <><ChevronDown className="h-3 w-3" />
                              {investorMatches.length - 1 !== 1
                                ? t("moreMatchesPlural", { count: investorMatches.length - 1 })
                                : t("moreMatches", { count: investorMatches.length - 1 })}
                            </>
                          )}
                        </button>
                      </>
                    )}
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

function MatchRow({ match, accentColor }: { match: any; accentColor: "emerald" | "blue" }) {
  const isEmerald = accentColor === "emerald";
  return (
    <div className="mb-2 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-neutral-50)]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-[var(--color-neutral-400)]" />
          <span className="text-[10px] text-[var(--color-neutral-400)]">
            {new Date(match.matchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1 w-12 bg-[var(--color-neutral-200)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isEmerald ? "bg-gradient-to-r from-emerald-600 to-emerald-400" : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-400)]"}`}
              style={{ width: `${match.matchScore}%` }}
            />
          </div>
          <span className={`text-[10px] font-bold ${isEmerald ? "text-emerald-600" : "text-[var(--color-primary)]"}`}>
            {match.matchScore?.toFixed(0)}%
          </span>
        </div>
      </div>
      {match.matchReason && (
        <p className="text-[10px] text-[var(--color-neutral-500)] leading-relaxed line-clamp-2">
          {match.matchReason}
        </p>
      )}
    </div>
  );
}
