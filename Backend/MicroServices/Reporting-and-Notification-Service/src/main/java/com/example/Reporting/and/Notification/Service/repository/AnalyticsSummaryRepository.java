package com.example.Reporting.and.Notification.Service.repository;

import com.example.Reporting.and.Notification.Service.model.AnalyticsSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalyticsSummaryRepository extends JpaRepository<AnalyticsSummary, Long> {

    Optional<AnalyticsSummary> findTopByOrderByIdAsc();
}