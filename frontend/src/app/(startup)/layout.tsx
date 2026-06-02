"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RouteGuard } from "@/components/common/RouteGuard";
import { FloatingAIAssistant } from "@/components/assistant/FloatingAIAssistant";

export default function StartupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["STARTUP"]}>
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