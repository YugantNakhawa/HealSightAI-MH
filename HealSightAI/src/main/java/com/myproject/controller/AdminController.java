package com.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.model.Appointment;
import com.myproject.model.User;
import com.myproject.repository.AppointmentRepository;
import com.myproject.repository.UserRepository;
import com.myproject.service.PredictorService;


@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/user/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return "User deleted successfully";
    }

    @GetMapping("/doctors")
    public List<User> getAllDoctors() {
        return userRepository.findByRole("DOCTOR");
    }

    // ✅ List all staff
    @GetMapping("/staff")
    public List<User> getAllStaff() {
        return userRepository.findByRole("STAFF");
    }

    // ✅ Add a doctor
    @PostMapping("/doctors")
    public User addDoctor(@RequestBody User doctor) {
        doctor.setRole("DOCTOR");
        return userRepository.save(doctor);
    }

    // ✅ Add a staff member
    @PostMapping("/staff")
    public User addStaff(@RequestBody User staff) {
        staff.setRole("STAFF");
        return userRepository.save(staff);
    }

    // ✅ Add an appointment
    @PostMapping("/appointments")
    public Appointment addAppointment(@RequestBody Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

  
}
