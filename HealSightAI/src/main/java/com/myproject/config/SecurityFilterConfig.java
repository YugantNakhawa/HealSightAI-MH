//package com.myproject.config;
//
//import com.myproject.security.JwtFilter;
//import com.myproject.security.JwtUtils;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//
//import java.util.List;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityFilterConfig {
//
//    private final JwtUtils jwtUtils;
//
//    public SecurityFilterConfig(JwtUtils jwtUtils) {
//        this.jwtUtils = jwtUtils;
//    }
//
//    @Bean
//    public JwtFilter jwtFilter() {
//        return new JwtFilter(jwtUtils);
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                // ✅ Enable CORS so React can connect to backend
//                .cors(cors -> cors.configurationSource(request -> {
//                    CorsConfiguration config = new CorsConfiguration();
//                    config.setAllowedOrigins(List.of("http://localhost:3000")); // React app
//                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//                    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
//                    config.setAllowCredentials(true);
//                    return config;
//                }))
//                .csrf(csrf -> csrf.disable()) // disable CSRF for APIs
//                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        // ✅ Open endpoints (login, register, AI)
//                        .requestMatchers("/api/auth/**", "/api/ai/**").permitAll()
//                        // ✅ Allow OPTIONS for preflight
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                        // ✅ All others require JWT
//                        .anyRequest().authenticated()
//                )
//                // ✅ Attach your JwtFilter to security chain
//                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//
//    // Optional — useful if you add authentication providers later
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
//        return config.getAuthenticationManager();
//    }
//}
