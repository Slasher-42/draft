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
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#05342A" }}
      >
        {videoUrl && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0, opacity: 0.35 }}
          >
            <source src={videoUrl} />
          </video>
        )}

        {videoUrl && (
          <div
            className="absolute inset-0"
            style={{
              zIndex: 1,
              background:
                "linear-gradient(to bottom, rgba(3,40,28,0.55) 0%, rgba(3,40,28,0.40) 60%, rgba(3,40,28,0.70) 100%)",
            }}
          />
        )}

        {/* Background circles */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            backgroundColor: "#2FA572",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{
            backgroundColor: "#2FA572",
            transform: "translate(-30%, 30%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0">
              <Image src="/logo.png" alt="RG Partners Logo" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="font-bold text-white text-lg tracking-wide">
                RG PARTNERS
              </p>
              <p className="text-xs" style={{ color: "#73CFA3" }}>
                Kigali, Rwanda
              </p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered Investment
            <br />
            Readiness Assessment
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#A2DFC2" }}>
            Connecting promising startups with the right investors through
            intelligent assessment and matching.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { label: "Startups Assessed", value: "200+" },
            { label: "Investors Matched", value: "50+" },
            { label: "Success Rate", value: "78%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "#73CFA3" }}
              >
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "#A2DFC2" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.png" alt="RG Partners Logo" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <span
            className="font-bold text-lg"
            style={{ color: "#05342A" }}
          >
            RG Partners
          </span>
        </div>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>

        <p className="mt-8 text-xs text-center" style={{ color: "#94A3B8" }}>
          © {new Date().getFullYear()} RG Partners Financial Services. All
          rights reserved.
        </p>
      </div>
    </div>
  );
}
