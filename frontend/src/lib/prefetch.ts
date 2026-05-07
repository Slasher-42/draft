import { QueryClient } from "@tanstack/react-query";
import { startupService } from "@/services/startupService";
import { investorService } from "@/services/investorService";
import { evaluatorService } from "@/services/evaluatorService";
import { adminService } from "@/services/adminService";
import { userService } from "@/services/userService";

type PrefetchEntry = { queryKey: unknown[]; queryFn: () => Promise<unknown> };

const prefetchMap: Record<string, (userId?: number) => PrefetchEntry> = {
  "/startup/executions": () => ({
    queryKey: ["startup-executions"],
    queryFn: async () => {
      const res = await startupService.getExecutions();
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      return data?.data ?? [];
    },
  }),
  "/investor/executions": () => ({
    queryKey: ["investor-executions"],
    queryFn: async () => {
      const res = await investorService.getExecutions();
      return res.data.data ?? [];
    },
  }),
  "/evaluator/dashboard": () => ({
    queryKey: ["evaluator-dashboard"],
    queryFn: async () => {
      const res = await evaluatorService.getDashboardStats();
      return res.data.data;
    },
  }),
  "/evaluator/reviews": () => ({
    queryKey: ["evaluator-reviews"],
    queryFn: async () => {
      const res = await evaluatorService.getReviews();
      return res.data.data ?? [];
    },
  }),
  "/admin/dashboard": () => ({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await adminService.getDashboardStats();
      return res.data?.data ?? res.data;
    },
  }),
  "/admin/users": () => ({
    queryKey: ["admin-users", "ALL", ""],
    queryFn: async () => {
      const data = await userService.getAllUsers({});
      return data ?? [];
    },
  }),
  "/admin/evaluators": () => ({
    queryKey: ["admin-evaluators"],
    queryFn: async () => {
      const data = await userService.getAllUsers({ role: "EVALUATOR" });
      return data ?? [];
    },
  }),
  "/profile": (userId) => ({
    queryKey: ["profile", userId, undefined],
    queryFn: async () => {
      if (!userId) return null;
      return userService.getById(userId);
    },
  }),
};

export function prefetchRoute(
  queryClient: QueryClient,
  href: string,
  userId?: number
) {
  const entry = prefetchMap[href];
  if (!entry) return;
  const { queryKey, queryFn } = entry(userId);
  queryClient.prefetchQuery({ queryKey, queryFn });
}
