package com.myproject.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.service.PredictionService;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:3000")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @GetMapping("/daily")
    public String triggerDailyPrediction() {
        return predictionService.runDailyAgent();
    }
}
