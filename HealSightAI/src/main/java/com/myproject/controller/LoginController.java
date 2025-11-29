package com.myproject.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.*;

import com.myproject.model.User;
import com.myproject.security.JwtUtils;
import com.myproject.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class LoginController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    public LoginController(UserService userService, JwtUtils jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        Map<String, Object> resp = new HashMap<>();
        try {
            User saved = userService.registerUser(user);
            resp.put("status", "success");
            resp.put("message", "User registered");
            resp.put("user_id", saved.getUser_id());
        } catch (Exception ex) {
            resp.put("status", "error");
            resp.put("message", ex.getMessage());
        }
        return resp;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        Map<String, Object> resp = new HashMap<>();

        Optional<User> userOpt = userService.validateUser(email, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtUtils.generateToken(user.getUser_id(), user.getEmail(), user.getRole());
            resp.put("status", "success");
            resp.put("message", "Login successful");
            resp.put("token", token);
            resp.put("role", user.getRole());
            resp.put("email", user.getEmail());
            resp.put("user_id", user.getUser_id());
        } else {
            resp.put("status", "error");
            resp.put("message", "Invalid credentials");
        }
        return resp;
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        Map<String, Object> resp = new HashMap<>();
        Object uid = request.getAttribute("userId");
        if (uid == null) {
            resp.put("status", "error");
            resp.put("message", "Unauthorized");
            return resp;
        }
        Long userId = (Long) uid;
        Optional<User> opt = userService.findByEmail((String) request.getAttribute("email"));
        if (opt.isPresent()) {
            User u = opt.get();
            resp.put("status", "success");
            resp.put("user_id", u.getUser_id());
            resp.put("name", u.getName());
            resp.put("email", u.getEmail());
            resp.put("role", u.getRole());
            return resp;
        } else {
            resp.put("status", "error");
            resp.put("message", "User not found");
            return resp;
        }
    }
}
