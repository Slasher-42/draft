"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { matchingService } from "@/services/matchingService";
import { userService } from "@/services/userService";
import { messageService } from "@/services/messageService";
import { Message } from "@/types/message";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  Send, Loader2, MessageSquare, Search, CheckCheck, Clock,
} from "lucide-react";

interface Collaborator {
  userId: number;
  fullName: string;
  profilePictureUrl?: string;
  role: string;
  organization?: string;
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (src) return (
    <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  );
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
      style={{
        width: size, height: size, fontSize: size / 3,
        background: "linear-gradient(135deg,#059669,#10B981)",
      }}>
      {initials}
    </div>
  );
}

export default function StartupMessagesPage() {
  const { user } = useAuth();
  const t = useTranslations("startup.messages");
  const [selected, setSelected] = useState<Collaborator | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompRef = useRef<Client | null>(null);

  const { data: collaborators = [], isLoading } = useQuery<Collaborator[]>({
    queryKey: ["startup-message-contacts", user?.id],
    queryFn: async () => {
      const res = await matchingService.getMatchesForStartup(Number(user!.id));
      const matches: any[] = res.data?.data ?? [];
      const seen = new Set<number>();
      const list: Collaborator[] = [];
      await Promise.allSettled(
        matches.map(async (m) => {
          if (seen.has(m.investorUserId)) return;
          seen.add(m.investorUserId);
          try {
            const u = await userService.getById(m.investorUserId);
            let ip = null;
            try { ip = await userService.getInvestorProfile(m.investorUserId); } catch {}
            const name = ip?.organizationName ?? u?.fullName ?? `Investor #${m.investorUserId}`;
            list.push({
              userId: m.investorUserId,
              fullName: name,
              profilePictureUrl: u?.profilePictureUrl,
              role: "Investor",
              organization: ip?.organizationName,
            });
          } catch {}
        })
      );
      return list;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("token");
    const client = new Client({
      webSocketFactory: () => new (SockJS as any)("https://followup-service-c1jp.onrender.com/ws/chat"),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        client.subscribe(`/topic/user-${user.id}`, (frame) => {
          try {
            const msg: Message = JSON.parse(frame.body);
            setMessages((prev) => {
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          } catch {}
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompRef.current = client;
    return () => { client.deactivate(); };
  }, [user?.id]);

  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    messageService.getConversation(selected.userId)
      .then((res) => setMessages((res.data as any)?.data ?? []))
      .catch(() => {});
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const res = await messageService.sendMessage(selected.userId, text);
      const saved: Message = (res.data as any)?.data ?? res.data;
      setMessages((prev) => {
        if (prev.find((m) => m.id === saved.id)) return prev;
        return [...prev, saved];
      });
    } catch {
    } finally {
      setSending(false);
    }
  }, [input, selected, sending]);

  const filtered = collaborators.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase())
  );
  const myId = Number(user?.id);

  return (
    <div className="flex h-[calc(100vh-130px)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">

      <div className="w-80 flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-[var(--color-primary-800)] text-base mb-3">{t("title")}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-neutral-400)] text-sm">
              {t("noInvestors")}
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.userId}
                onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-neutral-50)] ${selected?.userId === c.userId ? "bg-emerald-50 border-r-2 border-emerald-500" : ""}`}
              >
                <Avatar src={c.profilePictureUrl} name={c.fullName} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{c.fullName}</p>
                  <p className="text-xs text-[var(--color-neutral-400)] truncate">{c.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col bg-[var(--color-background)]">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-card)]">
            <Avatar src={selected.profilePictureUrl} name={selected.fullName} size={38} />
            <div>
              <p className="font-bold text-[var(--color-foreground)] text-sm">{selected.fullName}</p>
              <p className="text-xs text-[var(--color-neutral-400)]">{selected.role}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--color-neutral-400)]">
                <MessageSquare className="h-10 w-10 opacity-30" />
                <p className="text-sm">{t("startConversation", { name: selected.fullName })}</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === myId;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  {!isMine && (
                    <div className="mr-2 flex-shrink-0">
                      <Avatar src={selected.profilePictureUrl} name={selected.fullName} size={28} />
                    </div>
                  )}
                  <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={isMine ? {
                        background: "linear-gradient(135deg,#059669,#10B981)",
                        color: "#fff", borderBottomRightRadius: 4,
                        boxShadow: "0 2px 8px rgba(5,150,105,0.25)",
                      } : {
                        background: "var(--color-neutral-100)",
                        color: "var(--color-foreground)",
                        borderBottomLeftRadius: 4,
                      }}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-[var(--color-neutral-400)] mt-1 px-1 flex items-center gap-1">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isMine && (msg.read
                        ? <CheckCheck className="h-3 w-3 text-emerald-400" />
                        : <Clock className="h-3 w-3" />)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="flex items-end gap-2 bg-[var(--color-neutral-50)] border border-[var(--color-border)] rounded-2xl px-4 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={t("typePlaceholder")}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-neutral-400)] max-h-28 overflow-y-auto"
                style={{ lineHeight: 1.5 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: input.trim() ? "linear-gradient(135deg,#059669,#10B981)" : "var(--color-neutral-200)" }}
              >
                {sending
                  ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                  : <Send className="h-4 w-4" style={{ color: input.trim() ? "#fff" : "var(--color-neutral-400)" }} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--color-neutral-400)] bg-[var(--color-background)]">
          <div className="h-20 w-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)" }}>
            <MessageSquare className="h-9 w-9 text-emerald-300" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[var(--color-foreground)]">{t("selectInvestor")}</p>
            <p className="text-sm mt-1">{t("selectHint")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
