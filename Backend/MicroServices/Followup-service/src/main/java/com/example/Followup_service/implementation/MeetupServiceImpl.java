package com.example.Followup_service.implementation;

import com.example.Followup_service.dto.request.ScheduleMeetupRequest;
import com.example.Followup_service.dto.request.UpdateMeetupStatusRequest;
import com.example.Followup_service.dto.response.MeetupResponse;
import com.example.Followup_service.exception.ResourceNotFoundException;
import com.example.Followup_service.model.Meetup;
import com.example.Followup_service.repository.MeetupRepository;
import com.example.Followup_service.service.MeetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeetupServiceImpl implements MeetupService {

    private final MeetupRepository meetupRepository;

    @Override
    public MeetupResponse scheduleMeetup(Long adminId, ScheduleMeetupRequest request) {
        Meetup meetup = new Meetup();
        meetup.setMatchId(request.getMatchId());
        meetup.setInvestorUserId(request.getInvestorUserId());
        meetup.setStartupUserId(request.getStartupUserId());
        meetup.setScheduledByAdminId(adminId);
        meetup.setScheduledAt(request.getScheduledAt());
        meetup.setAdminNotes(request.getAdminNotes());
        meetup.setRoomId(UUID.randomUUID().toString());
        return toResponse(meetupRepository.save(meetup));
    }

    @Override
    public MeetupResponse updateStatus(Long meetupId, UpdateMeetupStatusRequest request) {
        Meetup meetup = meetupRepository.findById(meetupId)
                .orElseThrow(() -> new ResourceNotFoundException("Meetup not found: " + meetupId));
        meetup.setStatus(request.getStatus());
        if (request.getAdminNotes() != null) {
            meetup.setAdminNotes(request.getAdminNotes());
        }
        return toResponse(meetupRepository.save(meetup));
    }

    @Override
    public MeetupResponse getById(Long meetupId) {
        Meetup meetup = meetupRepository.findById(meetupId)
                .orElseThrow(() -> new ResourceNotFoundException("Meetup not found: " + meetupId));
        return toResponse(meetup);
    }

    @Override
    public List<MeetupResponse> getAll() {
        return meetupRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<MeetupResponse> getMyMeetups(Long userId) {
        List<Meetup> asInvestor = meetupRepository.findByInvestorUserId(userId);
        List<Meetup> asStartup  = meetupRepository.findByStartupUserId(userId);
        return java.util.stream.Stream.concat(asInvestor.stream(), asStartup.stream())
                .distinct()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public MeetupResponse getByRoomId(String roomId) {
        Meetup meetup = meetupRepository.findByRoomId(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));
        return toResponse(meetup);
    }

    private MeetupResponse toResponse(Meetup m) {
        MeetupResponse r = new MeetupResponse();
        r.setId(m.getId());
        r.setMatchId(m.getMatchId());
        r.setInvestorUserId(m.getInvestorUserId());
        r.setStartupUserId(m.getStartupUserId());
        r.setScheduledByAdminId(m.getScheduledByAdminId());
        r.setScheduledAt(m.getScheduledAt());
        r.setStatus(m.getStatus());
        r.setRoomId(m.getRoomId());
        r.setAdminNotes(m.getAdminNotes());
        r.setCreatedAt(m.getCreatedAt());
        r.setUpdatedAt(m.getUpdatedAt());
        return r;
    }
}
