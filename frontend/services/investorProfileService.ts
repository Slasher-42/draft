import { api } from '@/lib/api';
import type { InvestorProfile, InvestorProfileRequest } from '@/types/investor';
import type { ApiResponse } from '@/types/common';

export const investorProfileService = {
  async save(userId: number, data: InvestorProfileRequest): Promise<InvestorProfile> {
    const res = await api.post<ApiResponse<InvestorProfile>>(`/api/investor/profile/${userId}`, data);
    return res.data.data;
  },

  async get(userId: number): Promise<InvestorProfile> {
    const res = await api.get<ApiResponse<InvestorProfile>>(`/api/investor/profile/${userId}`);
    return res.data.data;
  },
};