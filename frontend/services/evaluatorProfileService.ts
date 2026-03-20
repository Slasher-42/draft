import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/common';
import type { EvaluatorProfile, EvaluatorProfileRequest } from '@/types/evaluator';

export const evaluatorProfileService = {
  async get(userId: number): Promise<EvaluatorProfile> {
    const res = await api.get<ApiResponse<EvaluatorProfile>>(`/api/evaluator/profile/${userId}`);
    return res.data.data;
  },

  async save(userId: number, data: EvaluatorProfileRequest): Promise<EvaluatorProfile> {
    const res = await api.post<ApiResponse<EvaluatorProfile>>(`/api/evaluator/profile/${userId}`, data);
    return res.data.data;
  },
};