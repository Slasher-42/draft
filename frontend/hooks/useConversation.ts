import { useState, useRef } from 'react';
import { conversationService } from '@/services/conversationService';
import { toast } from 'react-toastify';
import startupServiceApi from '@/lib/startupServiceApi';

export type MessageRole = 'user' | 'aria';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export type ConversationPhase =
  | 'starting'
  | 'chatting'
  | 'asking_considerations'
  | 'finishing'
  | 'done'
  | 'error';

export const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ConversationPhase>('starting');
  const [isLoading, setIsLoading] = useState(false);
  const [updateInterval, setUpdateInterval] = useState<string>('');
  const [considerations, setConsiderations] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addMessage = (role: MessageRole, content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, content, timestamp: new Date() },
    ]);
  };

  const startConversation = async (
    executionId: number,
    userId: number,
    sessionType: 'STARTUP' | 'INVESTOR',
    formData: Record<string, any>
  ) => {
    setIsLoading(true);
    try {
      const response = await conversationService.start({
        execution_id: executionId,
        user_id: userId,
        session_type: sessionType,
        form_data: formData,
      });

      setSessionId(response.session_id);
      addMessage('aria', response.message);
      setPhase('chatting');

      const serviceUrl = sessionType === 'STARTUP'
        ? `/api/executions/startup/${executionId}/ai-session`
        : `/api/executions/investor/${executionId}/ai-session`;
      await startupServiceApi.patch(serviceUrl, null, {
        params: { aiSessionId: response.session_id },
      });
    } catch (err: any) {
      toast.error('Failed to start conversation. Please try again.');
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!sessionId || !userMessage.trim() || isLoading) return;

    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await conversationService.sendMessage(sessionId, userMessage);
      addMessage('aria', response.reply);

      if (response.is_complete) {
        setPhase('asking_considerations');
      }
    } catch (err: any) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const finishConversation = async (executionId: number, sessionType: 'STARTUP' | 'INVESTOR') => {
    if (!sessionId) return;
    setPhase('finishing');
    setIsLoading(true);

    try {
      const response = await conversationService.finish(sessionId, considerations);
      addMessage('aria', response.message);
      setUpdateInterval(response.update_interval);

      const serviceUrl = sessionType === 'STARTUP'
        ? `/api/executions/startup/${executionId}/considerations`
        : `/api/executions/investor/${executionId}/considerations`;

      if (considerations.trim()) {
        await startupServiceApi.patch(serviceUrl, null, {
          params: { additionalConsiderations: considerations },
        });
      }

      setPhase('done');
    } catch (err: any) {
      toast.error('Failed to finish conversation. Please try again.');
      setPhase('asking_considerations');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sessionId,
    phase,
    isLoading,
    updateInterval,
    considerations,
    setConsiderations,
    inputRef,
    startConversation,
    sendMessage,
    finishConversation,
  };
};