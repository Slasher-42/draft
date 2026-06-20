"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { prefetchRoute } from "@/lib/prefetch";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Briefcase,
  Search,
  Eye,
  Users,
  ShieldCheck,
  BarChart2,
  BookOpen,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Wallet,
  Video,
  FileText,
  Home,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  GraduationCap,
  Palette,
} from "lucide-react";

const SIDEBAR_COLOR_PRESETS = [
  { name: "Navy",          gradient: "linear-gradient(180deg,#020C1B 0%,#071C38 55%,#030F1F 100%)", swatch: "#0B2A4A" },
  { name: "Charcoal",      gradient: "linear-gradient(180deg,#0A0A0A 0%,#1C1C1C 55%,#0A0A0A 100%)", swatch: "#222222" },
  { name: "Slate",         gradient: "linear-gradient(180deg,#0F172A 0%,#1E293B 55%,#0F172A 100%)", swatch: "#334155" },
  { name: "Forest",        gradient: "linear-gradient(180deg,#02160F 0%,#0B3D27 55%,#021109 100%)", swatch: "#13633F" },
  { name: "Emerald",       gradient: "linear-gradient(180deg,#031F1A 0%,#0E4A3C 55%,#021510 100%)", swatch: "#16916F" },
  { name: "Plum",          gradient: "linear-gradient(180deg,#170826 0%,#3A1559 55%,#120620 100%)", swatch: "#7C3AED" },
  { name: "Wine",          gradient: "linear-gradient(180deg,#220A14 0%,#551226 55%,#180810 100%)", swatch: "#9D2A4E" },
  { name: "Espresso",      gradient: "linear-gradient(180deg,#1B120A 0%,#3E2616 55%,#140D08 100%)", swatch: "#7C4A26" },
  { name: "Midnight Teal", gradient: "linear-gradient(180deg,#021A1C 0%,#0A3F45 55%,#021416 100%)", swatch: "#10707A" },
  { name: "Indigo",        gradient: "linear-gradient(180deg,#0A0A2E 0%,#1E1E5C 55%,#08081F 100%)", swatch: "#3B3BA8" },
  { name: "White",         gradient: "linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 55%,#FFFFFF 100%)", swatch: "#FFFFFF", light: true },
  { name: "Pearl",         gradient: "linear-gradient(180deg,#F1F5F9 0%,#E2E8F0 55%,#F1F5F9 100%)", swatch: "#E2E8F0", light: true },
  { name: "Sky",           gradient: "linear-gradient(180deg,#EFF6FF 0%,#DBEAFE 55%,#EFF6FF 100%)", swatch: "#BFDBFE", light: true },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const ts = useTranslations("sidebar");

  const startupNav = [
    { name: t("startup.myExecutions"),    href: "/startup/executions",    icon: ClipboardList },
    { name: t("startup.newExecution"),    href: "/startup/execute",       icon: PlusCircle    },
    { name: t("startup.messages"),        href: "/startup/messages",      icon: MessageSquare },
    { name: t("startup.account"),         href: "/startup/account",       icon: Wallet        },
    { name: t("startup.meetups"),         href: "/startup/meetups",       icon: Video         },
    { name: t("startup.contracts"),       href: "/startup/contracts",     icon: FileText      },
    { name: t("startup.profile"),         href: "/profile",               icon: User          },
    { name: t("startup.myCollaborators"), href: "/startup/collaborators", icon: Users         },
    { name: t("startup.settings"),        href: "/settings",              icon: Settings      },
  ];

  const investorNav = [
    { name: t("investor.myInvestments"),    href: "/investor/executions",    icon: Briefcase      },
    { name: t("investor.newInvestment"),    href: "/investor/execute",       icon: PlusCircle     },
    { name: t("investor.lookUpMatches"),    href: "/investor/executions",    icon: Search         },
    { name: t("investor.messages"),         href: "/investor/messages",      icon: MessageSquare  },
    { name: t("investor.account"),          href: "/investor/account",       icon: Wallet         },
    { name: t("investor.meetups"),          href: "/investor/meetups",       icon: Video          },
    { name: t("investor.contracts"),        href: "/investor/contracts",     icon: FileText       },
    { name: t("investor.profile"),          href: "/profile",                icon: User           },
    { name: t("investor.myCollaborators"),  href: "/investor/collaborators", icon: Users          },
    { name: t("investor.settings"),         href: "/settings",               icon: Settings       },
  ];

  const evaluatorNav = [
    { name: t("evaluator.dashboard"),         href: "/evaluator/dashboard",          icon: LayoutDashboard },
    { name: t("evaluator.pendingReviews"),    href: "/evaluator/reviews",            icon: Eye             },
    { name: t("evaluator.allReviews"),        href: "/evaluator/reviews",            icon: ClipboardList   },
    { name: t("evaluator.investmentMonitor"), href: "/evaluator/investment-monitor", icon: TrendingUp      },
    { name: t("evaluator.profile"),           href: "/profile",                      icon: User            },
    { name: t("evaluator.settings"),          href: "/settings",                     icon: Settings        },
  ];

  const adminNav = [
    { name: t("admin.dashboard"),          href: "/admin/dashboard",          icon: LayoutDashboard },
    { name: t("admin.homeController"),     href: "/admin/home-controller",    icon: Home            },
    { name: t("admin.userManagement"),     href: "/admin/users",              icon: Users           },
    { name: t("admin.evaluators"),         href: "/admin/evaluators",         icon: ShieldCheck     },
    { name: t("admin.executions"),         href: "/admin/executions",         icon: ClipboardList   },
    { name: t("admin.escalations"),        href: "/admin/escalations",        icon: AlertTriangle   },
    { name: t("admin.followUp"),           href: "/admin/followup",           icon: Handshake       },
    { name: t("admin.alumniMonitor"),      href: "/admin/alumni",             icon: GraduationCap   },
    { name: t("admin.investmentMonitor"),  href: "/admin/investment-monitor", icon: TrendingUp      },
    { name: t("admin.analytics"),          href: "/admin/analytics",          icon: BarChart2       },
    { name: t("admin.auditLogs"),          href: "/admin/audit-logs",         icon: BookOpen        },
    { name: t("admin.systemSettings"),     href: "/admin/settings",           icon: Settings        },
  ];

  const navByRole: Record<string, typeof startupNav> = {
    STARTUP:   startupNav,
    INVESTOR:  investorNav,
    EVALUATOR: evaluatorNav,
    ADMIN:     adminNav,
  };

  const roleColors: Record<string, string> = {
    STARTUP:   "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300",
    INVESTOR:  "from-blue-500/20 to-blue-600/10 border-blue-400/30 text-blue-300",
    EVALUATOR: "from-violet-500/20 to-violet-600/10 border-violet-400/30 text-violet-300",
    ADMIN:     "from-amber-500/20 to-amber-600/10 border-amber-400/30 text-amber-300",
  };

  const roleColorsLight: Record<string, string> = {
    STARTUP:   "from-emerald-500/15 to-emerald-600/10 border-emerald-500/30 text-emerald-700",
    INVESTOR:  "from-blue-500/15 to-blue-600/10 border-blue-400/30 text-blue-700",
    EVALUATOR: "from-violet-500/15 to-violet-600/10 border-violet-400/30 text-violet-700",
    ADMIN:     "from-amber-500/15 to-amber-600/10 border-amber-400/30 text-amber-700",
  };

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [sidebarBg, setSidebarBg] = useState(SIDEBAR_COLOR_PRESETS[0].gradient);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const pathname    = usePathname();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const navigation = navByRole[user?.role ?? "STARTUP"] ?? startupNav;
  const isLightBg  = SIDEBAR_COLOR_PRESETS.find((p) => p.gradient === sidebarBg)?.light ?? false;
  const roleColor  = (isLightBg ? roleColorsLight : roleColors)[user?.role ?? "STARTUP"] ?? (isLightBg ? roleColorsLight.INVESTOR : roleColors.INVESTOR);

  const c = {
    heading:     isLightBg ? "text-slate-800" : "text-white",
    body:        isLightBg ? "text-slate-700" : "text-white",
    subtle:      isLightBg ? "text-slate-500" : "text-white/50",
    faint:       isLightBg ? "text-slate-400" : "text-white/40",
    faintest:    isLightBg ? "text-slate-400" : "text-white/30",
    accentText:  isLightBg ? "#1B4965" : "#73A8CF",
    activeIcon:  isLightBg ? "#1B4965" : "#73A8CF",
    border:      isLightBg ? "rgba(15,23,42,0.1)"  : "rgba(115,168,207,0.1)",
    borderFaint: isLightBg ? "rgba(15,23,42,0.07)" : "rgba(115,168,207,0.08)",
    iconHoverBg: isLightBg ? "hover:bg-black/5" : "hover:bg-white/8",
    hoverOverlay: isLightBg ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.05)",
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  useEffect(() => {
    const saved = localStorage.getItem("rg-sidebar-bg");
    if (saved) setSidebarBg(saved);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSidebarColor = (gradient: string) => {
    setSidebarBg(gradient);
    localStorage.setItem("rg-sidebar-bg", gradient);
    setShowColorPicker(false);
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  return (
    <>
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setCollapsed(true)}
        />
      )}

      <motion.aside
        className="fixed md:relative z-40 h-full flex flex-col overflow-hidden"
        style={{
          background: sidebarBg,
          borderRight: "1px solid rgba(115,168,207,0.1)",
        }}
        initial={false}
        animate={{ width: collapsed ? 64 : 256, x: isMobile && collapsed ? -64 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {/* Subtle ambient glow top-right */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(47,114,165,0.08) 0%,transparent 70%)", zIndex: 0 }}
        />

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div
          className="relative z-10 flex items-center justify-between p-4 min-h-[64px]"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/home" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                    <Image src="/logo.png" alt="RG Partners Logo" width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                  <div className="leading-tight">
                    <p className={cn("font-bold text-xs tracking-widest uppercase", c.heading)}>
                      RG Partners
                    </p>
                    <p className="text-[10px]" style={{ color: c.accentText }}>
                      {ts("investmentReadiness")}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="h-8 w-8 rounded-lg overflow-hidden mx-auto ring-1 ring-white/10">
              <Image src="/logo.png" alt="RG Partners Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden md:flex h-6 w-6 items-center justify-center rounded-md transition-all flex-shrink-0",
              c.faint, isLightBg ? "hover:text-slate-800" : "hover:text-white", c.iconHoverBg
            )}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* ── Sidebar colour picker ───────────────────────────────────────── */}
        <div
          className="relative z-20 flex items-center px-4 py-2"
          style={{ borderBottom: `1px solid ${c.borderFaint}` }}
          ref={colorPickerRef}
        >
          <button
            onClick={() => setShowColorPicker((v) => !v)}
            title={ts("changeColor")}
            className={cn(
              "flex items-center gap-2 h-7 rounded-md transition-all px-2",
              c.faint, isLightBg ? "hover:text-slate-800" : "hover:text-white", c.iconHoverBg,
              collapsed && "mx-auto px-0 w-7 justify-center"
            )}
          >
            <Palette className="h-3.5 w-3.5 flex-shrink-0" />
            {!collapsed && <span className="text-[11px]">{ts("changeColor")}</span>}
          </button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-2 mt-1 grid grid-cols-5 gap-2 p-3 rounded-lg shadow-xl z-30"
                style={{ background: "#0B1E33", border: "1px solid rgba(115,168,207,0.2)" }}
              >
                {SIDEBAR_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => selectSidebarColor(preset.gradient)}
                    title={preset.name}
                    className="h-6 w-6 rounded-full ring-1 ring-white/20 hover:ring-white/60 hover:scale-110 transition-all flex-shrink-0"
                    style={{
                      background: preset.swatch,
                      boxShadow: sidebarBg === preset.gradient ? "0 0 0 2px #2F72A5" : undefined,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Role badge ───────────────────────────────────────────────── */}
        {!collapsed && user?.role && (
          <div
            className="relative z-10 px-4 py-2.5"
            style={{ borderBottom: `1px solid ${c.borderFaint}` }}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r border",
                roleColor
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {user.role}
            </span>
          </div>
        )}

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav className="relative z-10 flex-1 overflow-y-auto py-3 scrollbar-thin">
          <ul className="space-y-0.5 px-2">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                      isActive
                        ? c.heading
                        : cn(c.subtle, isLightBg ? "hover:text-slate-800" : "hover:text-white/90")
                    )}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(90deg,rgba(47,114,165,0.28) 0%,rgba(47,114,165,0.08) 100%)",
                            borderLeft: "3px solid #2F72A5",
                            boxShadow: "inset 0 0 24px rgba(47,114,165,0.1)",
                          }
                        : { borderLeft: "3px solid transparent" }
                    }
                    onMouseEnter={(e) => {
                      prefetchRoute(queryClient, item.href, Number(user?.id));
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = c.hoverOverlay;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "transparent";
                      }
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                        style={{ background: "#2F72A5", boxShadow: "0 0 8px #2F72A5" }}
                      />
                    )}

                    <item.icon
                      className={cn(
                        "h-4.5 w-4.5 flex-shrink-0 transition-colors",
                        collapsed ? "mx-auto h-5 w-5" : "mr-3",
                        isActive
                          ? ""
                          : cn(c.faint, isLightBg ? "group-hover:text-slate-600" : "group-hover:text-white/70")
                      )}
                      style={isActive ? { color: c.activeIcon } : undefined}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── User footer ──────────────────────────────────────────────── */}
        <div
          className="relative z-10 p-3"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#0B4A8B,#2F72A5)",
                  boxShadow: "0 0 0 2px rgba(47,114,165,0.4), 0 0 12px rgba(47,114,165,0.2)",
                }}
              >
                {user?.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user?.fullName ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold truncate leading-tight", c.heading)}>
                  {user?.fullName || "User"}
                </p>
                <p className="text-[10px] truncate mt-0.5" style={{ color: c.accentText }}>
                  {user?.email}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <LanguageSwitcher compact />
                <ThemeToggle />
                <button
                  onClick={logout}
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md hover:text-red-400 hover:bg-red-400/10 transition-all",
                    c.faintest
                  )}
                  title={ts("logout")}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{
                  background: "linear-gradient(135deg,#0B4A8B,#2F72A5)",
                  boxShadow: "0 0 0 1.5px rgba(47,114,165,0.4)",
                }}
              >
                {initials}
              </div>
              <LanguageSwitcher compact />
              <ThemeToggle />
              <button
                onClick={logout}
                className={cn(
                  "flex items-center justify-center w-full hover:text-red-400 hover:bg-red-400/10 transition-all py-1 rounded-md",
                  c.faintest
                )}
                title={ts("logout")}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
