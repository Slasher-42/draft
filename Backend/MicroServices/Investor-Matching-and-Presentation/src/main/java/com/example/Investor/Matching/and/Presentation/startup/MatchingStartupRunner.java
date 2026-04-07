package com.example.Investor.Matching.and.Presentation.startup;

import com.example.Investor.Matching.and.Presentation.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchingStartupRunner implements ApplicationRunner {

    private final MatchingService matchingService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("[Matching] Service started — running catch-up matching for all existing executions");
        try {
            matchingService.runMatchingForAll();
        } catch (Exception e) {
            log.error("[Matching] Catch-up matching on startup failed: {}", e.getMessage());
        }
    }
}
