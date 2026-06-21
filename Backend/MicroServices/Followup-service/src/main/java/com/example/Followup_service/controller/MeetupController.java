package com.example.Followup_service.controller;

import com.example.Followup_service.dto.request.AdjournMeetupRequest;
import com.example.Followup_service.dto.request.ScheduleMeetupRequest;
import com.example.Followup_service.dto.request.UpdateMeetupStatusRequest;
import com.example.Followup_service.dto.response.ApiResponse;
import com.example.Followup_service.dto.response.MeetupResponse;
import com.example.Followup_service.service.MeetupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/followup/meetups")
@RequiredArgsConstructor
public class MeetupController {

    private final MeetupService meetupService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<MeetupResponse>> scheduleMeetup(
            Authentication auth,
            @Valid @RequestBody ScheduleMeetupRequest request) {
        Long adminId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Meetup scheduled successfully",
                meetupService.scheduleMeetup(adminId, request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<MeetupResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Meetups fetched", meetupService.getAll()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_INVESTOR', 'ROLE_STARTUP', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<MeetupResponse>>> getMyMeetups(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "My meetups fetched",
                meetupService.getMyMeetups(userId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MeetupResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Meetup fetched", meetupService.getById(id)));
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MeetupResponse>> getByRoomId(@PathVariable String roomId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Meetup fetched",
                meetupService.getByRoomId(roomId)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<MeetupResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMeetupStatusRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Status updated",
                meetupService.updateStatus(id, request)));
    }

    @PatchMapping("/{id}/adjourn")
    @PreAuthorize("hasAnyAuthority('ROLE_INVESTOR', 'ROLE_STARTUP')")
    public ResponseEntity<ApiResponse<MeetupResponse>> adjourn(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody AdjournMeetupRequest request) {
        Long requesterUserId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Meetup adjourned",
                meetupService.adjournMeetup(id, requesterUserId, request)));
    }
}
