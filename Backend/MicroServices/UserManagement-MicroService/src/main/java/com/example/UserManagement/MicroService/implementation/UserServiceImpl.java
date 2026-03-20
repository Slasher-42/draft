package com.example.UserManagement.MicroService.implementation;

import com.example.UserManagement.MicroService.dto.request.ChangePasswordRequest;
import com.example.UserManagement.MicroService.dto.request.UpdateUserRequest;
import com.example.UserManagement.MicroService.dto.response.UserResponse;
import com.example.UserManagement.MicroService.enums.RoleType;
import com.example.UserManagement.MicroService.exception.DuplicateResourceException;
import com.example.UserManagement.MicroService.exception.ResourceNotFoundException;
import com.example.UserManagement.MicroService.exception.UnauthorizedException;
import com.example.UserManagement.MicroService.kafka.events.UserStatusChangedEvent;
import com.example.UserManagement.MicroService.kafka.publisher.UserEventPublisher;
import com.example.UserManagement.MicroService.mapper.UserMapper;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.UserRepository;
import com.example.UserManagement.MicroService.service.S3Service;
import com.example.UserManagement.MicroService.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEventPublisher userEventPublisher;
    private final S3Service s3Service;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           UserEventPublisher userEventPublisher,
                           S3Service s3Service) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userEventPublisher = userEventPublisher;
        this.s3Service = s3Service;
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserMapper.toResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getUsersByRole(String role) {
        RoleType roleType = RoleType.valueOf(role.toUpperCase());
        return userRepository.findByRoleName(roleType)
                .stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new UnauthorizedException("Caller not found"));

        boolean isAdmin = caller.getRole().getName().name().equals("ADMIN");
        if (!isAdmin && !caller.getId().equals(id)) {
            throw new UnauthorizedException("You can only update your own account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getPhoneNumber() != null
                && !request.getPhoneNumber().equals(user.getPhoneNumber())
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already in use");
        }

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        userRepository.save(user);
        return UserMapper.toResponse(user);
    }

    @Override
    public void changePassword(Long id, ChangePasswordRequest request, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new UnauthorizedException("Caller not found"));

        if (!caller.getId().equals(id)) {
            throw new UnauthorizedException("You can only change your own password");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), caller.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        caller.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(caller);
    }

    @Override
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        userEventPublisher.publishUserStatusChanged(new UserStatusChangedEvent(
                user.getId(),
                user.getEmail(),
                user.isEnabled(),
                java.time.LocalDateTime.now()
        ));
    }
    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    @Override
    public UserResponse uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getProfilePictureUrl() != null) {
            s3Service.deleteByUrl(user.getProfilePictureUrl());
        }

        String url = s3Service.uploadProfilePicture(userId, file);
        user.setProfilePictureUrl(url);
        userRepository.save(user);

        return UserMapper.toResponse(user);
    }
}