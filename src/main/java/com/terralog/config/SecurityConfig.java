package com.terralog.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Integrasikan CORS filter yang kita buat di bawah ke dalam security chain
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. Matikan CSRF agar request POST dari React tidak di-block dan menghasilkan 405
            .csrf(csrf -> csrf.disable()) 
            
            // 3. Atur Hak Akses URL Endpoint
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // Buka akses login & register
                .requestMatchers("/api/jadwal/**").permitAll() // Buka akses jadwal
                .anyRequest().permitAll()                      // Izinkan rute lainnya sementara
            );
            
        return http.build();
    }

    // Pemindahan logic WebConfig ke dalam Security internal
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // Aturan allowedOriginPatterns kamu
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Terapkan ke semua endpoint
        return source;
    }

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> privateNetworkAccessCorsFilter() {
        OncePerRequestFilter filter = new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(
                    HttpServletRequest request,
                    HttpServletResponse response,
                    FilterChain filterChain
            ) throws ServletException, IOException {
                String pna = request.getHeader("Access-Control-Request-Private-Network");
                if ("true".equalsIgnoreCase(pna)) {
                    response.setHeader("Access-Control-Allow-Private-Network", "true");
                }
                filterChain.doFilter(request, response);
            }
        };

        FilterRegistrationBean<OncePerRequestFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
