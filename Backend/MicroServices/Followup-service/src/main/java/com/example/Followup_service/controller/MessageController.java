package com.example.Followup_service.controller;

import com.example.Followup_service.dto.request.SendMessageRequest;
import com.example.Followup_service.dto.response.*;
import com.example.Followup_service.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            Authentication auth,
            @Valid @RequestBody SendMessageRequest request) {
        Long senderId = (Long) auth.getPrincipal();
        MessageResponse saved = messageService.sendMessage(senderId, request);

        // Real-time delivery to recipient via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/user-" + request.getReceiverId(), saved);

        return ResponseEntity.ok(new ApiResponse<>(true, "Message sent", saved));
    }

    @GetMapping("/conversation/{otherUserId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getConversation(
            Authentication auth,
            @PathVariable Long otherUserId) {
        Long userId = (Long) auth.getPrincipal();
        // Mark as read when fetching
        messageService.markConversationAsRead(userId, otherUserId);
        List<MessageResponse> messages = messageService.getConversation(userId, otherUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Conversation fetched", messages));
    }

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConversationSummaryResponse>>> getConversations(
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Conversations fetched",
                messageService.getConversations(userId)));
    }

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> countUnread(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count",
                messageService.countUnread(userId)));
    }

    @GetMapping("/admin/bond-status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EVALUATOR')")
    public ResponseEntity<ApiResponse<BondStatusResponse>> getBondStatus(
            @RequestParam Long investorUserId,
            @RequestParam Long startupUserId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Bond status fetched",
                messageService.getBondStatus(investorUserId, startupUserId)));
    }

    @GetMapping("/admin/conversation")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getConversationForAdmin(
            @RequestParam Long user1, @RequestParam Long user2) {
        List<MessageResponse> messages = messageService.getConversation(user1, user2);
        return ResponseEntity.ok(new ApiResponse<>(true, "Conversation fetched", messages));
    }
}
