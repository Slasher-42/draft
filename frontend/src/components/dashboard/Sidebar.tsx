"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
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
  Bell,
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
} from "lucide-react";

const startupNav = [
  { name: "My Executions", href: "/startup/executions", icon: ClipboardList },
  { name: "New Execution", href: "/startup/execute", icon: PlusCircle },
  { name: "Account", href: "/startup/account", icon: Wallet },
  { name: "Meetups", href: "/startup/meetups", icon: Video },
  { name: "Contracts", href: "/startup/contracts", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
  { name: "My Collaborators", href: "/startup/collaborators", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const investorNav = [
  { name: "My Investments", href: "/investor/executions", icon: Briefcase },
  { name: "New Investment", href: "/investor/execute", icon: PlusCircle },
  { name: "Look Up Matches", href: "/investor/executions", icon: Search },
  { name: "Account", href: "/investor/account", icon: Wallet },
  { name: "Meetups", href: "/investor/meetups", icon: Video },
  { name: "Contracts", href: "/investor/contracts", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
  { name: "My Collaborators", href: "/investor/collaborators", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const evaluatorNav = [
  { name: "Dashboard", href: "/evaluator/dashboard", icon: LayoutDashboard },
  { name: "Pending Reviews", href: "/evaluator/reviews", icon: Eye },
  { name: "All Reviews", href: "/evaluator/reviews", icon: ClipboardList },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Home Controller", href: "/admin/home-controller", icon: Home },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Evaluators", href: "/admin/evaluators", icon: ShieldCheck },
  { name: "Executions", href: "/admin/executions", icon: ClipboardList },
  { name: "Follow Up", href: "/admin/followup", icon: Handshake },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: BookOpen },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
];

const navByRole: Record<string, typeof startupNav> = {
  STARTUP: startupNav,
  INVESTOR: investorNav,
  EVALUATOR: evaluatorNav,
  ADMIN: adminNav,
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = navByRole[user?.role ?? "STARTUP"] ?? startupNav;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  return (
    <>
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}

      <motion.aside
        className="fixed md:relative z-40 h-full flex flex-col"
        style={{ backgroundColor: "#052654", borderRight: "1px solid #07366A" }}
        initial={false}
        animate={{
          width: collapsed ? 64 : 256,
          x: isMobile && collapsed ? -64 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between p-4 min-h-[64px]"
          style={{ borderBottom: "1px solid #07366A" }}
        >
          {!collapsed && (
            <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
                <Image src="/logo.png" alt="RG Partners Logo" width={32} height={32} className="object-cover w-full h-full" />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-white text-xs tracking-widest uppercase">
                  RG Partners
                </p>
                <p className="text-[10px]" style={{ color: "#73A8CF" }}>
                  Investment Readiness
                </p>
              </div>
            </Link>
          )}

          {collapsed && (
            <div className="h-8 w-8 rounded-lg overflow-hidden mx-auto">
              <Image src="/logo.png" alt="RG Partners Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && user?.role && (
          <div className="px-4 py-2" style={{ borderBottom: "1px solid #07366A" }}>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#072452", color: "#73A8CF" }}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-2">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "text-white"
                        : "text-white/60 hover:text-white"
                    )}
                    style={
                      isActive
                        ? { backgroundColor: "var(--color-secondary)" }
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "#07366A";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "transparent";
                    }}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        collapsed ? "mx-auto" : "mr-3"
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

        {/* User footer */}
        <div className="p-3" style={{ borderTop: "1px solid #07366A" }}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-[11px] truncate" style={{ color: "#73A8CF" }}>
                  {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={logout}
                  className="text-white/40 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle />
              <button
                onClick={logout}
                className="flex items-center justify-center w-full text-white/40 hover:text-white transition-colors py-1"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}