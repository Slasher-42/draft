"use client";

import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

// All Render backend URLs to wake up
const SERVICES = [
  { name: "Users",        url: "https://user-management-service-2zr5.onrender.com/api/config" },
  { name: "Startup",      url: "https://startup-application-service.onrender.com/actuator/health" },
  { name: "AI",           url: "https://ai-assessment-service.onrender.com/actuator/health" },
  { name: "Evaluator",    url: "https://evaluation-decision-service.onrender.com/actuator/health" },
  { name: "Matching",     url: "https://investor-matching-service.onrender.com/actuator/health" },
  { name: "Admin",        url: "https://audit-compliance-service.onrender.com/actuator/health" },
  { name: "Notif",        url: "https://reporting-notification-service.onrender.com/actuator/health" },
];

const SLOW_THRESHOLD_MS = 3000; // show banner only if any service takes >3s

export function ServiceWarmer() {
  const [slow, setSlow] = useState(false);
  const [ready, setReady] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const timer = setTimeout(() => setSlow(true), SLOW_THRESHOLD_MS);

    const pings = SERVICES.map(({ url }) =>
      fetch(url, { method: "GET", signal: AbortSignal.timeout(60_000) }).catch(() => null)
    );

    Promise.allSettled(pings).then(() => {
      clearTimeout(timer);
      setSlow(false);
      setReady(true);
      // Hide the "ready" banner after 2s
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
