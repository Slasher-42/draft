"use client";

import { useEffect, useRef, useState } from "react";
import { Wifi } from "lucide-react";

const SERVICES = [
  { name: "Users",     url: "/api/config" },
  { name: "Startup",   url: "/api/startup/executions/health-check" },
  { name: "AI",        url: "/api/ai/health" },
  { name: "Evaluator", url: "/api/evaluator/health" },
  { name: "Matching",  url: "/api/matching/health" },
  { name: "Admin",     url: "/api/admin/health" },
  { name: "Notif",     url: "/api/notifications/health" },
];

const SLOW_THRESHOLD_MS = 3000;

export function ServiceWarmer() {
  const [slow, setSlow] = useState(false);
  const [ready, setReady] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const timer = setTimeout(() => setSlow(true), SLOW_THRESHOLD_MS);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const pings = SERVICES.map(({ url }) =>
      fetch(url, { method: "GET", headers, signal: AbortSignal.timeout(60_000) }).catch(() => null)
    );

    Promise.allSettled(pings).then(() => {
      clearTimeout(timer);
      setSlow(false);
      setReady(true);
      setTimeout(() => setReady(false), 2000);
    });

    return () => clearTimeout(timer);
  }, []);

  if (!slow && !ready) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all ${
        ready
          ? "bg-green-600 text-white"
          : "bg-[#052654] text-[#A2C3DF] border border-[rgba(115,168,207,0.2)]"
      }`}
    >
      {ready ? (
        <>
          <Wifi className="h-4 w-4 text-white" />
          Services are ready
        </>
      ) : (
        <>
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          Waking up backend services… first load may be slow
        </>
      )}
    </div>
  );
}
