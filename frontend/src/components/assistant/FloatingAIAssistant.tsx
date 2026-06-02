"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Loader2, RefreshCw, ChevronDown, Sparkles, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getWelcomeMessage } from "@/services/assistantContextService";

const AI_SERVICE_URL = "https://ai-assessment-service.onrender.com";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ── Aria avatar ──────────────────────────────────────────────────────────── */
function AriaAvatar({ pulsing }: { pulsing: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 50%,#5B21B6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: pulsing
            ? "0 0 0 3px rgba(139,92,246,0.3), 0 0 14px rgba(109,40,217,0.25)"
            : "0 2px 8px rgba(109,40,217,0.35)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <Bot size={16} color="#fff" />
      </div>
      {pulsing && (
        <span style={{
          position: "absolute", inset: -3, borderRadius: "50%",
          border: "2px solid rgba(139,92,246,0.45)",
          animation: "ariaPing 1.2s ease-in-out infinite",
        }} />
      )}
      <style>{`@keyframes ariaPing{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0;transform:scale(1.5)}}`}</style>
    </div>
  );
}

/* ── Typing dots ──────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#8B5CF6", display: "block",
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes typingBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

/* ── Message bubble ───────────────────────────────────────────────────────── */
function MessageBubble({ msg, isLatestAssistant, isStreaming }: {
  msg: Message; isLatestAssistant: boolean; isStreaming: boolean;
}) {
  const isUser = msg.role === "user";
  const showTyping = isLatestAssistant && isStreaming && msg.content === "";

  return (
    <div style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      gap: 8, alignItems: "flex-end", marginBottom: 12,
    }}>
      {!isUser && <AriaAvatar pulsing={isLatestAssistant && isStreaming} />}

      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          padding: "10px 13px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%)"
            : "var(--color-neutral-100)",
          color: isUser ? "#fff" : "var(--color-foreground)",
          fontSize: 13.5, lineHeight: 1.55,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          boxShadow: isUser ? "0 2px 10px rgba(109,40,217,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
        }}>
          {showTyping ? <TypingDots /> : msg.content || <TypingDots />}
        </div>
        <span style={{ fontSize: 10.5, color: "var(--color-neutral-400)", marginTop: 3, paddingInline: 4 }}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "linear-gradient(135deg,#0B4A8B,#2F72A5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {msg.content.charAt(0).toUpperCase() || "U"}
        </div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export function FloatingAIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [unread, setUnread]       = useState(false);

  const historyRef    = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef      = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const initConversation = useCallback(() => {
    if (!user) return;
    setMessages([]);
    historyRef.current = [];
    const welcome = getWelcomeMessage(user);
    setMessages([{ role: "assistant", content: welcome, timestamp: new Date() }]);
  }, [user]);

  const handleOpen = useCallback(() => {
    setIsOpen(true); setUnread(false);
    if (messages.length === 0) initConversation();
  }, [messages.length, initConversation]);

  const handleClose = useCallback(() => {
    abortRef.current?.abort(); setIsOpen(false);
  }, []);

  const handleNewConversation = useCallback(() => {
    abortRef.current?.abort(); initConversation();
  }, [initConversation]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    setInput("");
    textareaRef.current && (textareaRef.current.style.height = "auto");

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    const assistantPlaceholder: Message = { role: "assistant", content: "", timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);

    const historySnapshot = [...historyRef.current];
    setIsStreaming(true);
    abortRef.current = new AbortController();

    let fullText = "";
    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        signal: abortRef.current.signal,
        body: JSON.stringify({ message: text, conversation_history: historySnapshot }),
      });
      if (!res.ok) throw new Error("Request failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText };
          return updated;
        });
      }

      historyRef.current = [
        ...historySnapshot,
        { role: "user", content: text },
        { role: "assistant", content: fullText },
      ];
      if (!isOpen) setUnread(true);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: "Sorry, something went wrong. Please try again." };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  if (!user) return null;

  const roleBadgeColor: Record<string, string> = {
    STARTUP: "#10b981", INVESTOR: "#f59e0b", ADMIN: "#ef4444", EVALUATOR: "#3b82f6",
  };

  const lastAssistantIdx = messages.map((m) => m.role).lastIndexOf("assistant");

  return (
    <>
      {/* ── Premium circular FAB ──────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="fab-wrapper"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9998, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            {/* Circular button */}
            <motion.button
              onClick={handleOpen}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "linear-gradient(135deg,#A78BFA 0%,#8B5CF6 40%,#6D28D9 100%)",
                border: "2px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
                boxShadow: "0 6px 24px rgba(109,40,217,0.45), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.25)",
                animation: "fabPulse 2.5s ease-in-out infinite",
                position: "relative",
              }}
              title="Open AI Assistant"
            >
              <Sparkles size={22} />
              {unread && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: "#ef4444", border: "2.5px solid #fff",
                }} />
              )}
            </motion.button>

            {/* Label pill */}
            <div style={{
              background: "linear-gradient(135deg,rgba(139,92,246,0.18),rgba(109,40,217,0.12))",
              border: "1px solid rgba(139,92,246,0.3)",
              backdropFilter: "blur(8px)",
              borderRadius: 20, padding: "3px 10px",
              fontSize: 10.5, fontWeight: 700, color: "#8B5CF6",
              letterSpacing: "0.04em", whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(109,40,217,0.15)",
            }}>
              AI Assistant
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sliding panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(2px)" }}
            />

            <motion.div
              key="panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9999,
                width: "min(400px, 100vw)",
                background: "var(--color-neutral-50)",
                display: "flex", flexDirection: "column",
                boxShadow: "-4px 0 40px rgba(0,0,0,0.15)",
                borderLeft: "1px solid var(--color-border)",
              }}
            >
              {/* Header */}
              <div style={{
                padding: "14px 16px",
                background: "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 50%,#5B21B6 100%)",
                display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}>
                  <Sparkles size={18} color="#fff" />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>Aria</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>AI Assistant · Annick AI</span>
                    {user.role && (
                      <span style={{
                        padding: "1px 7px", borderRadius: 20,
                        background: roleBadgeColor[user.role] ?? "#8B5CF6",
                        color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                      }}>
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNewConversation}
                  title="Start new conversation"
                  style={{
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8, padding: "5px 8px", color: "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600,
                  }}
                >
                  <RefreshCw size={12} /> New
                </button>

                <button
                  onClick={handleClose}
                  style={{
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8, padding: 7, color: "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center",
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Messages area */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "16px 14px 8px",
                display: "flex", flexDirection: "column",
                background: "var(--color-neutral-50)",
              }}>
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={idx} msg={msg}
                    isLatestAssistant={idx === lastAssistantIdx}
                    isStreaming={isStreaming}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll hint */}
              <div style={{ position: "relative", height: 0, overflow: "visible" }}>
                <button
                  onClick={scrollToBottom}
                  style={{
                    position: "absolute", bottom: 4, right: 12,
                    background: "var(--color-neutral-200)", border: "none", borderRadius: "50%",
                    width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--color-neutral-500)", opacity: 0.7,
                  }}
                  title="Scroll to bottom"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Input */}
              <div style={{
                padding: "10px 12px 14px",
                borderTop: "1px solid var(--color-border)",
                background: "var(--color-neutral-50)",
                flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "flex-end", gap: 8,
                  background: "var(--color-neutral-100)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 14, padding: "8px 10px 8px 14px",
                  transition: "border-color 0.2s",
                }}>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); autoResizeTextarea(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
                    rows={1}
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      resize: "none", fontSize: 13.5, lineHeight: 1.5,
                      color: "var(--color-foreground)",
                      maxHeight: 120, overflowY: "auto", fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isStreaming}
                    style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: !input.trim() || isStreaming
                        ? "var(--color-neutral-200)"
                        : "linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%)",
                      border: "none",
                      cursor: !input.trim() || isStreaming ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: !input.trim() || isStreaming ? "var(--color-neutral-400)" : "#fff",
                      flexShrink: 0, transition: "all 0.2s",
                      boxShadow: !input.trim() || isStreaming ? "none" : "0 2px 8px rgba(109,40,217,0.35)",
                    }}
                  >
                    {isStreaming ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={15} />}
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                  </button>
                </div>
                <p style={{ fontSize: 10.5, color: "var(--color-neutral-400)", textAlign: "center", marginTop: 7 }}>
                  Aria · Annick AI powered by RG Partners
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
