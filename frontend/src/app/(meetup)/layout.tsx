"use client";

import { RouteGuard } from "@/components/common/RouteGuard";

export default function MeetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["INVESTOR", "STARTUP"]}>
      {children}
    </RouteGuard>
  );
}
