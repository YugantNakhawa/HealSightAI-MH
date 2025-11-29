package com.myproject.controller;

import com.myproject.dto.RealTimeData;
import com.myproject.service.RealTimeService;
import com.myproject.service.PredictorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private PredictorService predictorService;

    @Autowired
    private RealTimeService realTimeService;   // <-- NEW

    @GetMapping("/predict")
    public Mono<Object> testPrediction() {

        // fetch real-time temperature + AQI
        RealTimeData liveData = realTimeService.getRealtimeData();

        // pass realtime data into predictor
        return predictorService.predictNow(liveData);
    }
    
    @GetMapping("/predict7")
    public Mono<Object> predict7() {

        // fetch real-time temperature + AQI
        RealTimeData liveData = realTimeService.getRealtimeData();

        // pass realtime data into predictor
        return predictorService.predict7Days(liveData);
    }
    
    @GetMapping("/realtime")
    public RealTimeData getRealtime() {
        return realTimeService.getRealtimeData();
    }
}
