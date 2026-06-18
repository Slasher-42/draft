package com.example.StartupApplicationService.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WithholdRequest {

    @NotBlank(message = "A reason is required to withhold this execution")
    private String reason;
}
