package com.example.Followup_service.scheduler;

import com.example.Followup_service.enums.MeetupStatus;
import com.example.Followup_service.kafka.FollowupEventPublisher;
import com.example.Followup_service.model.Meetup;
import com.example.Followup_service.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class MeetupReminderScheduler {

    private final MeetupRepository meetupRepository;
    private final FollowupEventPublisher followupEventPublisher;

    @Scheduled(fixedDelayString = "${meetup.scheduler.interval.ms:20000}")
    public void checkScheduledMeetups() {
        List<Meetup> scheduled = meetupRepository.findByStatus(MeetupStatus.SCHEDULED);
        LocalDateTime now = LocalDateTime.now();

        for (Meetup meetup : scheduled) {
            try {
                processReminder(meetup, now);
                processAutoStart(meetup, now);
            } catch (Exception e) {
                log.error("[Scheduler] Failed processing meetupId={}: {}", meetup.getId(), e.getMessage());
            }
        }
    }

    private void processReminder(Meetup meetup, LocalDateTime now) {
        if (Boolean.TRUE.equals(meetup.getReminderSent())) return;
        LocalDateTime scheduledAt = meetup.getScheduledAt();
        if (now.isBefore(scheduledAt) && !now.plusMinutes(1).isBefore(scheduledAt)) {
            followupEventPublisher.publishMeetupReminder(meetup.getId(), meetup.getInvestorUserId(),
                    meetup.getStartupUserId(), meetup.getMatchId(), meetup.getRoomId(), scheduledAt);
            meetup.setReminderSent(true);
            meetupRepository.save(meetup);
            log.info("[Scheduler] MEETUP_REMINDER published for meetupId={}", meetup.getId());
        }
    }

    private void processAutoStart(Meetup meetup, LocalDateTime now) {
        if (!meetup.getScheduledAt().isAfter(now)) {
            meetup.setStatus(MeetupStatus.IN_PROGRESS);
            meetupRepository.save(meetup);
            log.info("[Scheduler] Meetup auto-started, meetupId={}", meetup.getId());
        }
    }
}
