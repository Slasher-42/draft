"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  TrendingUp,
  Mail,
  Phone,
  ChevronDown,
  ArrowRight,
  Briefcase,
  Rocket,
  Star,
  Calendar,
  DollarSign,
  Factory,
} from "lucide-react";
import { useHomeConfig } from "@/hooks/useHomeConfig";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types/user";

// Plain fetch helper — does NOT use the api axios instance so the 401
// interceptor (which force-redirects to /login) is never triggered.
async function publicGet<T = any>(path: string): Promise<T | null> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(`http://localhost:3000${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  duration = 1800,
  enabled,
}: {
  target: number;
  suffix?: string;
  duration?: number;
  enabled: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !enabled) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration, enabled]);

  return (
    <span ref={ref}>
      {enabled ? count : target}
      {suffix}
    </span>
  );
}

// ─── Fade-in section wrapper ──────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  enabled,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  enabled: boolean;
  className?: string;
}) {
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Avatar placeholder ───────────────────────────────────────────────────────
function Avatar({
  src,
  name,
  size = 56,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size / 2.8,
        background: "linear-gradient(135deg,#0B4A8B 0%,#2F72A5 100%)",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Investor card ────────────────────────────────────────────────────────────
function InvestorCard({
  user,
  delay,
  enabled,
}: {
  user: User;
  delay: number;
  enabled: boolean;
}) {
  const p = user.investorProfile;
  return (
    <FadeIn delay={delay} enabled={enabled}>
      <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar src={user.profilePictureUrl} name={user.fullName} size={52} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate leading-tight">
              {user.fullName}
            </p>
            {p?.organizationName && (
              <p className="text-sm text-blue-700 font-medium truncate">
                {p.organizationName}
              </p>
            )}
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              <Briefcase className="w-3 h-3" /> Investor
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 flex-1">
          {p?.preferredIndustry && (
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{p.preferredIndustry}</span>
            </div>
          )}
          {(p?.country || p?.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {[p.city, p.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {p?.investmentBudgetRange && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{p.investmentBudgetRange}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {user.isActive ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  Member
                </span>
              )}
            </span>
            <Star className="w-4 h-4 text-amber-300 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Startup card ─────────────────────────────────────────────────────────────
function StartupCard({
  user,
  delay,
  enabled,
}: {
  user: User;
  delay: number;
  enabled: boolean;
}) {
  const p = user.startupProfile;
  return (
    <FadeIn delay={delay} enabled={enabled}>
      <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar src={user.profilePictureUrl} name={p?.companyName || user.fullName} size={52} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate leading-tight">
              {p?.companyName || user.fullName}
            </p>
            <p className="text-sm text-slate-500 truncate">{user.fullName}</p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              <Rocket className="w-3 h-3" /> Startup
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 flex-1">
          {p?.industry && (
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{p.industry}</span>
            </div>
          )}
          {(p?.country || p?.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {[p?.city, p?.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {p?.foundedYear && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Founded {p.foundedYear}</span>
            </div>
          )}
          {p?.teamSize && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{p.teamSize} team members</span>
            </div>
          )}
          {p?.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a
                href={p.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-600 hover:underline"
              >
                {p.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {user.isActive ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  Member
                </span>
              )}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({
  label,
  title,
  subtitle,
  enabled,
}: {
  label: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
}) {
  return (
    <FadeIn enabled={enabled} className="text-center mb-12">
      <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 px-3 py-1 bg-blue-50 rounded-full">
        {label}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </FadeIn>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { config, isLoaded } = useHomeConfig();
  const { user, logout } = useAuth();
  const [investors, setInvestors] = useState<User[]>([]);
  const [startups, setStartups] = useState<User[]>([]);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const anim = config.animationsEnabled;

  // Fetch hero video from backend config (or fall back to localStorage config)
  useEffect(() => {
    if (!isLoaded) return;
    publicGet("/api/config").then((json) => {
      const data = json?.data ?? json;
      setHeroVideoUrl(data?.heroVideoUrl ?? config.heroVideoUrl ?? null);
    });
  }, [isLoaded, config.heroVideoUrl]);

  // Load video when URL changes
  useEffect(() => {
    if (videoRef.current && heroVideoUrl) {
      videoRef.current.load();
    }
  }, [heroVideoUrl]);

  // Fetch users — uses the public endpoint so any role (or no auth) can see them
  useEffect(() => {
    Promise.all([
      publicGet("/api/users/public?role=INVESTOR"),
      publicGet("/api/users/public?role=STARTUP"),
    ]).then(([investorsJson, startupsJson]) => {
      setInvestors(investorsJson?.data ?? []);
      setStartups(startupsJson?.data ?? []);
    });
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isLoaded) return null;

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    config.locationLng - 0.05
  },${config.locationLat - 0.05},${config.locationLng + 0.05},${
    config.locationLat + 0.05
  }&layer=mapnik&marker=${config.locationLat},${config.locationLng}`;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ backgroundColor: "#052654" }}
      >
        {/* Video background */}
        {heroVideoUrl && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0, opacity: 0.28 }}
          >
            <source src={heroVideoUrl} />
          </video>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(135deg,rgba(5,38,84,0.92) 0%,rgba(7,54,106,0.75) 50%,rgba(2,19,42,0.95) 100%)",
          }}
        />

        {/* Decorative orbs */}
        <div
          className="absolute top-0 right-0 rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            background: "radial-gradient(circle,rgba(47,114,165,0.18) 0%,transparent 70%)",
            transform: "translate(20%,-20%)",
            zIndex: 1,
          }}
        />
        <div
          className="absolute bottom-0 left-0 rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            background: "radial-gradient(circle,rgba(11,74,139,0.2) 0%,transparent 70%)",
            transform: "translate(-20%,20%)",
            zIndex: 1,
          }}
        />

        {/* ── Nav bar ─────────────────────────────────────────────────────── */}
        <nav
          className="relative flex items-center justify-between px-6 md:px-12 py-5"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
              <Image
                src="/logo.png"
                alt="RG Partners"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-white text-sm tracking-widest uppercase">
                RG Partners
              </p>
              <p className="text-[10px]" style={{ color: "#73A8CF" }}>
                Investment Readiness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection("investors")}
              className="hidden md:inline text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
            >
              Investors
            </button>
            <button
              onClick={() => scrollToSection("startups")}
              className="hidden md:inline text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
            >
              Startups
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="hidden md:inline text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
            >
              Contact
            </button>
            {user ? (
              <button
                onClick={logout}
                className="text-sm font-semibold rounded-lg px-4 py-2 transition-all"
                style={{ backgroundColor: "#2F72A5", color: "#fff" }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-white border border-white/30 hover:border-white/70 hover:bg-white/10 rounded-lg px-4 py-2 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold rounded-lg px-4 py-2 transition-all"
                  style={{ backgroundColor: "#2F72A5", color: "#fff" }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero content ─────────────────────────────────────────────────── */}
        <div
          className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-20"
          style={{ zIndex: 10 }}
        >
          {anim ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-4xl mx-auto"
            >
              <HeroContent config={config} scrollToSection={scrollToSection} />
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <HeroContent config={config} scrollToSection={scrollToSection} />
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div
          className="relative flex justify-center pb-8"
          style={{ zIndex: 10 }}
        >
          {anim ? (
            <motion.button
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              onClick={() => scrollToSection("stats")}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <ChevronDown className="w-7 h-7" />
            </motion.button>
          ) : (
            <button
              onClick={() => scrollToSection("stats")}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <ChevronDown className="w-7 h-7" />
            </button>
          )}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      {config.showStats && (
        <section id="stats" className="py-16 bg-slate-50 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  icon: <Briefcase className="w-6 h-6" />,
                  label: "Investors",
                  value: investors.length,
                  suffix: "+",
                  color: "#2F72A5",
                },
                {
                  icon: <Rocket className="w-6 h-6" />,
                  label: "Startups",
                  value: startups.length,
                  suffix: "+",
                  color: "#059669",
                },
                {
                  icon: <TrendingUp className="w-6 h-6" />,
                  label: "Assessments",
                  value: 200,
                  suffix: "+",
                  color: "#7C3AED",
                },
                {
                  icon: <Star className="w-6 h-6" />,
                  label: "Success Rate",
                  value: 78,
                  suffix: "%",
                  color: "#D97706",
                },
              ].map((stat, i) => (
                <FadeIn key={stat.label} delay={i * 0.08} enabled={anim}>
                  <div className="text-center">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                      style={{
                        backgroundColor: `${stat.color}18`,
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <p
                      className="text-4xl font-extrabold mb-1"
                      style={{ color: stat.color }}
                    >
                      <AnimatedCounter
                        target={stat.value}
                        suffix={stat.suffix}
                        enabled={anim}
                      />
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INVESTORS ────────────────────────────────────────────────────── */}
      {config.showInvestors && (
        <section id="investors" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeading
              label="Our Investors"
              title="Strategic Investment Partners"
              subtitle="Meet the visionary investors driving Africa's economic transformation through smart capital deployment."
              enabled={anim}
            />
            {investors.length === 0 ? (
              <FadeIn enabled={anim}>
                <EmptyState
                  icon={<Briefcase className="w-10 h-10 text-slate-300" />}
                  text="Investors will appear here once they join the platform."
                />
              </FadeIn>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {investors.map((inv, i) => (
                  <InvestorCard
                    key={inv.id}
                    user={inv}
                    delay={i * 0.06}
                    enabled={anim}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── STARTUPS ─────────────────────────────────────────────────────── */}
      {config.showStartups && (
        <section id="startups" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeading
              label="Our Startups"
              title="Innovative Ventures Seeking Growth"
              subtitle="Discover the bold startups building tomorrow's solutions — assessed and ready for investment."
              enabled={anim}
            />
            {startups.length === 0 ? (
              <FadeIn enabled={anim}>
                <EmptyState
                  icon={<Rocket className="w-10 h-10 text-slate-300" />}
                  text="Startups will appear here once they complete their profiles."
                />
              </FadeIn>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {startups.map((startup, i) => (
                  <StartupCard
                    key={startup.id}
                    user={startup}
                    delay={i * 0.06}
                    enabled={anim}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CONTACT + MAP ────────────────────────────────────────────────── */}
      {config.showContact && (
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              label="Get In Touch"
              title="Contact Us"
              subtitle="Have questions or want to learn more? Reach out to our team."
              enabled={anim}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact info */}
              <FadeIn delay={0} enabled={anim}>
                <div className="space-y-6">
                  <ContactItem
                    icon={<Mail className="w-5 h-5" />}
                    label="Email"
                    value={config.contactEmail}
                    href={`mailto:${config.contactEmail}`}
                  />
                  <ContactItem
                    icon={<Phone className="w-5 h-5" />}
                    label="Phone"
                    value={config.contactPhone}
                    href={`tel:${config.contactPhone}`}
                  />
                  <ContactItem
                    icon={<MapPin className="w-5 h-5" />}
                    label="Address"
                    value={config.contactAddress}
                  />

                  <div className="pt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 text-sm text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "#0B4A8B" }}
                    >
                      {config.ctaPrimaryText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 text-sm border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      {config.ctaSecondaryText}
                    </Link>
                  </div>
                </div>
              </FadeIn>

              {/* Map */}
              {config.showMap && (
                <FadeIn delay={0.15} enabled={anim}>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs text-slate-400 ml-2 truncate">
                        {config.locationLabel}
                      </span>
                    </div>
                    <iframe
                      src={mapSrc}
                      title="Location map"
                      width="100%"
                      height="320"
                      style={{ border: 0, display: "block" }}
                      loading="lazy"
                    />
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="py-10 text-center"
        style={{ backgroundColor: "#052654" }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="RG Partners"
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="font-bold text-white text-sm tracking-widest uppercase">
            RG Partners
          </span>
        </div>
        <p className="text-sm" style={{ color: "#73A8CF" }}>
          © {new Date().getFullYear()} RG Partners Financial Services. All
          rights reserved.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs" style={{ color: "#4585C0" }}>
          <Link href="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-white transition-colors">
            Register
          </Link>
          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-white transition-colors"
          >
            Contact
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Hero content (extracted for clean conditional animation wrapping) ─────────
function HeroContent({
  config,
  scrollToSection,
}: {
  config: ReturnType<typeof useHomeConfig>["config"];
  scrollToSection: (id: string) => void;
}) {
  return (
    <>
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8 border"
        style={{ color: "#73A8CF", borderColor: "rgba(115,168,207,0.3)", backgroundColor: "rgba(115,168,207,0.08)" }}>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        AI-Powered Investment Readiness Platform
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
        {config.heroTitle}
      </h1>

      <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: "#A2C3DF" }}>
        {config.heroSubtitle}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 font-bold rounded-2xl px-8 py-4 text-base text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          style={{ backgroundColor: "#2F72A5" }}
        >
          {config.ctaPrimaryText}
          <ArrowRight className="w-5 h-5" />
        </Link>
        <button
          onClick={() => scrollToSection("investors")}
          className="inline-flex items-center gap-2 font-semibold rounded-2xl px-8 py-4 text-base border transition-all duration-200 hover:bg-white/10"
          style={{ color: "#A2C3DF", borderColor: "rgba(162,195,223,0.3)" }}
        >
          {config.ctaSecondaryText}
        </button>
      </div>

      {/* Trust bar */}
      <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "#73A8CF" }}>
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4" /> Trusted by 250+ users
        </span>
        <span className="flex items-center gap-2">
          <Building2 className="w-4 h-4" /> 15+ industries
        </span>
        <span className="flex items-center gap-2">
          <Globe className="w-4 h-4" /> Pan-African reach
        </span>
      </div>
    </>
  );
}

// ─── Contact item ─────────────────────────────────────────────────────────────
function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: "#E6EDF5", color: "#0B4A8B" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          {label}
        </p>
        {href ? (
          <a href={href} className="text-slate-800 font-medium hover:text-blue-600 transition-colors">
            {value}
          </a>
        ) : (
          <p className="text-slate-800 font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4">{icon}</div>
      <p className="text-slate-400 text-sm max-w-xs">{text}</p>
    </div>
  );
}
