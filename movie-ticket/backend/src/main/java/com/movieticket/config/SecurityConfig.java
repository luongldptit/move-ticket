package com.movieticket.config;

import com.movieticket.security.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .headers(headers -> headers.frameOptions(frame -> frame.disable())) // Allow H2 console
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // H2 Console
                .requestMatchers("/h2-console/**").permitAll()
                // Public endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/movies/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/genres/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/cinemas/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/rooms/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/showtimes/**").permitAll()
                .requestMatchers("/api/v1/payments/callback").permitAll()

                // Customer endpoints
                .requestMatchers("/api/v1/bookings/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/payments/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                .requestMatchers("/api/v1/promotions/validate").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                .requestMatchers("/api/v1/users/me").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")

                // Staff endpoints
                .requestMatchers("/api/v1/bookings/verify/**").hasAnyRole("STAFF", "ADMIN")

                // Admin endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/movies/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/v1/movies/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/movies/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/cinemas/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/cinemas/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/rooms/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/rooms/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/showtimes/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/v1/showtimes/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/showtimes/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
