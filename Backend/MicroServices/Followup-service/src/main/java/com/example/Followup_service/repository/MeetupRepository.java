package com.example.Followup_service.repository;

import com.example.Followup_service.enums.MeetupStatus;
import com.example.Followup_service.model.Meetup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetupRepository extends JpaRepository<Meetup, Long> {
    List<Meetup> findByInvestorUserId(Long investorUserId);
    List<Meetup> findByStartupUserId(Long startupUserId);
    List<Meetup> findByMatchId(Long matchId);
    List<Meetup> findByStatus(MeetupStatus status);
    Optional<Meetup> findByRoomId(String roomId);
}
