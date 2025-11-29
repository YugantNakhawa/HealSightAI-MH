package com.myproject.controller;

import com.myproject.dto.RealTimeData;
import com.myproject.service.RealTimeService;
import com.myproject.service.PredictorService;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private PredictorService predictorService;

    @Autowired
    private RealTimeService realTimeService;

    // ✔ Predict for today's date
    @GetMapping("/predict")
    public Mono<Object> testPrediction() {
        RealTimeData liveData = realTimeService.getRealtimeData();
        return predictorService.predictNow(liveData);
    }

    // ✔ Predict for next 7 days
    @GetMapping("/predict7")
    public Mono<Object> predict7() {
        RealTimeData liveData = realTimeService.getRealtimeData();
        return predictorService.predict7Days(liveData);
    }

    // ✔ Get realtime AQI + Temperature
    @GetMapping("/realtime")
    public RealTimeData getRealtime() {
        return realTimeService.getRealtimeData();
    }

    // ✔ NEW: Predict for chosen date
    @GetMapping("/predict-by-date")
    public Mono<Object> predictForDate(@RequestParam("date") String date) {

        LocalDate parsedDate = LocalDate.parse(date);
        RealTimeData liveData = realTimeService.getRealtimeData();

        return predictorService.predictForDate(liveData, parsedDate);
    }
}
