package com.example.Reporting.and.Notification.Service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WithholdNoticeRequest {

    @NotNull(message = "Investor user ID is required")
    private Long investorUserId;

    @NotNull(message = "Startup user ID is required")
    private Long startupUserId;

    @NotNull(message = "Execution ID is required")
    private Long executionId;

    @NotBlank(message = "Investor name is required")
    private String investorName;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String executionTitle;

    // Render's proxy strips the Authorization/X-Token headers before they reach this
    // service, so the frontend sends the caller's JWT in the body instead — request
    // bodies pass through proxies untouched. Validated manually in the controller.
    private String token;
}
