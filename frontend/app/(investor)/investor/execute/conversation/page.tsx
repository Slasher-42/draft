'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useConversation } from '@/hooks/useConversation';
import { useInvestorExecutionById } from '@/hooks/useInvestorExecution';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle } from 'lucide-react';

export default function InvestorConversationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const executionId = Number(searchParams.get('executionId'));

  const { execution, loading: execLoading } = useInvestorExecutionById(executionId);
  const {
    messages, phase, isLoading, updateInterval,
    considerations, setConsiderations,
    startConversation, sendMessage, finishConversation,
  } = useConversation();

  const [userInput, setUserInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!execLoading && execution && user && !started.current) {
      started.current = true;
      startConversation(
        execution.id,
        user.id,
        'INVESTOR',
        {
          preferredIndustry: execution.preferredIndustry,
          investmentReason: execution.investmentReason,
          investmentBudget: execution.investmentBudget,
          expectedReturnTimeline: execution.expectedReturnTimeline,
          successCriteria: execution.successCriteria,
        }
      );
    }
  }, [execLoading, execution, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;
    const msg = userInput;
    setUserInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (execLoading || phase === 'starting') {
    return <LoadingSpinner size="fullscreen" message="Aria is reviewing your submission..." />;
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-white font-semibold text-lg">Failed to start conversation</p>
        <p className="text-surface-muted text-sm">The AI service could not be reached. Please try again.</p>
        <Button variant="primary" onClick={() => router.push('/investor/execute')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      <div className="border-b border-surface-border px-6 py-4 flex items-center gap-3 bg-surface-subtle">
        <div className="h-9 w-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
          <span className="text-gold-400 font-bold text-sm">A</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Aria</p>
          <p className="text-surface-muted text-xs">Annick AI · Investment Analyst · RG Partners</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-surface-muted">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'aria' && (
                <div className="h-8 w-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mr-3 shrink-0 mt-1">
                  <span className="text-gold-400 font-bold text-xs">A</span>
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold-500 text-white rounded-tr-sm'
                    : 'bg-surface-card border border-surface-border text-white rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="h-8 w-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mr-3 shrink-0">
              <span className="text-gold-400 font-bold text-xs">A</span>
            </div>
            <div className="bg-surface-card border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <span className="h-2 w-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        {phase === 'asking_considerations' && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 bg-surface-card border border-surface-border rounded-2xl p-5 mt-2"
          >
            <p className="text-white text-sm font-medium">Any additional considerations?</p>
            <p className="text-surface-muted text-xs">
              Share anything else you would like Aria to factor into your assessment. This is optional.
            </p>
            <textarea
              value={considerations}
              onChange={(e) => setConsiderations(e.target.value)}
              rows={3}
              placeholder="Type here or leave empty..."
              className="w-full rounded-lg border border-surface-border bg-surface text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
            />
            <Button
              variant="primary"
              size="sm"
              className="self-end"
              loading={isLoading}
              onClick={() => finishConversation(executionId, 'INVESTOR')}
            >
              Submit & Finish
            </Button>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <CheckCircle className="h-12 w-12 text-green-400" />
            <div className="text-center">
              <p className="text-white font-semibold text-lg">Submission Complete</p>
              <p className="text-surface-muted text-sm mt-1">
                You will receive an update within {updateInterval}
              </p>
            </div>
            <Button variant="primary" onClick={() => router.push('/investor/executions')}>
              View My Executions
            </Button>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {phase === 'chatting' && (
        <div className="border-t border-surface-border px-6 py-4 bg-surface-subtle">
          <div className="flex items-end gap-3">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Type your response..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-surface-border bg-surface-card text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none disabled:opacity-50"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              loading={isLoading}
              className="h-10 w-10 p-0 rounded-xl shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-surface-muted text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </div>
  );
}