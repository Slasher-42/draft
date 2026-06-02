"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "@/lib/api";

function useHeroVideoUrl() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  useEffect(() => {
    api
      .get("/api/config")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setVideoUrl(data?.heroVideoUrl ?? null);
      })
      .catch(() => setVideoUrl(null));
  }, []);
  return videoUrl;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const videoUrl = useHeroVideoUrl();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F1F5F9" }}>
      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#020C1B 0%,#071C38 50%,#030F1F 100%)" }}
      >
        {/* Video — highly visible */}
        {videoUrl && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0, opacity: 0.62 }}
          >
            <source src={videoUrl} />
          </video>
        )}

        {/* Overlay — subtle, mostly lets video show */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            background: videoUrl
              ? "linear-gradient(to bottom, rgba(2,12,27,0.50) 0%, rgba(2,12,27,0.20) 45%, rgba(2,12,27,0.60) 100%)"
              : "none",
          }}
        />

        {/* Ambient orbs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            zIndex: 1,
            background: "radial-gradient(circle,rgba(47,114,165,0.12) 0%,transparent 70%)",
            transform: "translate(30%,-20%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            zIndex: 1,
            background: "radial-gradient(circle,rgba(11,74,139,0.15) 0%,transparent 70%)",
            transform: "translate(-20%,20%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3 mb-14">
            <div
              className="h-11 w-11 rounded-xl overflow-hidden flex-shrink-0"
              style={{ boxShadow: "0 0 0 1.5px rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.3)" }}
            >
              <Image src="/logo.png" alt="RG Partners Logo" width={44} height={44} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm tracking-widest uppercase">
                RG PARTNERS
              </p>
              <p className="text-xs" style={{ color: "#73A8CF" }}>
                Kigali, Rwanda
              </p>
            </div>
          </div>

          <div className="max-w-xs">
            <div
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 border"
              style={{ color: "#73A8CF", borderColor: "rgba(115,168,207,0.3)", backgroundColor: "rgba(115,168,207,0.08)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI-Powered Platform
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              AI-Powered Investment
              <br />
              <span style={{ color: "#73A8CF" }}>Readiness Assessment</span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#A2C3DF" }}>
              Connecting promising startups with the right investors through
              intelligent assessment and matching.
            </p>
          </div>
        </div>

        {/* Stats footer */}
        <div className="relative z-10 p-10">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Startups Assessed", value: "200+" },
              { label: "Investors Matched", value: "50+"  },
              { label: "Success Rate",       value: "78%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p className="text-xl font-bold" style={{ color: "#A2C3DF" }}>
                  {stat.value}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#73A8CF" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="auth-right-bg flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        {/* Subtle background circles */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(11,74,139,0.04) 0%,transparent 70%)", transform: "translate(30%,-30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(47,114,165,0.04) 0%,transparent 70%)", transform: "translate(-30%,30%)" }}
        />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.png" alt="RG Partners Logo" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <span className="font-bold text-lg" style={{ color: "#052654" }}>
            RG Partners
          </span>
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {children}
        </motion.div>

        <p className="mt-8 text-xs text-center" style={{ color: "#94A3B8" }}>
          © {new Date().getFullYear()} RG Partners Financial Services. All rights reserved.
        </p>
      </div>
    </div>
  );
}
