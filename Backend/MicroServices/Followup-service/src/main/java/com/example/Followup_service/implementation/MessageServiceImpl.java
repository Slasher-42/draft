package com.example.Followup_service.implementation;

import com.example.Followup_service.dto.request.SendMessageRequest;
import com.example.Followup_service.dto.response.BondStatusResponse;
import com.example.Followup_service.dto.response.ConversationSummaryResponse;
import com.example.Followup_service.dto.response.MessageResponse;
import com.example.Followup_service.model.Message;
import com.example.Followup_service.repository.MessageRepository;
import com.example.Followup_service.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    @Override
    public MessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .content(request.getContent())
                .read(false)
                .build();
        return toResponse(messageRepository.save(message));
    }

    @Override
    public List<MessageResponse> getConversation(Long userId, Long otherUserId) {
        return messageRepository.findConversation(userId, otherUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ConversationSummaryResponse> getConversations(Long userId) {
        List<Long> partners = messageRepository.findConversationPartners(userId);
        List<ConversationSummaryResponse> summaries = new ArrayList<>();
        for (Long partnerId : partners) {
            Optional<Message> last = messageRepository.findLastMessage(userId, partnerId);
            long unread = messageRepository.findByReceiverIdAndReadFalse(userId)
                    .stream()
                    .filter(m -> m.getSenderId().equals(partnerId))
                    .count();
            last.ifPresent(m -> summaries.add(ConversationSummaryResponse.builder()
                    .partnerId(partnerId)
                    .lastMessage(m.getContent().length() > 60 ? m.getContent().substring(0, 60) + "…" : m.getContent())
                    .lastMessageAt(m.getSentAt())
                    .unreadCount(unread)
                    .build()));
        }
        summaries.sort((a, b) -> {
            if (a.getLastMessageAt() == null) return 1;
            if (b.getLastMessageAt() == null) return -1;
            return b.getLastMessageAt().compareTo(a.getLastMessageAt());
        });
        return summaries;
    }

    @Override
    public void markConversationAsRead(Long userId, Long otherUserId) {
        List<Message> unread = messageRepository.findByReceiverIdAndReadFalse(userId)
                .stream()
                .filter(m -> m.getSenderId().equals(otherUserId))
                .toList();
        unread.forEach(m -> m.setRead(true));
        messageRepository.saveAll(unread);
    }

    @Override
    public long countUnread(Long userId) {
        return messageRepository.countByReceiverIdAndReadFalse(userId);
    }

    @Override
    public BondStatusResponse getBondStatus(Long investorUserId, Long startupUserId) {
        long count = messageRepository.countConversation(investorUserId, startupUserId);
        Optional<Message> last = messageRepository.findLastMessage(investorUserId, startupUserId);
        return BondStatusResponse.builder()
                .investorUserId(investorUserId)
                .startupUserId(startupUserId)
                .messageCount(count)
                .active(count > 0)
                .lastMessageAt(last.map(Message::getSentAt).orElse(null))
                .build();
    }

    private MessageResponse toResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .senderId(m.getSenderId())
                .receiverId(m.getReceiverId())
                .content(m.getContent())
                .read(m.isRead())
                .sentAt(m.getSentAt())
                .build();
    }
}
