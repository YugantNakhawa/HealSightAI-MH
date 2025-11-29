package com.myproject.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.interfaces.DecodedJWT;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }



    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtils.validateToken(token)) {
                DecodedJWT jwt = jwtUtils.decodeToken(token);

                // Convert role to Spring authority
                String role = jwt.getClaim("role").asString();
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                // Create Authentication and set in SecurityContext
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                jwt.getSubject(), // userId or username
                                null,
                                Collections.singletonList(authority)
                        );
                SecurityContextHolder.getContext().setAuthentication(auth);

                // Optional: also keep request attributes for controllers
                request.setAttribute("userId", Long.parseLong(jwt.getSubject()));
                request.setAttribute("email", jwt.getClaim("email").asString());
                request.setAttribute("role", role);
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

}
