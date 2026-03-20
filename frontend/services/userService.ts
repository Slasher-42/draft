import { api } from '@/lib/api';
import type { UserResponse } from '@/types/user';
import type { ApiResponse } from '@/types/common';

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getById(id: number): Promise<UserResponse> {
    const res = await api.get<ApiResponse<UserResponse>>(`/api/users/${id}`);
    return res.data.data;
  },

  async getAll(): Promise<UserResponse[]> {
    const res = await api.get<ApiResponse<UserResponse[]>>('/api/users');
    return res.data.data;
  },

  async getByRole(role: string): Promise<UserResponse[]> {
    const res = await api.get<ApiResponse<UserResponse[]>>(`/api/users?role=${role}`);
    return res.data.data;
  },

  async update(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    const res = await api.patch<ApiResponse<UserResponse>>(`/api/users/${id}`, data);
    return res.data.data;
  },

  async changePassword(id: number, data: ChangePasswordRequest): Promise<void> {
    await api.post(`/api/users/${id}/change-password`, data);
  },

  async toggleStatus(id: number): Promise<void> {
    await api.patch(`/api/users/${id}/status`);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },

  async uploadProfilePicture(id: number, file: File): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<UserResponse>>(
      `/api/users/${id}/profile-picture`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  },
};