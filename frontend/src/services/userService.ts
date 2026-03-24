import { api } from "@/lib/api";

export const userService = {
  getProfile: () => api.get("/api/users/profile"),

  updateProfile: (data: any) =>
    api.put("/api/users/profile", data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/api/users/change-password", { currentPassword, newPassword }),

  saveStartupProfile: (data: any) =>
    api.post("/api/users/startup-profile", data),

  saveInvestorProfile: (data: any) =>
    api.post("/api/users/investor-profile", data),

  // Admin
  getAllUsers: (params?: { role?: string; search?: string; page?: number }) =>
    api.get("/api/admin/users", { params }),

  getUserById: (id: string) =>
    api.get(`/api/admin/users/${id}`),

  createUser: (data: any) =>
    api.post("/api/admin/users", data),

  updateUser: (id: string, data: any) =>
    api.put(`/api/admin/users/${id}`, data),

  activateUser: (id: string) =>
    api.patch(`/api/admin/users/${id}/activate`),

  deactivateUser: (id: string) =>
    api.patch(`/api/admin/users/${id}/deactivate`),

  deleteUser: (id: string) =>
    api.delete(`/api/admin/users/${id}`),
};