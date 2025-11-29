package com.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.model.Patient;
import com.myproject.repository.PatientRepository;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientRepository patientRepo;

    // 🔹 Get all patients
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepo.findAll();
    }

    // 🔹 Get patients by doctor
    @GetMapping("/doctor/{doctorName}")
    public List<Patient> getPatientsByDoctor(@PathVariable String doctorName) {
        return patientRepo.findByDoctorName(doctorName);
    }

    // 🔹 Add new patient
    @PostMapping
    public Patient addPatient(@RequestBody Patient patient) {
        return patientRepo.save(patient);
    }

    // 🔹 Update patient
    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @RequestBody Patient updated) {
        return patientRepo.findById(id).map(p -> {
            p.setStatus(updated.getStatus());
            p.setDischargedAt(updated.getDischargedAt());
            return patientRepo.save(p);
        }).orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // 🔹 Delete patient
    @DeleteMapping("/{id}")
    public String deletePatient(@PathVariable Long id) {
        patientRepo.deleteById(id);
        return "Patient record deleted successfully.";
    }
}
