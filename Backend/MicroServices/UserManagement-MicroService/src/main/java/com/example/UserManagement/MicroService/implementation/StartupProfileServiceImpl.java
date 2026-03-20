package com.example.UserManagement.MicroService.implementation;

import com.example.UserManagement.MicroService.dto.request.StartupProfileRequest;
import com.example.UserManagement.MicroService.exception.ResourceNotFoundException;
import com.example.UserManagement.MicroService.mapper.ProfileMapper;
import com.example.UserManagement.MicroService.model.StartupProfile;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.StartupProfileRepository;
import com.example.UserManagement.MicroService.repository.UserRepository;
import com.example.UserManagement.MicroService.service.StartupProfileService;
import org.springframework.stereotype.Service;

@Service
public class StartupProfileServiceImpl implements StartupProfileService {

    private final StartupProfileRepository startupProfileRepository;
    private final UserRepository userRepository;

    public StartupProfileServiceImpl(StartupProfileRepository startupProfileRepository, UserRepository userRepository) {
        this.startupProfileRepository = startupProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StartupProfile createOrUpdateProfile(Long userId, StartupProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StartupProfile profile = startupProfileRepository.findByUserId(userId)
                .orElse(ProfileMapper.toStartupProfile(request));

        profile.setCompanyName(request.getCompanyName());
        profile.setIndustry(request.getIndustry());
        profile.setDescription(request.getDescription());
        profile.setFoundedYear(request.getFoundedYear());
        profile.setTeamSize(request.getTeamSize());
        profile.setWebsite(request.getWebsite());
        profile.setCountry(request.getCountry());
        profile.setCity(request.getCity());
        profile.setFundingNeeded(request.getFundingNeeded());
        profile.setUser(user);

        return startupProfileRepository.save(profile);
    }

    @Override
    public StartupProfile getProfileByUserId(Long userId) {
        return startupProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup profile not found for user id: " + userId));
    }
}