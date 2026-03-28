"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Loader2, Save, User, Building2, MapPin, Globe, Users, Calendar, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [fundingNeeded, setFundingNeeded] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [preferredIndustry, setPreferredIndustry] = useState("");
  const [investmentBudget, setInvestmentBudget] = useState<string>("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useMemo(() => {
    const current: Record<string, string> = {
      fullName,
      phoneNumber,
      companyName,
      industry,
      country,
      city,
      website,
      teamSize,
      foundedYear,
      fundingNeeded,
      organizationName,
      preferredIndustry,
      investmentBudget,
      department,
      specialization,
    };
    return Object.keys(current).some((k) => current[k] !== (savedSnapshot[k] ?? ""));
  }, [
    fullName, phoneNumber,
    companyName, industry, country, city, website, teamSize, foundedYear, fundingNeeded,
    organizationName, preferredIndustry, investmentBudget,
    department, specialization,
    savedSnapshot,
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const userData = await userService.getById(user.id);
        setFullName(userData.fullName ?? "");
        setPhoneNumber(userData.phoneNumber ?? "");

        let sp: any = null;
        let ip: any = null;
        let ep: any = null;

        if (user.role === "STARTUP") {
          try {
            sp = await userService.getStartupProfile(user.id);
            setCompanyName(sp.companyName ?? "");
            setIndustry(sp.industry ?? "");
            setCountry(sp.country ?? "");
            setCity(sp.city ?? "");
            setWebsite(sp.website ?? "");
            setTeamSize(sp.teamSize?.toString() ?? "");
            setFoundedYear(sp.foundedYear?.toString() ?? "");
            setFundingNeeded(sp.fundingNeeded?.toString() ?? "");
          } catch (err: any) {
            if (err.response?.status !== 404) toast.error("Failed to load startup profile.");
          }
        }

        if (user.role === "INVESTOR") {
          try {
            ip = await userService.getInvestorProfile(user.id);
            setOrganizationName(ip.organizationName ?? "");
            setPreferredIndustry(ip.preferredIndustry ?? "");
            setInvestmentBudget(ip.investmentBudget?.toString() ?? "");
            setCountry(ip.country ?? "");
            setCity(ip.city ?? "");
          } catch (err: any) {
            if (err.response?.status !== 404) toast.error("Failed to load investor profile.");
          }
        }

        if (user.role === "EVALUATOR") {
          try {
            ep = await userService.getEvaluatorProfile(user.id);
            setDepartment(ep.department ?? "");
            setSpecialization(ep.specialization ?? "");
            setCountry(ep.country ?? "");
            setCity(ep.city ?? "");
          } catch (err: any) {
            if (err.response?.status !== 404) toast.error("Failed to load evaluator profile.");
          }
        }

        setSavedSnapshot({
          fullName:          userData.fullName              ?? "",
          phoneNumber:       userData.phoneNumber           ?? "",
          companyName:       sp?.companyName                ?? "",
          industry:          sp?.industry                   ?? "",
          country:           sp?.country ?? ip?.country ?? ep?.country ?? "",
          city:              sp?.city    ?? ip?.city    ?? ep?.city    ?? "",
          website:           sp?.website                    ?? "",
          teamSize:          sp?.teamSize?.toString()       ?? "",
          foundedYear:       sp?.foundedYear?.toString()    ?? "",
          fundingNeeded:     sp?.fundingNeeded?.toString()  ?? "",
          organizationName:  ip?.organizationName           ?? "",
          preferredIndustry: ip?.preferredIndustry          ?? "",
          investmentBudget:  ip?.investmentBudget?.toString() ?? "",
          department:        ep?.department                 ?? "",
          specialization:    ep?.specialization             ?? "",
        });
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, user?.role]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!fullName.trim()) e.fullName = "Full name is required.";
    else if (fullName.trim().length < 2) e.fullName = "Full name must be at least 2 characters.";

    if (phoneNumber && !/^\+?[\d\s\-()\\.]{7,15}$/.test(phoneNumber))
      e.phoneNumber = "Enter a valid phone number.";

    if (user?.role === "STARTUP") {
      if (!companyName.trim()) e.companyName = "Company name is required.";
      if (!industry) e.industry = "Please select an industry.";
      if (!country.trim()) e.country = "Country is required.";
      if (!city.trim()) e.city = "City is required.";
      if (website.trim() && !/^https?:\/\/.+\..+/.test(website.trim()))
        e.website = "Must be a valid URL starting with http:// or https://";
      if (teamSize && (isNaN(Number(teamSize)) || Number(teamSize) < 1))
        e.teamSize = "Team size must be a positive number.";
      if (foundedYear) {
        const yr = Number(foundedYear);
        const now = new Date().getFullYear();
        if (isNaN(yr) || yr < 1900 || yr > now)
          e.foundedYear = `Founded year must be between 1900 and ${now}.`;
      }
      if (fundingNeeded && (isNaN(Number(fundingNeeded)) || Number(fundingNeeded) < 0))
        e.fundingNeeded = "Enter a valid positive number.";
    }

    if (user?.role === "INVESTOR") {
      if (!organizationName.trim()) e.organizationName = "Organization name is required.";
      if (!preferredIndustry) e.preferredIndustry = "Please select a preferred industry.";
      if (!investmentBudget || isNaN(Number(investmentBudget)) || Number(investmentBudget) <= 0)
        e.investmentBudget = "Enter a valid budget greater than 0.";
      if (!country.trim()) e.country = "Country is required.";
      if (!city.trim()) e.city = "City is required.";
    }

    if (user?.role === "EVALUATOR") {
      if (!department.trim()) e.department = "Department is required.";
      if (!country.trim()) e.country = "Country is required.";
      if (!city.trim()) e.city = "City is required.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setIsUploadingPicture(true);
    try {
      const updated = await userService.uploadProfilePicture(user.id, file);
      updateUser({ profilePictureUrl: updated.profilePictureUrl });
      toast.success("Profile picture updated.");
    } catch {
      toast.error("Failed to upload profile picture.");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await userService.update(user.id, { fullName, phoneNumber });

      if (user.role === "STARTUP") {
        await userService.saveStartupProfile(user.id, {
          companyName,
          industry,
          country,
          city,
          website: website.trim() || null,
          teamSize: teamSize ? Number(teamSize) : undefined,
          foundedYear: foundedYear ? Number(foundedYear) : undefined,
          fundingNeeded: fundingNeeded ? Number(fundingNeeded) : 0,
        });
      } else if (user.role === "INVESTOR") {
        await userService.saveInvestorProfile(user.id, {
          organizationName,
          preferredIndustry,
          investmentBudget: investmentBudget ? Number(investmentBudget) : undefined,
          country,
          city,
        });
      } else if (user.role === "EVALUATOR") {
        await userService.saveEvaluatorProfile(user.id, {
          department,
          specialization,
          country,
          city,
        });
      }

      updateUser({ fullName, phoneNumber });
      toast.success("Profile updated successfully.");
      setSavedSnapshot({
        fullName,
        phoneNumber,
        companyName,
        industry,
        country,
        city,
        website,
        teamSize,
        foundedYear,
        fundingNeeded,
        organizationName,
        preferredIndustry,
        investmentBudget,
        department,
        specialization,
      });
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
          My Profile
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          Manage your personal information and identity profile
        </p>
      </div>

      <Card className="border border-[var(--color-border)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.fullName?.charAt(0)?.toUpperCase() ?? "U"
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPicture}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50"
            >
              {isUploadingPicture ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePictureChange}
            />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-primary-800)] text-lg">{user?.fullName}</p>
            <p className="text-sm text-[var(--color-neutral-500)]">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
              {user?.role}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[var(--color-secondary)]" />
            Basic Information
          </CardTitle>
          <CardDescription>Your personal contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }} placeholder="Your full name" className={errors.fullName ? "border-red-500" : ""} />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-[var(--color-neutral-400)]">Email cannot be changed</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setErrors((p) => ({ ...p, phoneNumber: "" })); }} placeholder="+250 7XX XXX XXX" className={errors.phoneNumber ? "border-red-500" : ""} />
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
          </div>
        </CardContent>
      </Card>

      {user?.role === "STARTUP" && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
              Startup Identity Profile
            </CardTitle>
            <CardDescription>Information about your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" value={companyName} onChange={(e) => { setCompanyName(e.target.value); setErrors((p) => ({ ...p, companyName: "" })); }} placeholder="Your company name" className={errors.companyName ? "border-red-500" : ""} />
              {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={(v) => { setIndustry(v); setErrors((p) => ({ ...p, industry: "" })); }}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                    <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="EDUCATION">Education</SelectItem>
                    <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                    <SelectItem value="ENERGY">Energy</SelectItem>
                    <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                    <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                    <SelectItem value="RETAIL">Retail</SelectItem>
                    <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">
                  <Globe className="h-3.5 w-3.5 inline mr-1" />
                  Website
                </Label>
                <Input id="website" value={website} onChange={(e) => { setWebsite(e.target.value); setErrors((p) => ({ ...p, website: "" })); }} placeholder="https://yoursite.com" className={errors.website ? "border-red-500" : ""} />
                {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Country
                </Label>
                <Input id="country" value={country} onChange={(e) => { setCountry(e.target.value); setErrors((p) => ({ ...p, country: "" })); }} placeholder="Rwanda" className={errors.country ? "border-red-500" : ""} />
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: "" })); }} placeholder="Kigali" className={errors.city ? "border-red-500" : ""} />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="teamSize">
                  <Users className="h-3.5 w-3.5 inline mr-1" />
                  Team Size
                </Label>
                <Input id="teamSize" type="number" value={teamSize} onChange={(e) => { setTeamSize(e.target.value); setErrors((p) => ({ ...p, teamSize: "" })); }} placeholder="5" className={errors.teamSize ? "border-red-500" : ""} />
                {errors.teamSize && <p className="text-xs text-red-500 mt-1">{errors.teamSize}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="foundedYear">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  Founded Year
                </Label>
                <Input id="foundedYear" type="number" value={foundedYear} onChange={(e) => { setFoundedYear(e.target.value); setErrors((p) => ({ ...p, foundedYear: "" })); }} placeholder="2022" className={errors.foundedYear ? "border-red-500" : ""} />
                {errors.foundedYear && <p className="text-xs text-red-500 mt-1">{errors.foundedYear}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fundingNeeded">Funding Needed (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] text-sm font-medium">$</span>
                <Input
                  id="fundingNeeded"
                  type="number"
                  value={fundingNeeded}
                  onChange={(e) => { setFundingNeeded(e.target.value); setErrors((p) => ({ ...p, fundingNeeded: "" })); }}
                  placeholder="e.g. 500000"
                  className={`pl-7${errors.fundingNeeded ? " border-red-500" : ""}`}
                />
                {errors.fundingNeeded && <p className="text-xs text-red-500 mt-1">{errors.fundingNeeded}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === "INVESTOR" && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
              Investor Identity Profile
            </CardTitle>
            <CardDescription>Information about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input id="organizationName" value={organizationName} onChange={(e) => { setOrganizationName(e.target.value); setErrors((p) => ({ ...p, organizationName: "" })); }} placeholder="Your organization or fund name" className={errors.organizationName ? "border-red-500" : ""} />
              {errors.organizationName && <p className="text-xs text-red-500 mt-1">{errors.organizationName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preferredIndustry">Preferred Industry</Label>
              <Select value={preferredIndustry} onValueChange={(v) => { setPreferredIndustry(v); setErrors((p) => ({ ...p, preferredIndustry: "" })); }}>
                <SelectTrigger id="preferredIndustry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                  <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                  <SelectItem value="ENERGY">Energy</SelectItem>
                  <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                  <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                  <SelectItem value="RETAIL">Retail</SelectItem>
                  <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                  <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.preferredIndustry && <p className="text-xs text-red-500 mt-1">{errors.preferredIndustry}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="investmentBudget">Investment Budget (USD)</Label>
              <Input
                id="investmentBudget"
                type="number"
                value={investmentBudget}
                onChange={(e) => { setInvestmentBudget(e.target.value); setErrors((p) => ({ ...p, investmentBudget: "" })); }}
                placeholder="e.g. 500000"
                className={errors.investmentBudget ? "border-red-500" : ""}
              />
              {errors.investmentBudget && <p className="text-xs text-red-500 mt-1">{errors.investmentBudget}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => { setCountry(e.target.value); setErrors((p) => ({ ...p, country: "" })); }} placeholder="Rwanda" className={errors.country ? "border-red-500" : ""} />
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: "" })); }} placeholder="Kigali" className={errors.city ? "border-red-500" : ""} />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === "EVALUATOR" && (
        <Card className="border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
              Evaluator Profile
            </CardTitle>
            <CardDescription>Your RG Partners staff information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={department} onChange={(e) => { setDepartment(e.target.value); setErrors((p) => ({ ...p, department: "" })); }} placeholder="e.g. Investment Analysis" className={errors.department ? "border-red-500" : ""} />
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Fintech, Agritech" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => { setCountry(e.target.value); setErrors((p) => ({ ...p, country: "" })); }} placeholder="Rwanda" className={errors.country ? "border-red-500" : ""} />
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: "" })); }} placeholder="Kigali" className={errors.city ? "border-red-500" : ""} />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full gap-2 transition-all"
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
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