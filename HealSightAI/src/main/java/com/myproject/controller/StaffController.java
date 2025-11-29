package com.myproject.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.model.Appointment;
import com.myproject.model.InventoryItem;
import com.myproject.repository.AppointmentRepository;
import com.myproject.repository.InventoryRepository;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    @Autowired
    private InventoryRepository inventoryRepo;

    @Autowired
    private AppointmentRepository appointmentRepo;

    // ✅ Get all appointments
    @GetMapping("/appointments")
    public List<Appointment> getAppointments() {
        return appointmentRepo.findAll();
    }

    // ✅ Update status
    @PutMapping("/appointments/{id}")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Appointment appt = appointmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus(body.get("status"));
        return appointmentRepo.save(appt);
    }

    // ✅ Optional: Add new appointment
    @PostMapping("/appointments")
    public Appointment addAppointment(@RequestBody Appointment appt) {
        return appointmentRepo.save(appt);
    }

    @GetMapping("/inventory")
    public List<InventoryItem> getInventory() {
        return inventoryRepo.findAll();
    }

    @PostMapping("/inventory")
    public InventoryItem addItem(@RequestBody InventoryItem item) {
        return inventoryRepo.save(item);
    }
}
