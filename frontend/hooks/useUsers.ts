import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { UserResponse } from '@/types/user';
import { toast } from 'react-toastify';

export const useUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const deleteUser = async (id: number) => {
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
      throw err;
    }
  };

  const toggleUserStatus = async (id: number) => {
    try {
      await userService.toggleStatus(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u))
      );
      toast.success('User status updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
      throw err;
    }
  };

  return { users, loading, error, deleteUser, toggleUserStatus };
};