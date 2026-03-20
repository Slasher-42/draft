import { useState } from 'react';
import { userService, UpdateUserRequest, ChangePasswordRequest } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export const useAccountSettings = () => {
  const { user, login } = useAuth();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const updateProfile = async (data: UpdateUserRequest) => {
    if (!user) return;
    setUpdatingProfile(true);
    try {
      await userService.update(user.id, data);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setUpdatingProfile(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    if (!user) return;
    setChangingPassword(true);
    try {
      await userService.changePassword(user.id, data);
      toast.success('Password changed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
      throw err;
    } finally {
      setChangingPassword(false);
    }
  };

  return { updateProfile, changePassword, updatingProfile, changingPassword };
};