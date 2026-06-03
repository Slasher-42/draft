package com.example.Followup_service.service;

import com.example.Followup_service.dto.request.SendMessageRequest;
import com.example.Followup_service.dto.response.BondStatusResponse;
import com.example.Followup_service.dto.response.ConversationSummaryResponse;
import com.example.Followup_service.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(Long senderId, SendMessageRequest request);
    List<MessageResponse> getConversation(Long userId, Long otherUserId);
    List<ConversationSummaryResponse> getConversations(Long userId);
    void markConversationAsRead(Long userId, Long otherUserId);
    long countUnread(Long userId);
    BondStatusResponse getBondStatus(Long investorUserId, Long startupUserId);
}
