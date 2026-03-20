package com.example.UserManagement.MicroService.implementation;

import com.example.UserManagement.MicroService.dto.request.EvaluatorProfileRequest;
import com.example.UserManagement.MicroService.exception.ResourceNotFoundException;
import com.example.UserManagement.MicroService.model.EvaluatorProfile;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.EvaluatorProfileRepository;
import com.example.UserManagement.MicroService.repository.UserRepository;
import com.example.UserManagement.MicroService.service.EvaluatorProfileService;
import org.springframework.stereotype.Service;

@Service
public class EvaluatorProfileServiceImpl implements EvaluatorProfileService {

    private final EvaluatorProfileRepository evaluatorProfileRepository;
    private final UserRepository userRepository;

    public EvaluatorProfileServiceImpl(EvaluatorProfileRepository evaluatorProfileRepository,
                                       UserRepository userRepository) {
        this.evaluatorProfileRepository = evaluatorProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public EvaluatorProfile createOrUpdateProfile(Long userId, EvaluatorProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        EvaluatorProfile profile = evaluatorProfileRepository.findByUserId(userId)
                .orElse(new EvaluatorProfile());

        profile.setDepartment(request.getDepartment());
        profile.setSpecialization(request.getSpecialization());
        profile.setCountry(request.getCountry());
        profile.setCity(request.getCity());
        profile.setUser(user);

        return evaluatorProfileRepository.save(profile);
    }

    @Override
    public EvaluatorProfile getProfileByUserId(Long userId) {
        return evaluatorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluator profile not found for user id: " + userId));
    }
}