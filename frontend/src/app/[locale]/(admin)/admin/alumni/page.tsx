"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import { messageService } from "@/services/messageService";
import { BondStatus, Message } from "@/types/message";
import {
  Loader2, Users, MessageSquare, Sparkles, CheckCircle2,
  Clock, ChevronDown, ChevronUp, Brain, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AI_SERVICE_URL = "https://aiassessmentengine-service.onrender.com";

interface Bond {
  investorUserId: number;
  startupUserId: number;
  matchScore: number;
  investorName: string;
  startupName: string;
  investorPic?: string;
  startupPic?: string;
}

interface BondWithStatus extends Bond {
  status: BondStatus | null;
}

interface AIResult {
  bondKey: string;
  analysis: string;
  loading: boolean;
}

export default function AdminAlumniPage() {
  const t = useTranslations("admin.alumni");
  const [expandedBond, setExpandedBond] = useState<string | null>(null);
  const [bondMessages, setBondMessages] = useState<Record<string, Message[]>>({});
  const [aiResults, setAiResults] = useState<Record<string, AIResult>>({});
  const [loadingMessages, setLoadingMessages] = useState<Record<string, boolean>>({});

  const { data: bondsRaw = [], isLoading } = useQuery<BondWithStatus[]>({
    queryKey: ["admin-alumni-bonds"],
    queryFn: async () => {
      const res = await matchingService.getAllMatches();
      const matches: any[] = res.data?.data ?? [];

      // Deduplicate by (investorUserId, startupUserId) pair
      const seen = new Set<string>();
      const unique: any[] = [];
      matches.forEach((m) => {
        const key = `${m.investorUserId}-${m.startupUserId}`;
        if (!seen.has(key)) { seen.add(key); unique.push(m); }
      });

      // Fetch user info in parallel
      const allUserIds = [...new Set([
        ...unique.map((m) => m.investorUserId),
        ...unique.map((m) => m.startupUserId),
      ])];
      const userMap: Record<number, any> = {};
      await Promise.allSettled(allUserIds.map(async (uid) => {
        try {
          const u = await userService.getById(uid);
          let profile = null;
          try {
            profile = await userService.getInvestorProfile(uid);
          } catch {
            try { profile = await userService.getStartupProfile(uid); } catch {}
          }
          userMap[uid] = { ...u, profile };
        } catch {}
      }));

      // Fetch bond statuses in parallel
      const bonds: BondWithStatus[] = await Promise.all(
        unique.map(async (m) => {
          let status: BondStatus | null = null;
          try {
            const r = await messageService.getBondStatus(m.investorUserId, m.startupUserId);
            status = (r.data as any)?.data ?? null;
          } catch {}
          const inv = userMap[m.investorUserId];
          const sta = userMap[m.startupUserId];
          return {
            investorUserId: m.investorUserId,
            startupUserId: m.startupUserId,
            matchScore: m.matchScore ?? 0,
            investorName: inv?.investorProfile?.organizationName ?? inv?.fullName ?? `Investor #${m.investorUserId}`,
            startupName: sta?.startupProfile?.companyName ?? sta?.fullName ?? `Startup #${m.startupUserId}`,
            investorPic: inv?.profilePictureUrl,
            startupPic: sta?.profilePictureUrl,
            status,
          };
        })
      );
      return bonds.sort((a, b) => (b.status?.messageCount ?? 0) - (a.status?.messageCount ?? 0));
    },
    staleTime: 1000 * 60 * 2,
  });

  const activeBonds   = bondsRaw.filter((b) => b.status?.active);
  const inactiveBonds = bondsRaw.filter((b) => !b.status?.active);

  const bondKey = (b: Bond) => `${b.investorUserId}-${b.startupUserId}`;

  const toggleExpand = async (bond: BondWithStatus) => {
    const key = bondKey(bond);
    if (expandedBond === key) { setExpandedBond(null); return; }
    setExpandedBond(key);
    if (!bondMessages[key]) {
      setLoadingMessages((prev) => ({ ...prev, [key]: true }));
      try {
        const r = await messageService.getConversationForAdmin(bond.investorUserId, bond.startupUserId);
        setBondMessages((prev) => ({ ...prev, [key]: (r.data as any)?.data ?? [] }));
      } catch {
        setBondMessages((prev) => ({ ...prev, [key]: [] }));
      } finally {
        setLoadingMessages((prev) => ({ ...prev, [key]: false }));
      }
    }
  };

  const validateWithAI = async (bond: BondWithStatus) => {
    const key = bondKey(bond);
    const msgs = bondMessages[key] ?? [];
    if (msgs.length === 0) { toast.error(t("toastNoMessages")); return; }

    setAiResults((prev) => ({ ...prev, [key]: { bondKey: key, analysis: "", loading: true } }));

    const transcript = msgs
      .map((m) => `${m.senderId === bond.investorUserId ? bond.investorName : bond.startupName}: ${m.content}`)
      .join("\n");

    const prompt = `You are a business relationship analyst for an investment platform. Analyze this conversation between investor "${bond.investorName}" and startup "${bond.startupName}".

Conversation:
${transcript}

Provide a concise current situation analysis (3-5 sentences). Focus on:
- What stage the business discussion is at
- Any key asks (funding requests, terms, concerns)
- Whether the conversation is progressing positively or has issues
- Any notable business-related topics discussed

Ignore any unrelated personal messages. Respond in plain English with a clear business status summary.`;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    let analysis = "";
    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: prompt, conversation_history: [] }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        analysis += decoder.decode(value, { stream: true });
        setAiResults((prev) => ({
          ...prev,
          [key]: { bondKey: key, analysis, loading: true },
        }));
      }
    } catch {
      analysis = t("aiAnalysisFailed");
    }
    setAiResults((prev) => ({ ...prev, [key]: { bondKey: key, analysis, loading: false } }));
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t("totalBonds"), value: bondsRaw.length, bgClass: "stat-bg-blue", textClass: "stat-text-blue", icon: Users, iconBg: "linear-gradient(135deg,#1D4ED8,#3B82F6)" },
          { label: t("activeMessaging"), value: activeBonds.length, bgClass: "stat-bg-green", textClass: "stat-text-green", icon: MessageSquare, iconBg: "linear-gradient(135deg,#059669,#10B981)" },
          { label: t("inactive"), value: inactiveBonds.length, bgClass: "stat-bg-amber", textClass: "stat-text-amber", icon: Clock, iconBg: "linear-gradient(135deg,#B45309,#D97706)" },
        ].map((s) => (
          <div key={s.label} className={`${s.bgClass} rounded-2xl border p-5 flex items-center gap-4`}
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: s.iconBg }}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${s.textClass}`}>{s.value}</p>
              <p className={`text-xs font-medium opacity-75 ${s.textClass}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bond list */}
      {bondsRaw.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 text-[var(--color-neutral-300)]" />
            <p className="text-[var(--color-neutral-400)]">{t("noBonds")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bondsRaw.map((bond) => {
            const key = bondKey(bond);
            const isExpanded = expandedBond === key;
            const isActive = bond.status?.active ?? false;
            const msgs = bondMessages[key] ?? [];
            const ai = aiResults[key];

            return (
              <Card key={key} className={`border transition-all duration-200 ${isActive ? "border-emerald-200" : "border-[var(--color-border)]"}`}>
                <CardContent className="p-4">
                  {/* Bond header */}
                  <div className="flex items-center gap-4">
                    {/* Avatars */}
                    <div className="flex -space-x-2">
                      <BondAvatar name={bond.investorName} src={bond.investorPic} color="#2F72A5" />
                      <BondAvatar name={bond.startupName} src={bond.startupPic} color="#059669" />
                    </div>

                    {/* Names */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[var(--color-foreground)]">{bond.investorName}</span>
                        <span className="text-[var(--color-neutral-400)] text-xs">↔</span>
                        <span className="font-semibold text-sm text-[var(--color-foreground)]">{bond.startupName}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? "bg-emerald-100 text-emerald-700" : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"
                        }`}>
                          {isActive
                            ? <><CheckCircle2 className="h-2.5 w-2.5" /> {t("active")}</>
                            : <><Clock className="h-2.5 w-2.5" /> {t("inactiveBadge")}</>}
                        </span>
                        {isActive && (
                          <span className="text-xs text-[var(--color-neutral-400)]">
                            {t("messageCount", { count: bond.status?.messageCount ?? 0 })}
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-neutral-400)]">
                          {t("matchScore", { score: bond.matchScore.toFixed(0) })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Button
                          size="sm"
                          onClick={() => validateWithAI(bond)}
                          disabled={ai?.loading}
                          className="gap-1.5 text-xs"
                          style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }}
                        >
                          {ai?.loading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Brain className="h-3.5 w-3.5" />}
                          {t("validateWithAI")}
                        </Button>
                      )}
                      <button
                        onClick={() => toggleExpand(bond)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors text-[var(--color-neutral-400)]"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* AI Result */}
                  {ai && (
                    <div className="mt-3 p-3 rounded-xl border stat-bg-violet">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 stat-text-violet" />
                        <span className="text-xs font-bold stat-text-violet uppercase tracking-wider">{t("aiAnalysis")}</span>
                        {ai.loading && <Loader2 className="h-3 w-3 animate-spin stat-text-violet" />}
                      </div>
                      <p className="text-xs text-[var(--color-neutral-600)] leading-relaxed whitespace-pre-wrap">
                        {ai.analysis || t("analyzing")}
                      </p>
                    </div>
                  )}

                  {/* Conversation */}
                  {isExpanded && (
                    <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                      {loadingMessages[key] ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
                        </div>
                      ) : msgs.length === 0 ? (
                        <div className="flex items-center gap-2 py-4 justify-center text-[var(--color-neutral-400)] text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {t("noMessagesExchanged")}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          <p className="text-xs font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider mb-2">
                            {t("conversationCount", { count: msgs.length })}
                          </p>
                          {msgs.map((msg) => {
                            const isInvestor = msg.senderId === bond.investorUserId;
                            return (
                              <div key={msg.id} className={`flex ${isInvestor ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                                  isInvestor
                                    ? "bg-[var(--color-primary-50)] text-[var(--color-primary-800)]"
                                    : "bg-emerald-50 text-emerald-800"
                                }`}>
                                  <span className="font-semibold block mb-0.5">
                                    {isInvestor ? bond.investorName : bond.startupName}
                                  </span>
                                  {msg.content}
                                  <span className="block text-[10px] opacity-60 mt-0.5">
                                    {new Date(msg.sentAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BondAvatar({ name, src, color }: { name: string; src?: string; color: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (src) return (
    <img src={src} alt={name} className="h-9 w-9 rounded-full object-cover border-2 border-[var(--color-card)]" />
  );
  return (
    <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[var(--color-card)]"
      style={{ background: `linear-gradient(135deg,${color},${color}cc)` }}>
      {initials}
    </div>
  );
}
