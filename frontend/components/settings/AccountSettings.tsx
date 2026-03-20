'use client';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Phone, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { useAccountSettings } from '@/hooks/useAccountSettings';
import { userService } from '@/services/userService';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function AccountSettings() {
  const { user, refreshUser } = useAuth();
  const { updateProfile, changePassword, updatingProfile, changingPassword } = useAccountSettings();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      await userService.uploadProfilePicture(user.id, file);
      await refreshUser();
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload picture');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({ fullName: data.fullName, phoneNumber: data.phoneNumber });
    } catch {}
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
    } catch {}
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="Account Settings"
        subtitle="Update your personal information and password"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-400" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 pb-5 mb-1 border-b border-surface-border">
            <div className="relative">
              <Avatar src={user?.profilePictureUrl} name={user?.fullName} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-brand-500 hover:bg-brand-600
                           border-2 border-surface-card flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <div>
              <p className="text-white font-semibold">{user?.fullName}</p>
              <p className="text-surface-muted text-sm">{user?.email}</p>
              {uploading && <p className="text-brand-400 text-xs mt-1">Uploading...</p>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePictureChange}
            />
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-5">
            <Input
              label="Full Name"
              type="text"
              leftIcon={<User className="h-4 w-4" />}
              error={profileForm.formState.errors.fullName?.message}
              {...profileForm.register('fullName')}
            />
            <Input
              label="Phone Number (optional)"
              type="tel"
              placeholder="+250 700 000 000"
              leftIcon={<Phone className="h-4 w-4" />}
              error={profileForm.formState.errors.phoneNumber?.message}
              {...profileForm.register('phoneNumber')}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={updatingProfile}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-400" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-5">
            <Input
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="text-surface-muted hover:text-white transition-colors">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Input
              label="New Password"
              type={showNew ? 'text' : 'password'}
              placeholder="At least 6 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="text-surface-muted hover:text-white transition-colors">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type={showNew ? 'text' : 'password'}
              placeholder="Repeat new password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            {passwordForm.formState.errors.root && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5">
                {passwordForm.formState.errors.root.message}
              </p>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={changingPassword}
              >
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}