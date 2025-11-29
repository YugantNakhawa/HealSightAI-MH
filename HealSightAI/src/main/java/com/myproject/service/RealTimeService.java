package com.myproject.service;

import com.myproject.dto.RealTimeData;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class RealTimeService {

    private final String OPENWEATHER_API_KEY = "2436fc2937398de358cffa671a74246d";
    private final String WAQI_TOKEN = "fcfb757b105cfefb8173055e787fef9126f1776e";
    private final String CITY = "mumbai";

    private final WebClient webClient = WebClient.create();
    
    private Double convertToDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof Double) return (Double) value;
        return null;
    }


    public RealTimeData getRealtimeData() {

        // ------------------ TEMPERATURE API ------------------
        String weatherUrl = String.format(
                "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric",
                CITY, OPENWEATHER_API_KEY
        );

        Map<String, Object> weather = webClient.get()
                .uri(weatherUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        double temp = ((Map<String, Double>) weather.get("main")).get("temp");
        String condition = (String) ((Map<String, Object>) ((java.util.ArrayList<?>) weather.get("weather")).get(0)).get("description");

        // ------------------ AQI API ------------------
        String aqiUrl = String.format(
                "https://api.waqi.info/feed/%s/?token=%s",
                CITY, WAQI_TOKEN
        );

        Map<String, Object> aqiResponse = webClient.get()
                .uri(aqiUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        Map<String, Object> data = (Map<String, Object>) aqiResponse.get("data");

        int aqi = (Integer) data.get("aqi");

        Map<String, Object> iaqi = (Map<String, Object>) data.get("iaqi");
        Object pm25Obj = iaqi.get("pm25") != null ? ((Map<String, Object>) iaqi.get("pm25")).get("v") : null;
        Object pm10Obj = iaqi.get("pm10") != null ? ((Map<String, Object>) iaqi.get("pm10")).get("v") : null;

        Double pm25 = convertToDouble(pm25Obj);
        Double pm10 = convertToDouble(pm10Obj);


        // ------------------ MERGED RESPONSE ------------------
        return new RealTimeData(
                CITY,
                temp,
                condition,
                aqi,
                pm25,
                pm10
        );
    }
}
