"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RouteGuard } from "@/components/common/RouteGuard";
import { prefetchRoute } from "@/lib/prefetch";
import { useAuth } from "@/context/AuthContext";
import { FloatingAIAssistant } from "@/components/assistant/FloatingAIAssistant";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const adminRoutes = ["/admin/dashboard", "/admin/users", "/admin/evaluators"];
    adminRoutes.forEach((route) =>
      prefetchRoute(queryClient, route, Number(user?.id))
    );
  }, [queryClient, user?.id]);

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="flex h-screen dashboard-bg overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <FloatingAIAssistant />
    </RouteGuard>
  );
}