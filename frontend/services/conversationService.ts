import aiServiceApi from '@/lib/aiServiceApi';

export interface StartConversationRequest {
  execution_id: number;
  user_id: number;
  session_type: 'STARTUP' | 'INVESTOR';
  form_data: Record<string, any>;
}

export interface StartConversationResponse {
  session_id: string;
  message: string;
}

export interface SendMessageResponse {
  session_id: string;
  reply: string;
  is_complete: boolean;
}

export interface FinishConversationResponse {
  session_id: string;
  message: string;
  update_interval: string;
}

export const conversationService = {
  async start(data: StartConversationRequest): Promise<StartConversationResponse> {
    const res = await aiServiceApi.post<StartConversationResponse>('/api/conversation/start', data);
    return res.data;
  },

  async sendMessage(sessionId: string, message: string): Promise<SendMessageResponse> {
    const res = await aiServiceApi.post<SendMessageResponse>('/api/conversation/message', {
      session_id: sessionId,
      message,
    });
    return res.data;
  },

  async finish(sessionId: string, additionalConsiderations?: string): Promise<FinishConversationResponse> {
    const res = await aiServiceApi.post<FinishConversationResponse>('/api/conversation/finish', {
      session_id: sessionId,
      additional_considerations: additionalConsiderations || null,
    });
    return res.data;
  },
};