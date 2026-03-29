"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { startupService } from "@/services/startupService";
import { aiService } from "@/services/aiService";
import { toast } from "react-toastify";

interface ChatMessage {
  role: "ai" | "user";
  content: string;
  timestamp?: Date;
  attachedFile?: string;
}

function VoiceWave({ active }: { active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 24 }}>
      {[1, 1.6, 0.8, 1.4, 0.6, 1.8, 1, 1.5, 0.7, 1.3].map((h, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 3,
            borderRadius: 9,
            background: active ? "#7c6af7" : "#333",
            height: active ? `${h * 18}px` : "4px",
            transition: `height 0.15s ease ${i * 40}ms`,
            animation: active ? `waveBar 0.7s ease-in-out ${i * 60}ms infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          0%   { transform: scaleY(0.4); }
          100% { transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
}

function AriaAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c6af7 0%, #5b4de0 50%, #3d32b8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 700,
          color: "#fff",
          boxShadow: speaking
            ? "0 0 0 3px rgba(124,106,247,0.35), 0 0 18px rgba(124,106,247,0.25)"
            : "0 0 0 1px rgba(124,106,247,0.2)",
          transition: "box-shadow 0.3s ease",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        A
      </div>
      {speaking && (
        <span
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "2px solid rgba(124,106,247,0.4)",
            animation: "ping 1s ease-in-out infinite",
          }}
        />
      )}
      <style>{`@keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0;transform:scale(1.4)} }`}</style>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const steps = ["Connected", "Assessment", "Review", "Complete"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: i <= step ? "linear-gradient(135deg,#7c6af7,#3d32b8)" : "#1a1a1a",
                border: i === step ? "2px solid #7c6af7" : "1px solid #2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: i <= step ? "#fff" : "#555",
                fontWeight: 700,
                transition: "all 0.3s",
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 9, color: i <= step ? "#7c6af7" : "#444", whiteSpace: "nowrap" }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                height: 1,
                width: 28,
                marginBottom: 18,
                background: i < step ? "linear-gradient(90deg,#7c6af7,#3d32b8)" : "#1f1f1f",
                transition: "background 0.4s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 120, 240].map((d) => (
        <span
          key={d}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#7c6af7",
            animation: `typingBounce 0.9s ease-in-out ${d}ms infinite`,
            display: "block",
          }}
        />
      ))}
      <style>{`@keyframes typingBounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-7px);opacity:1}}`}</style>
    </div>
  );
}

function AIConversationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const executionId = Number(searchParams.get("executionId"));

  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isStarting, setIsStarting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingAdditional, setAwaitingAdditional] = useState(false);
  const [additionalText, setAdditionalText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isRecording, setIsRecording] = useState(false);
  const [isAriaSpeaking, setIsAriaSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionQuality] = useState<"excellent" | "good" | "poor">("excellent");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const started = useRef(false);

  const speakText = useCallback(
    (text: string) => {
      if (isMuted || !voiceEnabled || typeof window === "undefined") return;
      window.speechSynthesis?.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1.05;
      utter.volume = 1;
      const voices = window.speechSynthesis?.getVoices() || [];
      const preferred = voices.find(
        (v) =>
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("karen")
      );
      if (preferred) utter.voice = preferred;
      utter.onstart = () => setIsAriaSpeaking(true);
      utter.onend = () => setIsAriaSpeaking(false);
      synthRef.current = utter;
      window.speechSynthesis?.speak(utter);
    },
    [isMuted, voiceEnabled]
  );

  useEffect(() => {
    if (user && voiceEnabled) {
      const lastName = user.fullName?.split(" ").pop() || "there";
      const greeting = `Welcome to RG AI Conversation. Good to have you here, ${lastName}. I'm Aria, your AI Assessment Analyst. Let me review your startup submission.`;
      speakText(greeting);
    }
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration((d) => d + 1);
    }, 1000);
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setMessageCount(messages.length);
  }, [messages]);

  useEffect(() => {
    if (!executionId || !user || started.current) return;
    started.current = true;

    const init = async () => {
      try {
        const execRes = await startupService.getExecutionById(String(executionId));
        const execution = execRes.data.data;

        const aiRes = await aiService.startSession({
          type: "STARTUP",
          formData: {
            executionId: execution.id,
            userId: Number(user.id),
            targetCompanySize: execution.targetCompanySize,
            problemStatement: execution.problemStatement,
            businessModel: execution.businessModel,
            targetMarket: execution.targetMarket,
            teamDetails: execution.teamDetails,
            annualRevenue: execution.annualRevenue,
            monthlyBurnRate: execution.monthlyBurnRate,
            fundingNeeded: execution.fundingNeeded,
          },
        });

        const { session_id, message } = aiRes.data;
        setSessionId(session_id);
        setProgressStep(1);
        setMessages([{ role: "ai", content: message, timestamp: new Date() }]);
        setTimeout(() => speakText(message), 500);
      } catch {
        toast.error("Failed to start conversation. Please try again.");
        router.push("/startup/execute");
      } finally {
        setIsStarting(false);
      }
    };

    init();
  }, [executionId, user]);

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(t);
      setUserInput(t);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript("");
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handlePdfUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }
    setPdfFile(file);
    toast.success(`PDF "${file.name}" attached — Aria will factor this into the assessment.`);
    setPdfText(`[PDF Document: ${file.name} — ${(file.size / 1024).toFixed(1)} KB attached]`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePdfUpload(file);
  };

  const sendAnswer = async () => {
    const rawAnswer = userInput.trim();
    if (!rawAnswer || !sessionId) return;
    const answer = pdfText ? `${rawAnswer}\n\n${pdfText}` : rawAnswer;

    setUserInput("");
    setPdfFile(null);
    setPdfText("");
    setTranscript("");
    setMessages((prev) => [...prev, { role: "user", content: rawAnswer, timestamp: new Date() }]);
    setIsSending(true);

    try {
      const res = await aiService.sendAnswer({ sessionId, answer });

      if (res.data.is_complete) {
        const aiMsg = res.data.reply || "Thank you for your answers.";
        const additionalPrompt =
          "Is there anything else you would like me to consider when assessing your startup? Feel free to share any additional context.";
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: aiMsg, timestamp: new Date() },
          { role: "ai", content: additionalPrompt, timestamp: new Date() },
        ]);
        setAwaitingAdditional(true);
        setProgressStep(2);
        speakText(aiMsg + " " + additionalPrompt);
      } else {
        const reply = res.data.reply || "";
        setMessages((prev) => [...prev, { role: "ai", content: reply, timestamp: new Date() }]);
        speakText(reply);
      }
    } catch {
      toast.error("Failed to send response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setUserInput(rawAnswer);
    } finally {
      setIsSending(false);
    }
  };

  const submitExecution = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      const finishRes = await aiService.finishSession({
        sessionId,
        additionalConsiderations: additionalText || null,
      });
      const closing = finishRes.data.message;

      await startupService.attachAiSession(String(executionId), sessionId);

      await startupService.saveConsiderations(
        String(executionId),
        additionalText?.trim() || "No additional considerations provided."
      );

      setMessages((prev) => [...prev, { role: "ai", content: closing, timestamp: new Date() }]);
      setAwaitingAdditional(false);
      setIsDone(true);
      setProgressStep(3);
      speakText(closing);
    } catch {
      toast.error("Failed to finalise. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const lastName = user?.fullName?.split(" ").pop() || "Founder";

  const filteredMessages = searchTerm
    ? messages.filter((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  if (isStarting) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c6af7,#3d32b8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'Syne',sans-serif",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            A
          </div>
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: "2px solid rgba(124,106,247,0.3)",
              animation: "spin 3s linear infinite",
            }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "#7c6af7",
              fontFamily: "'Syne',sans-serif",
              fontSize: 22,
              margin: 0,
            }}
          >
            Aria is reviewing your submission
          </p>
          <p style={{ color: "#555", fontSize: 13, marginTop: 8 }}>
            Welcome, {lastName}. Analysing your startup profile…
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#7c6af7",
                animation: `typingBounce 0.9s ease-in-out ${d}s infinite`,
                display: "block",
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,106,247,.4)}50%{box-shadow:0 0 0 20px rgba(124,106,247,0)}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes typingBounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-7px);opacity:1}}
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#e8e8e8",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: fontSize,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0a0a0a}
        ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:#7c6af7}
        .msg-ai-bubble{
          background:linear-gradient(135deg,#0e0e14 0%,#13131c 100%);
          border:1px solid #1e1e2e;border-radius:0 16px 16px 16px;
          padding:14px 18px;max-width:80%;line-height:1.65;
          animation:fadeSlideIn 0.3s ease;
        }
        .msg-user-bubble{
          background:linear-gradient(135deg,#100e1f 0%,#181530 100%);
          border:1px solid rgba(124,106,247,0.25);border-radius:16px 0 16px 16px;
          padding:14px 18px;max-width:80%;line-height:1.65;
          color:#d0ccff;animation:fadeSlideIn 0.3s ease;
        }
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .violet-btn{
          background:linear-gradient(135deg,#7c6af7,#5b4de0);
          color:#fff;border:none;border-radius:10px;
          padding:10px 20px;font-weight:600;cursor:pointer;
          transition:all 0.2s;font-size:13px;
        }
        .violet-btn:hover{filter:brightness(1.15);transform:translateY(-1px)}
        .violet-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .ghost-btn{
          background:transparent;color:#555;border:1px solid #1e1e1e;
          border-radius:8px;padding:6px 12px;cursor:pointer;
          transition:all 0.2s;font-size:12px;
        }
        .ghost-btn:hover{border-color:#7c6af7;color:#7c6af7}
        .ghost-btn.active{border-color:#7c6af7;color:#7c6af7;background:rgba(124,106,247,.08)}
        .dark-input{
          background:#0c0c14;border:1px solid #1e1e2e;border-radius:10px;
          color:#e8e8e8;padding:10px 14px;outline:none;width:100%;font-size:13px;
          transition:border-color 0.2s;resize:none;font-family:inherit;
        }
        .dark-input:focus{border-color:rgba(124,106,247,.5)}
        .dark-input::placeholder{color:#383850}
        .sidebar-item{
          display:flex;align-items:center;gap:10px;
          padding:10px 14px;border-radius:8px;cursor:pointer;
          transition:background 0.2s;font-size:12px;color:#888;
        }
        .sidebar-item:hover{background:#0e0e16;color:#e8e8e8}
        .icon-btn{
          width:36px;height:36px;border-radius:8px;
          background:#0c0c14;border:1px solid #1e1e2e;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all 0.2s;color:#555;font-size:14px;
        }
        .icon-btn:hover{border-color:#7c6af7;color:#7c6af7}
        .icon-btn.active{border-color:#7c6af7;color:#7c6af7;background:rgba(124,106,247,.08)}
        .drag-zone{
          border:2px dashed #1e1e2e;border-radius:12px;
          padding:24px;text-align:center;cursor:pointer;
          transition:all 0.2s;
        }
        .drag-zone:hover,.drag-zone.over{border-color:#7c6af7;background:rgba(124,106,247,.04)}
      `}</style>

      <div
        style={{
          padding: "14px 24px",
          background: "#080810",
          borderBottom: "1px solid #111120",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="icon-btn" onClick={() => setShowSidebar(!showSidebar)} title="Menu">
            ☰
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#7c6af7",
                }}
              >
                RG AI Conversation
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 20,
                  background: "rgba(124,106,247,.12)",
                  border: "1px solid rgba(124,106,247,.25)",
                  color: "#7c6af7",
                }}
              >
                LIVE
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#444", margin: 0 }}>
              Aria · Startup Assessment · {lastName}
            </p>
          </div>
        </div>

        <ProgressBar step={progressStep} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: 6 + i * 4,
                  borderRadius: 2,
                  background: connectionQuality === "excellent" ? "#22c55e" : i <= 2 ? "#eab308" : "#333",
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 12,
              color: "#555",
              fontFamily: "monospace",
              background: "#0c0c14",
              border: "1px solid #1a1a2a",
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            {formatDuration(sessionDuration)}
          </span>
          <button
            className={`icon-btn ${showSearch ? "active" : ""}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search messages"
          >
            🔍
          </button>
          <button
            className={`icon-btn ${showTimestamps ? "active" : ""}`}
            onClick={() => setShowTimestamps(!showTimestamps)}
            title="Toggle timestamps"
          >
            🕐
          </button>
          <button
            className={`icon-btn ${isMuted ? "active" : ""}`}
            onClick={() => setIsMuted(!isMuted)}
            title="Toggle voice"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            className={`icon-btn ${isFullscreen ? "active" : ""}`}
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Fullscreen"
          >
            ⛶
          </button>
          <button
            onClick={() => router.push("/startup/dashboard")}
            style={{
              background: "transparent",
              border: "1px solid #1e1e2e",
              borderRadius: 8,
              color: "#555",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 12,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#7c6af7";
              (e.target as HTMLButtonElement).style.color = "#7c6af7";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#1e1e2e";
              (e.target as HTMLButtonElement).style.color = "#555";
            }}
          >
            ← Exit
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {showSidebar && (
          <div
            style={{
              width: 240,
              background: "#080810",
              borderRight: "1px solid #111120",
              padding: "20px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              animation: "fadeSlideIn 0.2s ease",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                padding: "0 14px 8px",
              }}
            >
              Session Controls
            </p>
            <div className="sidebar-item" onClick={() => fileInputRef.current?.click()}>
              <span>📎</span> Attach PDF
            </div>
            <div
              className="sidebar-item"
              onClick={() => setInputMode(inputMode === "voice" ? "text" : "voice")}
            >
              <span>{inputMode === "voice" ? "⌨️" : "🎙️"}</span>
              {inputMode === "voice" ? "Switch to Text" : "Switch to Voice"}
            </div>
            <div className="sidebar-item" onClick={() => setIsMuted(!isMuted)}>
              <span>{isMuted ? "🔇" : "🔊"}</span> {isMuted ? "Unmute Aria" : "Mute Aria"}
            </div>
            <div className="sidebar-item" onClick={() => setShowTimestamps(!showTimestamps)}>
              <span>🕐</span> {showTimestamps ? "Hide" : "Show"} Timestamps
            </div>
            <div style={{ borderTop: "1px solid #111120", margin: "8px 0" }} />
            <p
              style={{
                fontSize: 10,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                padding: "0 14px 8px",
              }}
            >
              Text Size
            </p>
            <div style={{ display: "flex", gap: 6, padding: "0 14px" }}>
              {[12, 14, 16].map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`ghost-btn ${fontSize === s ? "active" : ""}`}
                >
                  {s === 12 ? "S" : s === 14 ? "M" : "L"}
                </button>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #111120", margin: "8px 0" }} />
            <p
              style={{
                fontSize: 10,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                padding: "0 14px 8px",
              }}
            >
              Session Stats
            </p>
            <div style={{ padding: "0 14px" }}>
              {[
                ["Messages", messageCount],
                ["Duration", formatDuration(sessionDuration)],
                ["Status", isDone ? "Complete" : "Active"],
              ].map(([k, v]) => (
                <div
                  key={String(k)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px solid #0e0e16",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#555" }}>{k}</span>
                  <span style={{ color: isDone && k === "Status" ? "#22c55e" : "#7c6af7" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #111120", margin: "8px 0" }} />
            <div
              className="sidebar-item"
              onClick={() => {
                const text = messages
                  .map((m) => `${m.role === "ai" ? "Aria" : "You"}: ${m.content}`)
                  .join("\n\n");
                navigator.clipboard.writeText(text);
                toast.success("Transcript copied!");
              }}
            >
              <span>📋</span> Copy Transcript
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {showSearch && (
            <div
              style={{
                padding: "10px 20px",
                background: "#080810",
                borderBottom: "1px solid #111120",
              }}
            >
              <input
                className="dark-input"
                placeholder="Search messages…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: 400 }}
              />
            </div>
          )}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,rgba(124,106,247,.06),rgba(124,106,247,.02))",
                border: "1px solid rgba(124,106,247,.15)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 28 }}>🚀</span>
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#7c6af7",
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Welcome back, {lastName}
                </p>
                <p style={{ margin: 0, color: "#555", fontSize: 12, marginTop: 3 }}>
                  Your AI startup assessment session is now active. All responses are confidential.
                </p>
              </div>
            </div>

            {filteredMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {msg.role === "ai" ? (
                  <AriaAvatar speaking={isAriaSpeaking && i === messages.length - 1} />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "#0e0e16",
                      border: "1px solid #1e1e2e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      color: "#7c6af7",
                    }}
                  >
                    {(user?.fullName?.[0] || "U").toUpperCase()}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxWidth: "80%",
                  }}
                >
                  <div className={msg.role === "ai" ? "msg-ai-bubble" : "msg-user-bubble"}>
                    {msg.content}
                    {msg.attachedFile && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "6px 10px",
                          background: "rgba(124,106,247,.08)",
                          border: "1px solid rgba(124,106,247,.2)",
                          borderRadius: 6,
                          fontSize: 11,
                          color: "#7c6af7",
                        }}
                      >
                        📎 {msg.attachedFile}
                      </div>
                    )}
                  </div>
                  {showTimestamps && msg.timestamp && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "#333",
                        textAlign: msg.role === "user" ? "right" : "left",
                      }}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AriaAvatar speaking={false} />
                <div
                  style={{
                    background: "#0e0e14",
                    border: "1px solid #1e1e2e",
                    borderRadius: "0 16px 16px 16px",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}

            {isDone && (
              <div
                style={{
                  textAlign: "center",
                  padding: "28px 20px",
                  background: "linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02))",
                  border: "1px solid rgba(34,197,94,.2)",
                  borderRadius: 14,
                  animation: "fadeSlideIn 0.4s ease",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <p
                  style={{
                    color: "#22c55e",
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 18,
                    margin: "0 0 6px",
                    fontWeight: 700,
                  }}
                >
                  Assessment Complete
                </p>
                <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                  Your startup assessment has been saved. You will receive an update soon.
                </p>
                <button
                  className="violet-btn"
                  style={{ marginTop: 16 }}
                  onClick={() => router.push("/startup/executions")}
                >
                  View My Executions →
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {!isDone && (
            <div
              style={{
                padding: "16px 24px 20px",
                background: "#080810",
                borderTop: "1px solid #111120",
              }}
            >
              {!awaitingAdditional && (
                <div
                  className={`drag-zone ${isDragOver ? "over" : ""}`}
                  style={{
                    marginBottom: pdfFile ? 10 : 0,
                    display: pdfFile || isDragOver ? "block" : "none",
                  }}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {pdfFile ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>📄</span>
                      <span style={{ color: "#7c6af7", fontSize: 13 }}>{pdfFile.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfFile(null);
                          setPdfText("");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#555",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p style={{ color: "#555", fontSize: 12, margin: 0 }}>
                      Drop PDF here or click to upload
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <button
                  className={`ghost-btn ${inputMode === "text" ? "active" : ""}`}
                  onClick={() => setInputMode("text")}
                >
                  ⌨️ Text
                </button>
                <button
                  className={`ghost-btn ${inputMode === "voice" ? "active" : ""}`}
                  onClick={() => setInputMode("voice")}
                >
                  🎙️ Voice
                </button>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {!awaitingAdditional && (
                    <button
                      className="icon-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach PDF"
                    >
                      📎
                    </button>
                  )}
                  <button
                    className={`icon-btn ${isMuted ? "active" : ""}`}
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? "Unmute" : "Mute Aria"}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                </div>
              </div>

              {awaitingAdditional ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
                    Optional: Share any additional context for Aria to consider.
                  </p>
                  <textarea
                    className="dark-input"
                    rows={3}
                    placeholder="e.g. We are planning to expand to East Africa within 18 months and have a pilot with 3 enterprise clients…"
                    value={additionalText}
                    onChange={(e) => setAdditionalText(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="violet-btn"
                      onClick={submitExecution}
                      disabled={isSubmitting}
                      style={{ flex: 1 }}
                    >
                      {isSubmitting ? "Saving…" : "✓ Submit & Complete Assessment"}
                    </button>
                    <button
                      className="ghost-btn"
                      onClick={() => submitExecution()}
                      disabled={isSubmitting}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ) : inputMode === "voice" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  {transcript && (
                    <div
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#0c0c14",
                        border: "1px solid #1e1e2e",
                        borderRadius: 10,
                        fontSize: 13,
                        color: "#ccc",
                      }}
                    >
                      <span style={{ color: "#7c6af7", fontSize: 11 }}>Transcript: </span>
                      {transcript}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <VoiceWave active={isRecording} />
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        border: "none",
                        background: isRecording
                          ? "linear-gradient(135deg,#dc2626,#991b1b)"
                          : "linear-gradient(135deg,#7c6af7,#3d32b8)",
                        color: "#fff",
                        fontSize: 24,
                        cursor: "pointer",
                        boxShadow: isRecording
                          ? "0 0 0 6px rgba(220,38,38,.2)"
                          : "0 0 0 4px rgba(124,106,247,.15)",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isRecording ? "⏹" : "🎙"}
                    </button>
                    <VoiceWave active={isRecording} />
                  </div>
                  <p style={{ fontSize: 11, color: "#444", margin: 0 }}>
                    {isRecording ? "Recording… click to stop" : "Click to start speaking"}
                  </p>
                  {transcript && (
                    <button
                      className="violet-btn"
                      onClick={sendAnswer}
                      disabled={isSending || !transcript.trim()}
                    >
                      Send Response →
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={textareaRef}
                    className="dark-input"
                    rows={2}
                    placeholder="Type your response…  (Enter to send, Shift+Enter for new line)"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendAnswer();
                      }
                    }}
                    disabled={isSending}
                    style={{ flex: 1, maxHeight: 120 }}
                  />
                  <button
                    className="violet-btn"
                    onClick={sendAnswer}
                    disabled={isSending || !userInput.trim()}
                    style={{ padding: "10px 16px", flexShrink: 0 }}
                  >
                    {isSending ? "…" : "↑"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handlePdfUpload(f);
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#050505",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ color: "#7c6af7", fontFamily: "'Syne',sans-serif" }}>Loading…</div>
        </div>
      }
    >
      <AIConversationPage />
    </Suspense>
  );
}