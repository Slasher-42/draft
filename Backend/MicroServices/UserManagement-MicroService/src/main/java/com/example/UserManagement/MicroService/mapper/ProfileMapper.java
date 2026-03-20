package com.example.UserManagement.MicroService.mapper;

import com.example.UserManagement.MicroService.dto.request.InvestorProfileRequest;
import com.example.UserManagement.MicroService.dto.request.StartupProfileRequest;
import com.example.UserManagement.MicroService.model.InvestorProfile;
import com.example.UserManagement.MicroService.model.StartupProfile;

public class ProfileMapper {

    public static StartupProfile toStartupProfile(StartupProfileRequest request) {
        StartupProfile profile = new StartupProfile();
        profile.setCompanyName(request.getCompanyName());
        profile.setIndustry(request.getIndustry());
        profile.setDescription(request.getDescription());
        profile.setFoundedYear(request.getFoundedYear());
        profile.setTeamSize(request.getTeamSize());
        profile.setWebsite(request.getWebsite());
        profile.setCountry(request.getCountry());
        profile.setCity(request.getCity());
        profile.setFundingNeeded(request.getFundingNeeded());
        return profile;
    }

    public static InvestorProfile toInvestorProfile(InvestorProfileRequest request) {
        InvestorProfile profile = new InvestorProfile();
        profile.setOrganizationName(request.getOrganizationName());
        profile.setPreferredIndustry(request.getPreferredIndustry());
        profile.setInvestmentBudget(request.getInvestmentBudget());
        profile.setCountry(request.getCountry());
        profile.setCity(request.getCity());
        return profile;
    }
}