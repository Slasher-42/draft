package com.example.Followup_service.controller;

import com.example.Followup_service.dto.signaling.SignalMessage;
import com.example.Followup_service.exception.BadRequestException;
import com.example.Followup_service.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebRTCSignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MeetupRepository meetupRepository;

    @MessageMapping("/signal/{roomId}")
    public void handleSignal(
            @DestinationVariable String roomId,
            @Payload SignalMessage message,
            Principal principal) {

        meetupRepository.findByRoomId(roomId)
                .orElseThrow(() -> new BadRequestException("Room not found: " + roomId));

        if (principal != null) {
            try {
                message.setFrom(Long.parseLong(principal.getName()));
            } catch (NumberFormatException ignored) {
            }
        }

        message.setRoomId(roomId);

        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }
}
