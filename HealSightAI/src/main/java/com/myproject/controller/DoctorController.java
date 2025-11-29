package com.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.model.Advisory;
import com.myproject.model.Patient;
import com.myproject.repository.AdvisoryRepository;
import com.myproject.repository.PatientRepository;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    @Autowired
    private PatientRepository patientRepo;

    @Autowired
    private AdvisoryRepository advisoryRepo;

    @GetMapping("/patients")
    public List<Patient> getAllPatients() {
        return patientRepo.findAll();
    }

    @PostMapping("/advisory")
    public Advisory createAdvisory(@RequestBody Advisory advisory) {
        return advisoryRepo.save(advisory);
    }
}
