package com.myproject.service;

import com.myproject.dto.RealTimeData;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class PredictorService {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("http://localhost:8000")   // Python ML model API
            .build();

    // Build the body your ML model expects
    private Map<String, Object> buildRequestBody(RealTimeData data) {

        LocalDate today = LocalDate.now();
        int dayOfWeek = today.getDayOfWeek().getValue();   // 1–7
        int isWeekend = (dayOfWeek == 6 || dayOfWeek == 7) ? 1 : 0;

        int weekOfYear = today.get(WeekFields.of(Locale.getDefault()).weekOfYear());

        Map<String, Object> body = new HashMap<>();
        body.put("day_of_week", dayOfWeek);
        body.put("is_weekend", isWeekend);
        body.put("festival_enc", 0);   // set if you add festival logic later
        body.put("is_festival", 0);

        body.put("aqi", data.getAqi());
        body.put("temperature_c", data.getTemperatureC());

        body.put("day", today.getDayOfMonth());
        body.put("month", today.getMonthValue());
        body.put("year", today.getYear());
        body.put("weekofyear", weekOfYear);

        return body;
    }

    public Mono<Object> predictNow(RealTimeData data) {
        Map<String, Object> body = buildRequestBody(data);

        return webClient.post()
                .uri("/predict")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Object.class);
    }

    public Mono<Object> predict7Days(RealTimeData data) {
        Map<String, Object> body = buildRequestBody(data);

        return webClient.post()
                .uri("/predict_week")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Object.class);
    }
    
    public Mono<Object> predictForDate(RealTimeData data, LocalDate date) {

        int dayOfWeek = date.getDayOfWeek().getValue();
        int isWeekend = (dayOfWeek == 6 || dayOfWeek == 7) ? 1 : 0;
        int weekOfYear = date.get(WeekFields.of(Locale.getDefault()).weekOfYear());

        Map<String, Object> body = new HashMap<>();
        body.put("day_of_week", dayOfWeek);
        body.put("is_weekend", isWeekend);
        body.put("festival_enc", 0);
        body.put("is_festival", 0);
        body.put("aqi", data.getAqi());
        body.put("temperature_c", data.getTemperatureC());

        body.put("day", date.getDayOfMonth());
        body.put("month", date.getMonthValue());
        body.put("year", date.getYear());
        body.put("weekofyear", weekOfYear);

        return webClient.post()
                .uri("/predict")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Object.class);
    }

}
