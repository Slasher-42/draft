package com.example.UserManagement.MicroService.implementation;

import com.example.UserManagement.MicroService.dto.request.InvestorProfileRequest;
import com.example.UserManagement.MicroService.exception.ResourceNotFoundException;
import com.example.UserManagement.MicroService.mapper.ProfileMapper;
import com.example.UserManagement.MicroService.model.InvestorProfile;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.InvestorProfileRepository;
import com.example.UserManagement.MicroService.repository.UserRepository;
import com.example.UserManagement.MicroService.service.InvestorProfileService;
import org.springframework.stereotype.Service;

@Service
public class InvestorProfileServiceImpl implements InvestorProfileService {

    private final InvestorProfileRepository investorProfileRepository;
    private final UserRepository userRepository;

    public InvestorProfileServiceImpl(InvestorProfileRepository investorProfileRepository, UserRepository userRepository) {
        this.investorProfileRepository = investorProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public InvestorProfile createOrUpdateProfile(Long userId, InvestorProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        InvestorProfile profile = investorProfileRepository.findByUserId(userId)
                .orElse(ProfileMapper.toInvestorProfile(request));

        profile.setOrganizationName(request.getOrganizationName());
        profile.setPreferredIndustry(request.getPreferredIndustry());
        profile.setInvestmentBudget(request.getInvestmentBudget());
        profile.setCountry(request.getCountry());
        profile.setCity(request.getCity());
        profile.setUser(user);

        return investorProfileRepository.save(profile);
    }

    @Override
    public InvestorProfile getProfileByUserId(Long userId) {
        return investorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Investor profile not found for user id: " + userId));
    }
}