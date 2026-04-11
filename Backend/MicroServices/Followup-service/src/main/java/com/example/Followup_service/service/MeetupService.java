package com.example.Followup_service.service;

import com.example.Followup_service.dto.request.ScheduleMeetupRequest;
import com.example.Followup_service.dto.request.UpdateMeetupStatusRequest;
import com.example.Followup_service.dto.response.MeetupResponse;

import java.util.List;

public interface MeetupService {
    MeetupResponse scheduleMeetup(Long adminId, ScheduleMeetupRequest request);
    MeetupResponse updateStatus(Long meetupId, UpdateMeetupStatusRequest request);
    MeetupResponse getById(Long meetupId);
    List<MeetupResponse> getAll();
    List<MeetupResponse> getMyMeetups(Long userId);
    MeetupResponse getByRoomId(String roomId);
}
