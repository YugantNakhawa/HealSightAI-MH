package com.myproject.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.model.ShiftPlan;
import com.myproject.repository.ShiftPlanRepository;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
public class ShiftPlanController {

    @Autowired
    private ShiftPlanRepository shiftRepo;

    // 🔹 Get all shift plans
    @GetMapping
    public List<ShiftPlan> getAllShifts() {
        return shiftRepo.findAll();
    }

    // 🔹 Get shifts for specific date
    @GetMapping("/date/{date}")
    public List<ShiftPlan> getByDate(@PathVariable String date) {
        return shiftRepo.findByDate(LocalDate.parse(date));
    }

    // 🔹 Add shift
    @PostMapping
    public ShiftPlan addShift(@RequestBody ShiftPlan shiftPlan) {
        return shiftRepo.save(shiftPlan);
    }

    // 🔹 Update shift
    @PutMapping("/{id}")
    public ShiftPlan updateShift(@PathVariable Long id, @RequestBody ShiftPlan updated) {
        return shiftRepo.findById(id).map(s -> {
            s.setShift(updated.getShift());
            s.setDepartment(updated.getDepartment());
            s.setAiRecommended(updated.isAiRecommended());
            return shiftRepo.save(s);
        }).orElseThrow(() -> new RuntimeException("Shift not found"));
    }

    // 🔹 Delete shift
    @DeleteMapping("/{id}")
    public String deleteShift(@PathVariable Long id) {
        shiftRepo.deleteById(id);
        return "Shift plan deleted.";
    }
}
