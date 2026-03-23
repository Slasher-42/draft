'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useConversation } from '@/hooks/useConversation';
import { useStartupExecutionById } from '@/hooks/useStartupExecution';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import {
  Send, Mic, Download, RotateCcw, History, ThumbsUp, ThumbsDown,
  Copy, CheckCircle, ChevronDown, Maximize2, Minimize2,
  Sparkles, Clock, Info, X, BookOpen, Zap, Volume2, VolumeX,
  MessageSquare, AlertCircle, Check,
} from 'lucide-react';

/* ── Types ── */
interface Reaction { messageId: string; type: 'up' | 'down' }
interface SessionRecord {
  id: string; date: string; executionId: number;
  previewText: string; messageCount: number;
}

/* ── Voice wave bars ── */
function VoiceWave() {
  return (
    <div className="flex items-center gap-[3px] h-4">
      {[1,2,3,4,5].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-red-400 wave-bar"
          style={{ height: `${6 + i * 2}px`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-tl-sm bg-[var(--bg-card)] border border-[var(--bg-border)] w-fit">
      <div className="flex gap-1">
        {[0,1,2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-blue-400 pulse-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-[var(--text-muted)]">Aria is thinking…</span>
    </div>
  );
}

/* ── Message bubble ── */
function MessageBubble({ msg, onCopy, onReact, reaction, showTimestamp }: {
  msg: { id: string; role: 'user' | 'aria'; content: string; timestamp: Date };
  onCopy: (id: string, text: string) => void;
  onReact: (id: string, type: 'up' | 'down') => void;
  reaction?: Reaction;
  showTimestamp: boolean;
}) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(msg.id, msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={cn('flex gap-3 msg-in group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 mt-1">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div className={cn('flex flex-col gap-1 max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {showTimestamp && (
          <span className="text-[10px] text-[var(--text-muted)] px-1">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <div className="relative">
          <div className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-[var(--bg-card)] border border-[var(--bg-border)] text-[var(--text-primary)] rounded-tl-sm',
          )}>
            {msg.content}
          </div>

          {/* Hover actions */}
          <div className={cn(
            'absolute top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10',
            isUser ? 'right-full mr-2' : 'left-full ml-2',
          )}>
            <button
              onClick={handleCopy}
              className="h-6 w-6 rounded-md bg-[var(--bg-card)] border border-[var(--bg-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] shadow-sm"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
            {!isUser && (
              <>
                <button
                  onClick={() => onReact(msg.id, 'up')}
                  className={cn(
                    'h-6 w-6 rounded-md border flex items-center justify-center shadow-sm',
                    reaction?.type === 'up'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-[var(--bg-card)] border-[var(--bg-border)] text-[var(--text-muted)] hover:text-emerald-400',
                  )}
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onReact(msg.id, 'down')}
                  className={cn(
                    'h-6 w-6 rounded-md border flex items-center justify-center shadow-sm',
                    reaction?.type === 'down'
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-[var(--bg-card)] border-[var(--bg-border)] text-[var(--text-muted)] hover:text-red-400',
                  )}
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-white">
          U
        </div>
      )}
    </div>
  );
}

/* ── History panel ── */
function HistoryPanel({ sessions, onClose }: {
  sessions: SessionRecord[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="w-64 flex-shrink-0 border-r border-[var(--bg-border)] bg-[var(--bg-sidebar)] flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-border)]">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">History</span>
        </div>
        <button onClick={onClose} className="h-6 w-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <MessageSquare className="h-7 w-7 text-[var(--text-muted)] mb-2 opacity-40" />
            <p className="text-xs text-[var(--text-muted)]">No past sessions yet</p>
          </div>
        ) : sessions.map((s) => (
          <div key={s.id} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-blue-400 font-medium">{s.date}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{s.messageCount} msgs</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{s.previewText}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Progress steps ── */
function ProgressBar({ phase }: { phase: string }) {
  const steps = [
    { id: 'chatting',              label: 'Conversation' },
    { id: 'asking_considerations', label: 'Additional Input' },
    { id: 'done',                  label: 'Complete' },
  ];
  const current = Math.max(steps.findIndex((s) => s.id === phase), 0);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
              i < current ? 'bg-emerald-500 text-white' :
              i === current ? 'bg-blue-500 text-white' :
              'bg-[var(--bg-hover)] text-[var(--text-muted)]',
            )}>
              {i < current ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className={cn('text-[11px] hidden sm:block', i === current ? 'text-blue-400 font-medium' : 'text-[var(--text-muted)]')}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <div className={cn('h-px w-6 sm:w-8', i < current ? 'bg-emerald-500' : 'bg-[var(--bg-border)]')} />}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function StartupConversationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const executionId = Number(searchParams.get('executionId'));

  const { execution, loading: execLoading } = useStartupExecutionById(executionId);
  const {
    messages, phase, isLoading, updateInterval,
    considerations, setConsiderations,
    startConversation, sendMessage, finishConversation,
  } = useConversation();

  const [userInput, setUserInput]       = useState('');
  const [charCount, setCharCount]       = useState(0);
  const [showHistory, setShowHistory]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [reactions, setReactions]       = useState<Reaction[]>([]);
  const [autoScroll, setAutoScroll]     = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sessions]                      = useState<SessionRecord[]>([]);
  const [quickReplies]                  = useState([
    'Tell me more about that.',
    'Can you elaborate?',
    "I'm not sure about this.",
    'Yes, that\'s correct.',
  ]);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const chatRef     = useRef<HTMLDivElement>(null);
  const started     = useRef(false);
  const recRef      = useRef<any>(null);

  /* Auto-start */
  useEffect(() => {
    if (!execLoading && execution && user && !started.current) {
      started.current = true;
      startConversation(execution.id, user.id, 'STARTUP', {
        targetCompanySize:  execution.targetCompanySize,
        problemStatement:   execution.problemStatement,
        businessModel:      execution.businessModel,
        targetMarket:       execution.targetMarket,
        teamDetails:        execution.teamDetails,
        annualRevenue:      execution.annualRevenue,
        monthlyBurnRate:    execution.monthlyBurnRate,
        fundingNeeded:      execution.fundingNeeded,
      });
    }
  }, [execLoading, execution, user]);

  /* Auto scroll */
  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, autoScroll]);

  /* TTS */
  useEffect(() => {
    if (!isTTSEnabled) return;
    const lastAria = [...messages].reverse().find((m) => m.role === 'aria');
    if (lastAria && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(lastAria.content);
      utt.rate = 0.95;
      window.speechSynthesis.speak(utt);
    }
  }, [messages, isTTSEnabled]);

  const handleScroll = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAutoScroll(atBottom);
    setShowScrollBtn(!atBottom);
  }, []);

  /* Voice input */
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    if (isListening) { recRef.current?.stop(); setIsListening(false); return; }
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setUserInput(t);
      setCharCount(t.length);
    };
    rec.onend  = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  /* Export */
  const exportChat = () => {
    const text = messages.map((m) =>
      `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'aria' ? 'Aria' : 'You'}: ${m.content}`
    ).join('\n\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = `aria-session-${Date.now()}.txt`;
    a.click();
  };

  /* Copy all */
  const copyAll = () => {
    const text = messages.map((m) => `${m.role === 'aria' ? 'Aria' : 'You'}: ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  const handleReact = (id: string, type: 'up' | 'down') => {
    setReactions((prev) => {
      const ex = prev.find((r) => r.messageId === id);
      if (ex) return ex.type === type ? prev.filter((r) => r.messageId !== id) : prev.map((r) => r.messageId === id ? { ...r, type } : r);
      return [...prev, { messageId: id, type }];
    });
  };

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;
    const msg = userInput.trim();
    setUserInput('');
    setCharCount(0);
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ── Loading ── */
  if (execLoading || phase === 'starting') {
    return (
      <div className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-50">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full border-4 border-[var(--bg-border)] border-t-blue-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">Aria is preparing…</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Setting up your AI assessment session</p>
      </div>
    );
  }

  /* ── Error ── */
  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[var(--bg-primary)]">
        <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Connection failed</h2>
        <p className="text-sm text-[var(--text-muted)]">The AI service could not be reached.</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  /* ── Done ── */
  if (phase === 'done') {
    return (
      <div className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-50 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--bg-border)] rounded-2xl p-8 text-center shadow-2xl"
        >
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-2">Session Complete</h2>
          <p className="text-sm text-[var(--text-muted)] mb-1">Your submission has been saved.</p>
          {updateInterval && (
            <div className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Clock className="h-4 w-4 text-blue-400" />
              <p className="text-sm text-blue-300 font-medium">Update within {updateInterval}.</p>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={exportChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--bg-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] text-sm font-medium"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={() => router.push('/startup/executions')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              View Executions
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className={cn(
      'flex flex-col bg-[var(--bg-primary)]',
      isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-56px)]',
    )}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--bg-border)] bg-[var(--bg-card)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">Aria</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[10px] text-emerald-400">AI Assessment</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <ProgressBar phase={phase} />
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setShowHistory((v) => !v)} title="Session history"
            className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-colors', showHistory ? 'bg-[var(--bg-active)] text-blue-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]')}>
            <History className="h-4 w-4" />
          </button>
          <button onClick={() => setIsTTSEnabled((v) => !v)} title="Toggle voice readout"
            className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-colors', isTTSEnabled ? 'bg-[var(--bg-active)] text-blue-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]')}>
            {isTTSEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button onClick={copyAll} title="Copy transcript"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={exportChat} title="Export chat"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={() => setIsFullscreen((v) => !v)} title="Toggle fullscreen"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {showHistory && <HistoryPanel sessions={sessions} onClose={() => setShowHistory(false)} />}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Messages */}
          <div ref={chatRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Zap className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-blue-300">Session started · {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showTime = !prev || new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime() > 60000;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onCopy={(_id, text) => navigator.clipboard.writeText(text)}
                  onReact={handleReact}
                  reaction={reactions.find((r) => r.messageId === msg.id)}
                  showTimestamp={showTime}
                />
              );
            })}

            {isLoading && (
              <div className="flex gap-3 msg-in">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Scroll to bottom */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setAutoScroll(true); }}
                className="absolute bottom-36 right-5 z-10 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Considerations */}
          <AnimatePresence>
            {phase === 'asking_considerations' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="mx-4 mb-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">Additional Considerations</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Is there anything else you'd like Aria to factor into the assessment?
                </p>
                <textarea
                  value={considerations}
                  onChange={(e) => setConsiderations(e.target.value)}
                  placeholder="Optional — share any additional context…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none"
                />
                <button
                  onClick={() => finishConversation(execution?.id ?? 0, 'STARTUP')}
                  disabled={isLoading}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Finishing…
                    </span>
                  ) : (
                    <><CheckCircle className="h-3.5 w-3.5" /> Submit &amp; Finish</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          {phase === 'chatting' && (
            <div className="border-t border-[var(--bg-border)] bg-[var(--bg-card)] px-4 pt-3 pb-4 flex-shrink-0">
              {/* Quick replies */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {quickReplies.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => { setUserInput(qr); setCharCount(qr.length); inputRef.current?.focus(); }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-[var(--bg-hover)] border border-[var(--bg-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40 hover:bg-[var(--bg-active)] transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-2">
                {/* Voice */}
                <button
                  onClick={toggleVoice}
                  className={cn(
                    'h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center border transition-all',
                    isListening
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-[var(--bg-hover)] border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-blue-500/40',
                  )}
                >
                  {isListening ? <VoiceWave /> : <Mic className="h-4 w-4" />}
                </button>

                {/* Textarea */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => { setUserInput(e.target.value); setCharCount(e.target.value.length); }}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? '🎤 Listening…' : 'Type your response…'}
                    rows={1}
                    disabled={isLoading}
                    style={{ resize: 'none', minHeight: 40, maxHeight: 120 }}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 leading-relaxed"
                  />
                  {charCount > 0 && (
                    <span className={cn(
                      'absolute right-3 bottom-2.5 text-[10px] tabular-nums pointer-events-none',
                      charCount > 480 ? 'text-red-400' : 'text-[var(--text-muted)]',
                    )}>
                      {charCount}/500
                    </span>
                  )}
                </div>

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={!userInput.trim() || isLoading}
                  className="h-10 w-10 flex-shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-md shadow-blue-500/20"
                >
                  {isLoading
                    ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <Send className="h-4 w-4" />
                  }
                </button>
              </div>

              <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
                Press <kbd className="px-1 py-0.5 rounded bg-[var(--bg-hover)] border border-[var(--bg-border)] text-[9px]">Enter</kbd> to send ·{' '}
                <kbd className="px-1 py-0.5 rounded bg-[var(--bg-hover)] border border-[var(--bg-border)] text-[9px]">Shift+Enter</kbd> for new line
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}