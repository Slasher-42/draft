"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { aiService } from "@/services/aiService";
import { investorService } from "@/services/investorService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import { Bot, Send, User, CheckCircle2, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "ai" | "user";
  content: string;
}

function InvestorAIConversation() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId") || "";
  const firstQuestion = searchParams.get("firstQuestion") || "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingAdditional, setAwaitingAdditional] = useState(false);
  const [additionalText, setAdditionalText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [updateInterval, setUpdateInterval] = useState("48 hours");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (firstQuestion) {
      setMessages([{ role: "ai", content: firstQuestion }]);
    }
  }, [firstQuestion]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    aiService
      .getConfig()
      .then((res) => {
        if (res.data?.updateInterval)
          setUpdateInterval(res.data.updateInterval);
      })
      .catch(() => {});
  }, []);

  const sendAnswer = async () => {
    if (!userInput.trim() || !sessionId) return;
    const answer = userInput.trim();
    setUserInput("");
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setIsSending(true);

    try {
      const res = await aiService.sendAnswer({ sessionId, answer });

      if (res.data.done) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: res.data.message || "Thank you for your answers.",
          },
          {
            role: "ai",
            content:
              "Is there anything else you would like me to consider when finding startups for you? Feel free to share any additional context.",
          },
        ]);
        setAwaitingAdditional(true);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: res.data.nextQuestion || "" },
        ]);
      }
    } catch {
      toast.error("Failed to send response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setUserInput(answer);
    } finally {
      setIsSending(false);
    }
  };

  const submitExecution = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await investorService.createExecution({
        sessionId,
        additionalConsiderations: additionalText,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: additionalText || "(No additional considerations)",
        },
        {
          role: "ai",
          content: `Thank you for your submission. Your investment execution has been saved. We will search for matching startups and notify you within ${updateInterval}.`,
        },
      ]);
      setAwaitingAdditional(false);
      setIsDone(true);
    } catch {
      toast.error("Failed to save execution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          AI Investment Assessment
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-1">
          Answer the AI questions to help us find the best startup matches for
          your investment goals.
        </p>
      </div>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Aria — AI Investment Analyst</CardTitle>
              <CardDescription>Powered by RG Partners</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chat messages */}
          <div className="bg-[var(--color-neutral-50)] rounded-xl p-4 min-h-[320px] max-h-[480px] overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === "ai"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-secondary)] text-white"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "ai"
                      ? "bg-white border border-[var(--color-border)] text-[var(--color-foreground)] rounded-tl-sm"
                      : "bg-[var(--color-primary)] text-white rounded-tr-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] text-white flex-shrink-0 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 bg-[var(--color-neutral-400)] rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {!awaitingAdditional && !isDone && (
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your answer…"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendAnswer();
                  }
                }}
                disabled={isSending}
                className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                rows={1}
              />
              <Button
                onClick={sendAnswer}
                disabled={isSending || !userInput.trim()}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Additional considerations */}
          {awaitingAdditional && !isDone && (
            <div className="space-y-3">
              <Textarea
                placeholder="Any additional context you would like the AI to consider (optional)…"
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
              <Button
                onClick={submitExecution}
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Investment Execution
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Done */}
          {isDone && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-14 w-14 rounded-full bg-[var(--color-secondary-50)] flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-[var(--color-secondary)]" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[var(--color-primary-800)] text-lg">
                  Investment Execution Submitted!
                </p>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                  You will receive an update within {updateInterval}.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/investor/executions")}
              >
                View My Investments
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvestorAIPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <InvestorAIConversation />
    </Suspense>
  );
}