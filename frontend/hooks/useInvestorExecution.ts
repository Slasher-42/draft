import { useState, useEffect } from 'react';
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
};

export const useInvestorExecutions = () => {
  const [executions, setExecutions] = useState<InvestorExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    investorExecutionService.getAll()
      .then(setExecutions)
      .finally(() => setLoading(false));
  }, []);

  const submit = async (data: InvestorExecutionRequest): Promise<InvestorExecution> => {
    const execution = await investorExecutionService.submit(data);
    setExecutions((prev) => [...prev, execution]);
    return execution;
  };

  return { executions, loading, submit };
};

export const useInvestorExecutionById = (id: number) => {
  const [execution, setExecution] = useState<InvestorExecution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    investorExecutionService.getById(id)
      .then(setExecution)
      .finally(() => setLoading(false));
  }, [id]);

  return { execution, loading };
};
