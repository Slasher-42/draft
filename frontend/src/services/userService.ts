import { api } from "@/lib/api";

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getById(id: number | string): Promise<any> {
    const res = await api.get(`/api/users/${id}`);
    return res.data?.data ?? res.data;
  },

  async getUserById(id: number | string): Promise<any> {
    const res = await api.get(`/api/users/${id}`);
    return res.data?.data ?? res.data;
  },

  async update(id: number | string, data: UpdateUserRequest): Promise<any> {
    const res = await api.patch(`/api/users/${id}`, data);
    return res.data?.data ?? res.data;
  },

  async changePassword(id: number | string, data: ChangePasswordRequest): Promise<void> {
    await api.post(`/api/users/${id}/change-password`, data);
  },

  async saveStartupProfile(userId: number | string, data: any): Promise<any> {
    const res = await api.post(`/api/startup/profile/${userId}`, data);
    return res.data?.data ?? res.data;
  },

  async saveInvestorProfile(userId: number | string, data: any): Promise<any> {
    const res = await api.post(`/api/investor/profile/${userId}`, data);
    return res.data?.data ?? res.data;
  },

  async saveEvaluatorProfile(userId: number | string, data: any): Promise<any> {
    const res = await api.post(`/api/evaluator/profile/${userId}`, data);
    return res.data?.data ?? res.data;
  },

  async getStartupProfile(userId: number | string): Promise<any> {
    const res = await api.get(`/api/startup/profile/${userId}`);
    return res.data?.data ?? res.data;
  },

  async getInvestorProfile(userId: number | string): Promise<any> {
    const res = await api.get(`/api/investor/profile/${userId}`);
    return res.data?.data ?? res.data;
  },

  async getEvaluatorProfile(userId: number | string): Promise<any> {
    const res = await api.get(`/api/evaluator/profile/${userId}`);
    return res.data?.data ?? res.data;
  },

  async uploadProfilePicture(id: number | string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/api/users/${id}/profile-picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data ?? res.data;
  },

  async getAllUsers(params?: { role?: string; search?: string; page?: number }): Promise<any[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const url = new URL("https://user-management-service-2zr5.onrender.com/api/users");
  if (params?.role) url.searchParams.set("role", params.role);
  if (params?.search) url.searchParams.set("search", params.search);
  const res = await fetch(url.toString(), {
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
  });
  const data = await res.json();
  const result = data?.data ?? data;
  return Array.isArray(result) ? result : [];
},

  async createUser(data: any): Promise<any> {
    const res = await api.post("/api/auth/admin/create-user", data);
    return res.data?.data ?? res.data;
  },

  async toggleStatus(id: number | string): Promise<void> {
    await api.patch(`/api/users/${id}/status`);
  },

  async activateUser(id: number | string): Promise<void> {
    await api.patch(`/api/users/${id}/status`);
  },

  async deactivateUser(id: number | string): Promise<void> {
    await api.patch(`/api/users/${id}/status`);
  },

  async deleteUser(id: number | string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};