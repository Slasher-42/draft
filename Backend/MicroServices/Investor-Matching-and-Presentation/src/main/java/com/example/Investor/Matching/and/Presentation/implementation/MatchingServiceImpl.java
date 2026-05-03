package com.example.Investor.Matching.and.Presentation.implementation;

import com.example.Investor.Matching.and.Presentation.dto.InvestorExecutionDTO;
import com.example.Investor.Matching.and.Presentation.dto.MatchResponse;
import com.example.Investor.Matching.and.Presentation.dto.StartupExecutionDTO;
import com.example.Investor.Matching.and.Presentation.enums.MatchStatus;
import com.example.Investor.Matching.and.Presentation.kafka.MatchingEventPublisher;
import com.example.Investor.Matching.and.Presentation.model.InvestorMatch;
import com.example.Investor.Matching.and.Presentation.repository.InvestorMatchRepository;
import com.example.Investor.Matching.and.Presentation.service.MatchingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingServiceImpl implements MatchingService {

    private final InvestorMatchRepository matchRepository;
    private final MatchingEventPublisher eventPublisher;
    private final WebClient webClient;

    @Value("${services.startup-application.url}")
    private String startupServiceUrl;

    @Override
    @CacheEvict(value = {"matches-investor", "matches-startup"}, allEntries = true)
    public void runMatching(Long startupExecutionId, Long startupUserId) {
        try {

            updateStartupExecutionStatus(startupExecutionId, "APPROVED");

            StartupExecutionDTO startup = fetchStartupExecution(startupExecutionId);
            if (startup == null) {
                log.error("[Matching] Could not fetch startup execution id={}", startupExecutionId);
                return;
            }

            List<InvestorExecutionDTO> investors = fetchAllInvestorExecutions();
            if (investors == null || investors.isEmpty()) {
                log.warn("[Matching] No investor executions found");
                return;
            }

            Set<Long> alreadyMatched = matchRepository.findMatchedInvestorExecutionIds(startupExecutionId);

            List<InvestorMatch> toSave = new ArrayList<>();
            for (InvestorExecutionDTO investor : investors) {
                if (!"PENDING".equals(investor.getStatus())) continue;
                if (alreadyMatched.contains(investor.getId())) continue;

                double score = computeMatchScore(startup, investor);

                if (score >= 50.0) {
                    String reason = buildMatchReason(startup, investor, score);

                    InvestorMatch match = new InvestorMatch();
                    match.setStartupExecutionId(startupExecutionId);
                    match.setStartupUserId(startupUserId);
                    match.setInvestorExecutionId(investor.getId());
                    match.setInvestorUserId(investor.getUserId());
                    match.setMatchScore(score);
                    match.setMatchReason(reason);
                    match.setStatus(MatchStatus.MATCHED);

                    toSave.add(match);
                }
            }

            List<InvestorMatch> matches = matchRepository.saveAll(toSave);

            if (!matches.isEmpty()) {
                updateStartupExecutionStatus(startupExecutionId, "MATCHED");

                for (InvestorMatch match : matches) {
                    updateInvestorExecutionStatus(match.getInvestorExecutionId(), "MATCHED");

                    eventPublisher.publishMatchFound(
                            match.getId(),
                            match.getStartupExecutionId(),
                            match.getInvestorExecutionId());

                    eventPublisher.publishMatchPresentedToInvestor(
                            match.getId(),
                            match.getInvestorUserId(),
                            match.getStartupExecutionId(),
                            match.getStartupUserId(),
                            startup.getIndustry());

                    eventPublisher.publishMatchPresentedToStartup(
                            match.getId(),
                            match.getStartupUserId(),
                            match.getInvestorExecutionId(),
                            match.getInvestorUserId(),
                            startup.getIndustry());
                }

                log.info("[Matching] {} match(es) found for startupExecutionId={}", matches.size(), startupExecutionId);
            } else {
                log.info("[Matching] No matches found for startupExecutionId={}", startupExecutionId);
            }

        } catch (Exception e) {
            log.error("[Matching] Error during matching for executionId={}: {}", startupExecutionId, e.getMessage());
        }
    }

    @Override
    public void markStartupRejected(Long executionId) {
        updateStartupExecutionStatus(executionId, "REJECTED");
    }

    @Override
    @CacheEvict(value = {"matches-investor", "matches-startup"}, allEntries = true)
    public void runMatchingForNewInvestor(Long investorExecutionId, Long investorUserId) {
        try {
            InvestorExecutionDTO investor = fetchInvestorExecution(investorExecutionId);
            if (investor == null) {
                log.error("[Matching] Could not fetch investor execution id={}", investorExecutionId);
                return;
            }

            if (!"PENDING".equals(investor.getStatus())) {
                log.info("[Matching] Investor execution {} is not PENDING, skipping", investorExecutionId);
                return;
            }

            List<StartupExecutionDTO> startups = fetchAllStartupExecutions();
            if (startups == null || startups.isEmpty()) {
                log.warn("[Matching] No startup executions found");
                return;
            }

            Set<Long> alreadyMatched = matchRepository.findMatchedStartupExecutionIds(investorExecutionId);

            List<InvestorMatch> toSave = new ArrayList<>();
            for (StartupExecutionDTO startup : startups) {
                // Only match against startups that have been approved by an evaluator
                if (!"APPROVED".equals(startup.getStatus())) continue;
                if (alreadyMatched.contains(startup.getId())) continue;

                double score = computeMatchScore(startup, investor);

                if (score >= 50.0) {
                    String reason = buildMatchReason(startup, investor, score);

                    InvestorMatch match = new InvestorMatch();
                    match.setStartupExecutionId(startup.getId());
                    match.setStartupUserId(startup.getUserId());
                    match.setInvestorExecutionId(investorExecutionId);
                    match.setInvestorUserId(investorUserId);
                    match.setMatchScore(score);
                    match.setMatchReason(reason);
                    match.setStatus(MatchStatus.MATCHED);

                    toSave.add(match);
                }
            }

            List<InvestorMatch> matches = matchRepository.saveAll(toSave);

            if (!matches.isEmpty()) {
                updateInvestorExecutionStatus(investorExecutionId, "MATCHED");

                java.util.Map<Long, String> startupIndustryMap = startups.stream()
                        .filter(s -> s.getId() != null)
                        .collect(java.util.stream.Collectors.toMap(
                                StartupExecutionDTO::getId,
                                s -> s.getIndustry() != null ? s.getIndustry() : "",
                                (a, b) -> a));

                for (InvestorMatch match : matches) {
                    updateStartupExecutionStatus(match.getStartupExecutionId(), "MATCHED");

                    String industry = startupIndustryMap.getOrDefault(match.getStartupExecutionId(), "");

                    eventPublisher.publishMatchFound(
                            match.getId(),
                            match.getStartupExecutionId(),
                            match.getInvestorExecutionId());

                    eventPublisher.publishMatchPresentedToInvestor(
                            match.getId(),
                            match.getInvestorUserId(),
                            match.getStartupExecutionId(),
                            match.getStartupUserId(),
                            industry);

                    eventPublisher.publishMatchPresentedToStartup(
                            match.getId(),
                            match.getStartupUserId(),
                            match.getInvestorExecutionId(),
                            match.getInvestorUserId(),
                            industry);
                }

                log.info("[Matching] {} match(es) found for investorExecutionId={}", matches.size(), investorExecutionId);
            } else {
                log.info("[Matching] No matches found for investorExecutionId={}", investorExecutionId);
            }

        } catch (Exception e) {
            log.error("[Matching] Error during matching for investorExecutionId={}: {}", investorExecutionId, e.getMessage());
        }
    }

    @Override
    public void runMatchingForAll() {
        log.info("[Matching] Starting full catch-up matching run...");
        try {
            List<StartupExecutionDTO> startups = fetchAllStartupExecutions();
            if (startups == null || startups.isEmpty()) {
                log.warn("[Matching] No startup executions found during full run");
                return;
            }

            for (StartupExecutionDTO startup : startups) {
                if (startup.getId() == null || startup.getUserId() == null) continue;
                // Only re-run matching for approved startups that haven't matched yet
                if (!"APPROVED".equals(startup.getStatus())) continue;
                runMatching(startup.getId(), startup.getUserId());
            }

            log.info("[Matching] Full catch-up run completed for {} startups", startups.size());
        } catch (Exception e) {
            log.error("[Matching] Error during full matching run: {}", e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "matches-investor", key = "#investorUserId")
    public List<MatchResponse> getMatchesForInvestor(Long investorUserId) {
        return matchRepository.findByInvestorUserId(investorUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "matches-startup", key = "#startupUserId")
    public List<MatchResponse> getMatchesForStartup(Long startupUserId) {
        return matchRepository.findByStartupUserId(startupUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<MatchResponse> getAllMatches() {
        return matchRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private double computeMatchScore(StartupExecutionDTO startup, InvestorExecutionDTO investor) {
        double score = 0.0;

        if (startup.getIndustry() != null && investor.getPreferredIndustry() != null) {
            if (startup.getIndustry().equalsIgnoreCase(investor.getPreferredIndustry())) {
                score += 50.0;
            } else if (startup.getIndustry().toLowerCase()
                    .contains(investor.getPreferredIndustry().toLowerCase()) ||
                    investor.getPreferredIndustry().toLowerCase()
                            .contains(startup.getIndustry().toLowerCase())) {
                score += 25.0;
            }
        }

        if (startup.getFundingNeeded() != null && investor.getInvestmentBudget() != null) {
            double funding  = startup.getFundingNeeded();
            double budget   = investor.getInvestmentBudget();

            if (funding <= budget) {
                double ratio = funding / budget;
                if (ratio >= 0.5) {
                    score += 50.0;
                } else {
                    score += 25.0;
                }
            }
        }

        return Math.min(score, 100.0);
    }

    private String buildMatchReason(StartupExecutionDTO startup, InvestorExecutionDTO investor, double score) {
        StringBuilder reason = new StringBuilder();
        reason.append("Match score: ").append(String.format("%.1f", score)).append("/100. ");

        if (startup.getIndustry() != null && investor.getPreferredIndustry() != null &&
                startup.getIndustry().equalsIgnoreCase(investor.getPreferredIndustry())) {
            reason.append("Industry alignment: both in ").append(startup.getIndustry()).append(". ");
        }

        if (startup.getFundingNeeded() != null && investor.getInvestmentBudget() != null &&
                startup.getFundingNeeded() <= investor.getInvestmentBudget()) {
            reason.append("Funding compatible: startup needs $")
                    .append(String.format("%.0f", startup.getFundingNeeded()))
                    .append(", investor budget is $")
                    .append(String.format("%.0f", investor.getInvestmentBudget()))
                    .append(".");
        }

        return reason.toString();
    }

    private List<StartupExecutionDTO> fetchAllStartupExecutions() {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(startupServiceUrl + "/api/executions/startup/internal/all")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || response.get("data") == null) return List.of();

            List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.get("data");
            List<StartupExecutionDTO> result = new ArrayList<>();

            for (Map<String, Object> data : dataList) {
                StartupExecutionDTO dto = new StartupExecutionDTO();
                dto.setId(toLong(data.get("id")));
                dto.setUserId(toLong(data.get("userId")));
                dto.setTargetCompanySize(str(data.get("targetCompanySize")));
                dto.setProblemStatement(str(data.get("problemStatement")));
                dto.setBusinessModel(str(data.get("businessModel")));
                dto.setTargetMarket(str(data.get("targetMarket")));
                dto.setTeamDetails(str(data.get("teamDetails")));
                dto.setAnnualRevenue(toDouble(data.get("annualRevenue")));
                dto.setMonthlyBurnRate(toDouble(data.get("monthlyBurnRate")));
                dto.setFundingNeeded(toDouble(data.get("fundingNeeded")));
                dto.setIndustry(str(data.get("industry")));
                dto.setStatus(str(data.get("status")));
                result.add(dto);
            }

            return result;

        } catch (Exception e) {
            log.error("[Matching] Failed to fetch all startup executions: {}", e.getMessage());
            return List.of();
        }
    }

    private InvestorExecutionDTO fetchInvestorExecution(Long executionId) {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(startupServiceUrl + "/api/executions/investor/internal/all")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || response.get("data") == null) return null;

            List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.get("data");

            for (Map<String, Object> data : dataList) {
                Long id = toLong(data.get("id"));
                if (!executionId.equals(id)) continue;

                InvestorExecutionDTO dto = new InvestorExecutionDTO();
                dto.setId(id);
                dto.setUserId(toLong(data.get("userId")));
                dto.setPreferredIndustry(str(data.get("preferredIndustry")));
                dto.setInvestmentReason(str(data.get("investmentReason")));
                dto.setInvestmentBudget(toDouble(data.get("investmentBudget")));
                dto.setExpectedReturnTimeline(str(data.get("expectedReturnTimeline")));
                dto.setSuccessCriteria(str(data.get("successCriteria")));
                dto.setAdditionalConsiderations(str(data.get("additionalConsiderations")));
                dto.setStatus(str(data.get("status")));
                return dto;
            }

            return null;

        } catch (Exception e) {
            log.error("[Matching] Failed to fetch investor execution {}: {}", executionId, e.getMessage());
            return null;
        }
    }

    private StartupExecutionDTO fetchStartupExecution(Long executionId) {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(startupServiceUrl + "/api/executions/startup/internal/" + executionId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || response.get("data") == null) return null;

            Map<String, Object> data = (Map<String, Object>) response.get("data");
            StartupExecutionDTO dto = new StartupExecutionDTO();
            dto.setId(executionId);
            dto.setUserId(toLong(data.get("userId")));
            dto.setTargetCompanySize(str(data.get("targetCompanySize")));
            dto.setProblemStatement(str(data.get("problemStatement")));
            dto.setBusinessModel(str(data.get("businessModel")));
            dto.setTargetMarket(str(data.get("targetMarket")));
            dto.setTeamDetails(str(data.get("teamDetails")));
            dto.setAnnualRevenue(toDouble(data.get("annualRevenue")));
            dto.setMonthlyBurnRate(toDouble(data.get("monthlyBurnRate")));
            dto.setFundingNeeded(toDouble(data.get("fundingNeeded")));
            dto.setIndustry(str(data.get("industry")));
            dto.setStatus(str(data.get("status")));
            return dto;

        } catch (Exception e) {
            log.error("[Matching] Failed to fetch startup execution {}: {}", executionId, e.getMessage());
            return null;
        }
    }

    private List<InvestorExecutionDTO> fetchAllInvestorExecutions() {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(startupServiceUrl + "/api/executions/investor/all")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || response.get("data") == null) return List.of();

            List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.get("data");
            List<InvestorExecutionDTO> result = new ArrayList<>();

            for (Map<String, Object> data : dataList) {
                InvestorExecutionDTO dto = new InvestorExecutionDTO();
                dto.setId(toLong(data.get("id")));
                dto.setUserId(toLong(data.get("userId")));
                dto.setPreferredIndustry(str(data.get("preferredIndustry")));
                dto.setInvestmentReason(str(data.get("investmentReason")));
                dto.setInvestmentBudget(toDouble(data.get("investmentBudget")));
                dto.setExpectedReturnTimeline(str(data.get("expectedReturnTimeline")));
                dto.setSuccessCriteria(str(data.get("successCriteria")));
                dto.setAdditionalConsiderations(str(data.get("additionalConsiderations")));
                dto.setStatus(str(data.get("status")));
                result.add(dto);
            }

            return result;

        } catch (Exception e) {
            log.error("[Matching] Failed to fetch investor executions: {}", e.getMessage());
            return List.of();
        }
    }

    private void updateStartupExecutionStatus(Long executionId, String status) {
        try {
            webClient.patch()
                    .uri(startupServiceUrl + "/api/executions/startup/internal/" + executionId + "/status?status=" + status)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            log.info("[Matching] Updated startup execution {} to {}", executionId, status);
        } catch (Exception e) {
            log.error("[Matching] Failed to update startup execution status {}: {}", executionId, e.getMessage());
        }
    }

    private void updateInvestorExecutionStatus(Long executionId, String status) {
        try {
            webClient.patch()
                    .uri(startupServiceUrl + "/api/executions/investor/internal/" + executionId + "/status?status=" + status)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            log.info("[Matching] Updated investor execution {} to {}", executionId, status);
        } catch (Exception e) {
            log.error("[Matching] Failed to update investor execution status {}: {}", executionId, e.getMessage());
        }
    }

    private MatchResponse toResponse(InvestorMatch m) {
        MatchResponse r = new MatchResponse();
        r.setId(m.getId());
        r.setStartupExecutionId(m.getStartupExecutionId());
        r.setStartupUserId(m.getStartupUserId());
        r.setInvestorExecutionId(m.getInvestorExecutionId());
        r.setInvestorUserId(m.getInvestorUserId());
        r.setMatchScore(m.getMatchScore());
        r.setMatchReason(m.getMatchReason());
        r.setStatus(m.getStatus());
        r.setMatchedAt(m.getMatchedAt());
        return r;
    }

    private String str(Object val) {
        return val != null ? val.toString() : null;
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof Long) return (Long) val;
        return Long.parseLong(val.toString());
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Integer) return ((Integer) val).doubleValue();
        if (val instanceof Double) return (Double) val;
        return Double.parseDouble(val.toString());
    }
}