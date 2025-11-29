package com.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.myproject.model.Vendor;
import com.myproject.repository.VendorRepository;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "*")
public class VendorController {

    @Autowired
    private VendorRepository vendorRepo;

    // 🔹 Get all vendors
    @GetMapping
    public List<Vendor> getAllVendors() {
        return vendorRepo.findAll();
    }

    // 🔹 Add vendor
    @PostMapping
    public Vendor addVendor(@RequestBody Vendor vendor) {
        return vendorRepo.save(vendor);
    }

    // 🔹 Update vendor
    @PutMapping("/{id}")
    public Vendor updateVendor(@PathVariable Long id, @RequestBody Vendor updated) {
        return vendorRepo.findById(id).map(v -> {
            v.setContactPerson(updated.getContactPerson());
            v.setPhone(updated.getPhone());
            v.setEmail(updated.getEmail());
            v.setAddress(updated.getAddress());
            return vendorRepo.save(v);
        }).orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    // 🔹 Delete vendor
    @DeleteMapping("/{id}")
    public String deleteVendor(@PathVariable Long id) {
        vendorRepo.deleteById(id);
        return "Vendor removed successfully.";
    }
}
