"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Loader2, RefreshCw, MessageSquareMore, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getWelcomeMessage } from "@/services/assistantContextService";

const AI_SERVICE_URL = "https://ai-assessment-service.onrender.com";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function AriaAvatar({ pulsing }: { pulsing: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c6af7 0%, #5b4de0 50%, #3d32b8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
          boxShadow: pulsing
            ? "0 0 0 3px rgba(124,106,247,0.3), 0 0 14px rgba(124,106,247,0.2)"
            : "0 2px 8px rgba(124,106,247,0.35)",
          transition: "box-shadow 0.3s ease",
          fontFamily: "sans-serif",
        }}
      >
        A
      </div>
      {pulsing && (
        <span
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            border: "2px solid rgba(124,106,247,0.5)",
            animation: "ariaPing 1.2s ease-in-out infinite",
          }}
        />
      )}
      <style>{`@keyframes ariaPing { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0;transform:scale(1.5)} }`}</style>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#7c6af7",
            display: "block",
            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

function MessageBubble({ msg, isLatestAssistant, isStreaming }: {
  msg: Message;
  isLatestAssistant: boolean;
  isStreaming: boolean;
}) {
  const isUser = msg.role === "user";
  const showTyping = isLatestAssistant && isStreaming && msg.content === "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 8,
        alignItems: "flex-end",
        marginBottom: 12,
      }}
    >
      {!isUser && <AriaAvatar pulsing={isLatestAssistant && isStreaming} />}

      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div
          style={{
            padding: "10px 13px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isUser
              ? "linear-gradient(135deg, #7c6af7 0%, #5b4de0 100%)"
              : "var(--color-neutral-100, #f1f0f5)",
            color: isUser ? "#fff" : "var(--color-neutral-800, #1a1a2e)",
            fontSize: 13.5,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            boxShadow: isUser
              ? "0 2px 10px rgba(124,106,247,0.25)"
              : "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {showTyping ? <TypingDots /> : msg.content || <TypingDots />}
        </div>
        <span style={{ fontSize: 10.5, color: "var(--color-neutral-400, #9090a8)", marginTop: 3, paddingInline: 4 }}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {isUser && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--color-neutral-200, #e8e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-neutral-600, #555)",
            flexShrink: 0,
          }}
        >
          {msg.content.charAt(0).toUpperCase() || "U"}
        </div>
      )}
    </div>
  );
}

export function FloatingAIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [unread, setUnread] = useState(false);

  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const initConversation = useCallback(() => {
    if (!user) return;
    setMessages([]);
    historyRef.current = [];
    const welcome = getWelcomeMessage(user);
    setMessages([{ role: "assistant", content: welcome, timestamp: new Date() }]);
  }, [user]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnread(false);
    if (messages.length === 0) initConversation();
  }, [messages.length, initConversation]);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    setIsOpen(false);
  }, []);

  const handleNewConversation = useCallback(() => {
    abortRef.current?.abort();
    initConversation();
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: text,
          conversation_history: historySnapshot,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
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
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, false, isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  if (!user) return null;

  const roleBadgeColor: Record<string, string> = {
    STARTUP: "#10b981",
    INVESTOR: "#f59e0b",
    ADMIN: "#ef4444",
    EVALUATOR: "#3b82f6",
  };

  const lastAssistantIdx = messages.map((m) => m.role).lastIndexOf("assistant");

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={handleOpen}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 9998,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c6af7 0%, #5b4de0 100%)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(124,106,247,0.45), 0 2px 8px rgba(0,0,0,0.15)",
              color: "#fff",
            }}
            title="Open Aria AI Assistant"
          >
            <MessageSquareMore size={22} />
            {unread && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #fff",
                }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sliding panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                background: "rgba(0,0,0,0.15)",
                backdropFilter: "blur(1px)",
              }}
            />

            <motion.div
              key="panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                width: "min(400px, 100vw)",
                background: "var(--color-neutral-50, #fafafa)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "-4px 0 30px rgba(0,0,0,0.12)",
                borderLeft: "1px solid var(--color-neutral-200, #e5e5e9)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #7c6af7 0%, #5b4de0 100%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.35)",
                  }}
                >
                  A
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Aria</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: false ? "#fbbf24" : "#34d399",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11.5 }}>
                      {false ? "Loading your data..." : "AI Assistant · Annick AI"}
                    </span>
                    {user.role && (
                      <span
                        style={{
                          padding: "1px 7px",
                          borderRadius: 20,
                          background: roleBadgeColor[user.role] ?? "#7c6af7",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.3,
                        }}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleNewConversation}
                  title="Start new conversation"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8,
                    padding: "5px 8px",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11.5,
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={12} />
                  New
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8,
                    padding: 7,
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Messages area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 14px 8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {false && messages.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      color: "var(--color-neutral-500, #6b6b80)",
                    }}
                  >
                    <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                    <p style={{ fontSize: 13.5, textAlign: "center", maxWidth: 200 }}>
                      Fetching your latest data from the platform…
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <MessageBubble
                      key={idx}
                      msg={msg}
                      isLatestAssistant={idx === lastAssistantIdx}
                      isStreaming={isStreaming}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll-to-bottom hint */}
              <div style={{ position: "relative", height: 0, overflow: "visible" }}>
                <button
                  onClick={scrollToBottom}
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 12,
                    background: "var(--color-neutral-200, #e5e5e9)",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--color-neutral-500, #6b6b80)",
                    opacity: 0.7,
                  }}
                  title="Scroll to bottom"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Input area */}
              <div
                style={{
                  padding: "10px 12px 14px",
                  borderTop: "1px solid var(--color-neutral-200, #e5e5e9)",
                  background: "var(--color-neutral-50, #fafafa)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    background: "var(--color-neutral-100, #f1f0f5)",
                    border: "1px solid var(--color-neutral-200, #e5e5e9)",
                    borderRadius: 14,
                    padding: "8px 10px 8px 14px",
                    transition: "border-color 0.2s",
                  }}
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      autoResizeTextarea();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      false
                        ? "Loading context, please wait…"
                        : "Ask anything… (Enter to send, Shift+Enter for newline)"
                    }
                    disabled={false}
                    rows={1}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: "var(--color-neutral-800, #1a1a2e)",
                      maxHeight: 120,
                      overflowY: "auto",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isStreaming || false}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background:
                        !input.trim() || isStreaming || false
                          ? "var(--color-neutral-200, #e5e5e9)"
                          : "linear-gradient(135deg, #7c6af7 0%, #5b4de0 100%)",
                      border: "none",
                      cursor:
                        !input.trim() || isStreaming || false
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color:
                        !input.trim() || isStreaming || false
                          ? "var(--color-neutral-400, #9090a8)"
                          : "#fff",
                      flexShrink: 0,
                      transition: "all 0.2s",
                      boxShadow:
                        !input.trim() || isStreaming || false
                          ? "none"
                          : "0 2px 8px rgba(124,106,247,0.35)",
                    }}
                  >
                    {isStreaming ? (
                      <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <Send size={15} />
                    )}
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 10.5,
                    color: "var(--color-neutral-400, #9090a8)",
                    textAlign: "center",
                    marginTop: 7,
                  }}
                >
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
