import startupServiceApi from '@/lib/startupServiceApi';
import type { ApiResponse } from '@/types/common';
import type { InvestorExecution, InvestorExecutionRequest } from '@/types/execution';

export const investorExecutionService = {
  async submit(data: InvestorExecutionRequest): Promise<InvestorExecution> {
    const res = await startupServiceApi.post<ApiResponse<InvestorExecution>>('/api/executions/investor', data);
    return res.data.data;
  },

  async getAll(): Promise<InvestorExecution[]> {
    const res = await startupServiceApi.get<ApiResponse<InvestorExecution[]>>('/api/executions/investor');
    return res.data.data;
  },

  async getById(id: number): Promise<InvestorExecution> {
    const res = await startupServiceApi.get<ApiResponse<InvestorExecution>>(`/api/executions/investor/${id}`);
    return res.data.data;
  },

  async update(id: number, data: InvestorExecutionRequest): Promise<InvestorExecution> {
    const res = await startupServiceApi.put<ApiResponse<InvestorExecution>>(`/api/executions/investor/${id}`, data);
    return res.data.data;
  },

  async saveConsiderations(id: number, additionalConsiderations: string): Promise<void> {
    await startupServiceApi.patch(`/api/executions/investor/${id}/considerations`, null, {
      params: { additionalConsiderations },
    });
  },
};