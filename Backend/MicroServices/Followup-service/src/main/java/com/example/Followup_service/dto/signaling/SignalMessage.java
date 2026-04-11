package com.example.Followup_service.dto.signaling;

import lombok.Data;

@Data
public class SignalMessage {
    private String type;
    private String roomId;
    private Long   from;
    private String sdp;
    private String candidate;
}
