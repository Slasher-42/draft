package com.example.UserManagement.MicroService;

import com.example.UserManagement.MicroService.enums.RoleType;
import com.example.UserManagement.MicroService.model.Role;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.RoleRepository;
import com.example.UserManagement.MicroService.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByName(roleType).isEmpty()) {
                Role role = new Role();
                role.setName(roleType);
                roleRepository.save(role);
            }
        }

        if (!userRepository.existsByEmail("cedrickngabo03@gmail.com")) {
            Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            User admin = new User();
            admin.setFullName("Cedrick Ngabo");
            admin.setEmail("cedrickngabo03@gmail.com");
            admin.setPassword(passwordEncoder.encode("Admin@1234"));
            admin.setRole(adminRole);
            admin.setEnabled(true);

            userRepository.save(admin);
        }
    }
}