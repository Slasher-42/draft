import { api } from '@/lib/api';
import type { StartupProfile, StartupProfileRequest } from '@/types/startup';
import type { ApiResponse } from '@/types/common';

export const startupProfileService = {
  async save(userId: number, data: StartupProfileRequest): Promise<StartupProfile> {
    const res = await api.post<ApiResponse<StartupProfile>>(`/api/startup/profile/${userId}`, data);
    return res.data.data;
  },

  async get(userId: number): Promise<StartupProfile> {
    const res = await api.get<ApiResponse<StartupProfile>>(`/api/startup/profile/${userId}`);
    return res.data.data;
  },

  async getAll(): Promise<StartupProfile[]> {
    const res = await api.get<ApiResponse<StartupProfile[]>>('/api/startup/profiles');
    return res.data.data;
  },
};