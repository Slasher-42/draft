import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/common';
import type { StartupExecution, StartupExecutionRequest } from '@/types/execution';

export const startupExecutionService = {
  async submit(data: StartupExecutionRequest): Promise<StartupExecution> {
    const res = await api.post<ApiResponse<StartupExecution>>('/api/executions/startup', data);
    return res.data.data;
  },

  async getAll(): Promise<StartupExecution[]> {
    const res = await api.get<ApiResponse<StartupExecution[]>>('/api/executions/startup');
    return res.data.data;
  },

  async getById(id: number): Promise<StartupExecution> {
    const res = await api.get<ApiResponse<StartupExecution>>(`/api/executions/startup/${id}`);
    return res.data.data;
  },

  async update(id: number, data: StartupExecutionRequest): Promise<StartupExecution> {
    const res = await api.put<ApiResponse<StartupExecution>>(`/api/executions/startup/${id}`, data);
    return res.data.data;
  },

  async saveConsiderations(id: number, additionalConsiderations: string): Promise<void> {
    await api.patch(`/api/executions/startup/${id}/considerations`, null, {
      params: { additionalConsiderations },
    });
  },
};