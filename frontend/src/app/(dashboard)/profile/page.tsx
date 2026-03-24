"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Loader2, Save, User, Building2, MapPin, Globe, Users, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Common fields
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");

  // Startup profile fields
  const [companyName, setCompanyName] = useState(
    user?.startupProfile?.companyName ?? ""
  );
  const [industry, setIndustry] = useState(
    user?.startupProfile?.industry ?? ""
  );
  const [country, setCountry] = useState(
    user?.startupProfile?.country ??
      user?.investorProfile?.country ??
      user?.evaluatorProfile?.country ??
      ""
  );
  const [city, setCity] = useState(
    user?.startupProfile?.city ??
      user?.investorProfile?.city ??
      user?.evaluatorProfile?.city ??
      ""
  );
  const [website, setWebsite] = useState(
    user?.startupProfile?.website ?? ""
  );
  const [teamSize, setTeamSize] = useState(
    user?.startupProfile?.teamSize?.toString() ?? ""
  );
  const [foundedYear, setFoundedYear] = useState(
    user?.startupProfile?.foundedYear?.toString() ?? ""
  );

  // Investor profile fields
  const [organizationName, setOrganizationName] = useState(
    user?.investorProfile?.organizationName ?? ""
  );
  const [preferredIndustry, setPreferredIndustry] = useState(
    user?.investorProfile?.preferredIndustry ?? ""
  );
  const [investmentBudgetRange, setInvestmentBudgetRange] = useState(
    user?.investorProfile?.investmentBudgetRange ?? ""
  );

  // Evaluator profile fields
  const [department, setDepartment] = useState(
    user?.evaluatorProfile?.department ?? ""
  );
  const [specialization, setSpecialization] = useState(
    user?.evaluatorProfile?.specialization ?? ""
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update basic profile
      await userService.updateProfile({ fullName, phoneNumber });

      // Update role-specific identity profile
      if (user?.role === "STARTUP") {
        await userService.saveStartupProfile({
          companyName,
          industry,
          country,
          city,
          website,
          teamSize: teamSize ? Number(teamSize) : undefined,
          foundedYear: foundedYear ? Number(foundedYear) : undefined,
        });
      } else if (user?.role === "INVESTOR") {
        await userService.saveInvestorProfile({
          organizationName,
          preferredIndustry,
          investmentBudgetRange,
          country,
          city,
        });
      }

      updateUser({ fullName, phoneNumber });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          My Profile
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Manage your personal information and identity profile
        </p>
      </div>

      {/* Avatar block */}
      <Card className="border border-[var(--color-border)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-semibold text-[var(--color-primary-800)] text-lg">
              {user?.fullName}
            </p>
            <p className="text-sm text-[var(--color-neutral-500)]">
              {user?.email}
            </p>
            <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
              {user?.role}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[var(--color-secondary)]" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your personal contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={user?.email ?? ""}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-[var(--color-neutral-400)]">
              Email cannot be changed
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+250 7XX XXX XXX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Startup identity profile */}
      {user?.role === "STARTUP" && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
              Startup Identity Profile
            </CardTitle>
            <CardDescription>
              Information about your company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Fintech"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">
                  <Globe className="h-3.5 w-3.5 inline mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Country
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Rwanda"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kigali"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="teamSize">
                  <Users className="h-3.5 w-3.5 inline mr-1" />
                  Team Size
                </Label>
                <Input
                  id="teamSize"
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="foundedYear">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  Founded Year
                </Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="2022"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investor identity profile */}
      {user?.role === "INVESTOR" && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
              Investor Identity Profile
            </CardTitle>
            <CardDescription>
              Information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your organization or fund name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preferredIndustry">Preferred Industry</Label>
              <Input
                id="preferredIndustry"
                value={preferredIndustry}
                onChange={(e) => setPreferredIndustry(e.target.value)}
                placeholder="e.g. Fintech, Agritech"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="investmentBudgetRange">
                Investment Budget Range
              </Label>
              <Input
                id="investmentBudgetRange"
                value={investmentBudgetRange}
                onChange={(e) => setInvestmentBudgetRange(e.target.value)}
                placeholder="e.g. $100K – $500K"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Rwanda"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kigali"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluator identity profile */}
      {user?.role === "EVALUATOR" && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
              Evaluator Profile
            </CardTitle>
            <CardDescription>
              Your RG Partners staff information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Investment Analysis"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Fintech, Agritech"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Rwanda"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kigali"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full gap-2"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Profile
          </>
        )}
      </Button>
    </div>
  );
}