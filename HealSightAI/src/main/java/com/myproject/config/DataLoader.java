package com.myproject.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.myproject.model.User;
import com.myproject.repository.UserRepository;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner init(UserRepository userRepository) {
        return args -> {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            if (!userRepository.existsByEmail("admin@healsightai.com")) { //admin@healsightai.com
                User admin = new User();
                admin.setName("Super Admin");
                admin.setEmail("admin@healsightai.com");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("Admin");
                admin.setContact("9999999999");
                userRepository.save(admin);
            }

            if (!userRepository.existsByEmail("dr.mehta@healsightai.com")) {
                User dr = new User();
                dr.setName("Dr Mehta");
                dr.setEmail("dr.mehta@healsightai.com");
                dr.setPassword(encoder.encode("doctor123"));
                dr.setRole("Doctor");
                dr.setContact("8888888888");
                userRepository.save(dr);
            }

            if (!userRepository.existsByEmail("staff1@healsightai.com")) {
                User s = new User();
                s.setName("Staff One");
                s.setEmail("staff1@healsightai.com");
                s.setPassword(encoder.encode("staff123"));
                s.setRole("Staff");
                s.setContact("7777777777");
                userRepository.save(s);
            }
        };
    }
}
