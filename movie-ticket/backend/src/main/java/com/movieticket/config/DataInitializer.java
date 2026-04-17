package com.movieticket.config;

import com.movieticket.entity.User;
import com.movieticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        // Tự động gỡ bỏ check constraint cũ nếu tồn tại để tránh lỗi Enum update
        try {
            jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT CONSTRAINT_A6");
            log.info("Successfully dropped legacy constraint CONSTRAINT_A6 from bookings table");
        } catch (Exception e) {
            // Constraint có thể đã được xóa hoặc tên khác, bỏ qua lỗi
            log.debug("Nghiệm thu: Constraint CONSTRAINT_A6 không tồn tại hoặc đã được gỡ bỏ trước đó.");
        }

        if (!userRepository.existsByEmail("admin@movieticket.com")) {
            User admin = User.builder()
                    .email("admin@movieticket.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Administrator")
                    .phone("0900000000")
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default admin user: admin@movieticket.com / admin123");
        } else {
            log.info("Admin user already exists, skipping initialization");
        }
    }
}
