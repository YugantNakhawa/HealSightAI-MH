package com.myproject.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

@Service
public class PredictionService {

    public String runDailyAgent() {
        // Simulate AI agent workflow
        return """
            ✅ Morning Trigger @ %s
            - Checked pollution + festivals
            - Predicted patient surge: 22%%
            - Triggered staff planner update
            - Alert sent to admin dashboard
            """.formatted(LocalDateTime.now());
    }
}
