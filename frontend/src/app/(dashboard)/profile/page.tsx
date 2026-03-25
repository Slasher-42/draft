"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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
  const [organizationName, setOrganizationName] = useState("");
  const [preferredIndustry, setPreferredIndustry] = useState("");
  const [investmentBudget, setInvestmentBudget] = useState<string>("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const userData = await userService.getById(user.id);
        setFullName(userData.fullName ?? "");
        setPhoneNumber(userData.phoneNumber ?? "");

        if (user.role === "STARTUP") {
          try {
            const sp = await userService.getStartupProfile(user.id);
            setCompanyName(sp.companyName ?? "");
            setIndustry(sp.industry ?? "");
            setCountry(sp.country ?? "");
            setCity(sp.city ?? "");
            setWebsite(sp.website ?? "");
            setTeamSize(sp.teamSize?.toString() ?? "");
            setFoundedYear(sp.foundedYear?.toString() ?? "");
          } catch (err: any) {
            if (err.response?.status !== 404) {
              toast.error("Failed to load startup profile.");
            }
          }
        }

        if (user.role === "INVESTOR") {
          try {
            const ip = await userService.getInvestorProfile(user.id);
            setOrganizationName(ip.organizationName ?? "");
            setPreferredIndustry(ip.preferredIndustry ?? "");
            setInvestmentBudget(ip.investmentBudget?.toString() ?? "");
            setCountry(ip.country ?? "");
            setCity(ip.city ?? "");
          } catch (err: any) {
            if (err.response?.status !== 404) {
              toast.error("Failed to load investor profile.");
            }
          }
        }

        if (user.role === "EVALUATOR") {
          try {
            const ep = await userService.getEvaluatorProfile(user.id);
            setDepartment(ep.department ?? "");
            setSpecialization(ep.specialization ?? "");
            setCountry(ep.country ?? "");
            setCity(ep.city ?? "");
          } catch (err: any) {
            if (err.response?.status !== 404) {
              toast.error("Failed to load evaluator profile.");
            }
          }
        }
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, user?.role]);

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
          website,
          teamSize: teamSize ? Number(teamSize) : undefined,
          foundedYear: foundedYear ? Number(foundedYear) : undefined,
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
    <div className="space-y-6 max-w-2xl">
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
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-[var(--color-neutral-400)]">Email cannot be changed</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+250 7XX XXX XXX" />
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
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">
                  <Globe className="h-3.5 w-3.5 inline mr-1" />
                  Website
                </Label>
                <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Country
                </Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Rwanda" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kigali" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="teamSize">
                  <Users className="h-3.5 w-3.5 inline mr-1" />
                  Team Size
                </Label>
                <Input id="teamSize" type="number" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="5" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="foundedYear">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  Founded Year
                </Label>
                <Input id="foundedYear" type="number" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} placeholder="2022" />
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
              <Input id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Your organization or fund name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preferredIndustry">Preferred Industry</Label>
              <select
                id="preferredIndustry"
                value={preferredIndustry}
                onChange={(e) => setPreferredIndustry(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Select industry</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="HEALTHCARE">Healthcare</option>
                <option value="FINANCE">Finance</option>
                <option value="EDUCATION">Education</option>
                <option value="AGRICULTURE">Agriculture</option>
                <option value="ENERGY">Energy</option>
                <option value="REAL_ESTATE">Real Estate</option>
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="RETAIL">Retail</option>
                <option value="TRANSPORTATION">Transportation</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="investmentBudget">Investment Budget (USD)</Label>
              <Input
                id="investmentBudget"
                type="number"
                value={investmentBudget}
                onChange={(e) => setInvestmentBudget(e.target.value)}
                placeholder="e.g. 500000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Rwanda" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kigali" />
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
              <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Investment Analysis" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Fintech, Agritech" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Rwanda" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kigali" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button className="w-full gap-2" onClick={handleSave} disabled={isSaving}>
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