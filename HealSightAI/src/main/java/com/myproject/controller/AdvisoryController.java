package com.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.model.Advisory;
import com.myproject.repository.AdvisoryRepository;

@RestController
@RequestMapping("/api/advisories")
@CrossOrigin(origins = "*")
public class AdvisoryController {

    @Autowired
    private AdvisoryRepository advisoryRepo;

    // 🔹 Get all advisories
    @GetMapping
    public List<Advisory> getAllAdvisories() {
        return advisoryRepo.findAll();
    }

    // 🔹 Get advisories by doctor
    @GetMapping("/doctor/{doctorName}")
    public List<Advisory> getByDoctor(@PathVariable String doctorName) {
        return advisoryRepo.findByDoctorName(doctorName);
    }

    // 🔹 Add advisory (AI integration point)
    @PostMapping
    public Advisory addAdvisory(@RequestBody Advisory advisory) {
        // ✅ Optional: Call Python AI microservice here for insights
        // advisory.setAiInsight(aiService.getPrediction(advisory.getPatientName()));
        return advisoryRepo.save(advisory);
    }

    // 🔹 Delete advisory
    @DeleteMapping("/{id}")
    public String deleteAdvisory(@PathVariable Long id) {
        advisoryRepo.deleteById(id);
        return "Advisory deleted successfully.";
    }
}
