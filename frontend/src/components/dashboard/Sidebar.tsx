"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

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

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const pathname    = usePathname();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const navigation = navByRole[user?.role ?? "STARTUP"] ?? startupNav;
  const roleColor  = roleColors[user?.role ?? "STARTUP"] ?? roleColors.INVESTOR;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

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
          background: "linear-gradient(180deg,#020C1B 0%,#071C38 55%,#030F1F 100%)",
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
          style={{ borderBottom: "1px solid rgba(115,168,207,0.1)" }}
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
                    <p className="font-bold text-white text-xs tracking-widest uppercase">
                      RG Partners
                    </p>
                    <p className="text-[10px]" style={{ color: "#73A8CF" }}>
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
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-all flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* ── Role badge ───────────────────────────────────────────────── */}
        {!collapsed && user?.role && (
          <div
            className="relative z-10 px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(115,168,207,0.08)" }}
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
                        ? "text-white"
                        : "text-white/50 hover:text-white/90"
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
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "rgba(255,255,255,0.05)";
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
                        isActive ? "text-[#73A8CF]" : "text-white/40 group-hover:text-white/70"
                      )}
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
          style={{ borderTop: "1px solid rgba(115,168,207,0.1)" }}
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
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.fullName || "User"}
                </p>
                <p className="text-[10px] truncate mt-0.5" style={{ color: "#73A8CF" }}>
                  {user?.email}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <LanguageSwitcher compact />
                <ThemeToggle />
                <button
                  onClick={logout}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
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
                className="flex items-center justify-center w-full text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all py-1 rounded-md"
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
