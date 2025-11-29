package com.myproject.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncryptor {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("doctor123"));
        System.out.println(encoder.encode("admin123"));
        System.out.println(encoder.encode("staff123"));
    }
}

