"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { MobileNav } from "./mobile-nav";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  BookOpen,
  BarChart3,
  Zap,
} from "lucide-react";

const log = logger.module("Sidebar");

const ROUTES = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    match: "/dashboard",
  },
  {
    label: "Inbox",
    icon: MessageSquare,
    href: "/dashboard/inbox",
    match: "/dashboard/inbox",
  },
  {
    label: "Analíticas",
    icon: BarChart3,
    href: "/dashboard/analytics",
    match: "/dashboard/analytics",
  },
  {
    label: "Triggers",
    icon: Zap,
    href: "/dashboard/triggers",
    match: "/dashboard/triggers",
  },
  {
    label: "Knowledge Base",
    icon: BookOpen,
    href: "/dashboard/knowledge",
    match: "/dashboard/knowledge",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/dashboard/settings",
    match: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      log.info("Iniciando cierre de sesión...");
      await signOut(auth);
      toast.success("Sesión cerrada correctamente");
      log.success("Sesión cerrada exitosamente");
      router.push("/login");
    } catch (error) {
      log.error("Error al cerrar sesión", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-white/70 backdrop-blur-xl border-r border-white/50 transition-all duration-300 relative z-20 sticky top-0",
          isCollapsed ? "w-20" : "w-64 lg:w-72",
        )}
      >
        {/* Collapse Button */}
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            log.debug("Sidebar colapsado", { isCollapsed: !isCollapsed });
          }}
          className="absolute -right-3 top-8 h-7 w-7 bg-white border border-[#E8E6E3] shadow-md rounded-full flex items-center justify-center hover:bg-[#F9F8F6] hover:border-[#FF4D00] transition-all duration-200 z-30 group"
        >
          {isCollapsed ? (
            <ChevronRight
              size={14}
              className="text-[#6B6966] group-hover:text-[#FF4D00]"
            />
          ) : (
            <ChevronLeft
              size={14}
              className="text-[#6B6966] group-hover:text-[#FF4D00]"
            />
          )}
        </button>

        {/* Logo */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-[#E8E6E3]/50 px-4",
            isCollapsed ? "justify-center" : "justify-start gap-3",
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-[#FF4D00] to-[#FF7A3D] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#FF4D00]/20">
              <Flame size={20} fill="currentColor" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-[#1A1818] tracking-tight">
                FireSend
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 flex flex-col gap-1.5 px-3 overflow-y-auto">
          {ROUTES.map((route, index) => (
            <Link
              key={route.href}
              href={route.href}
              title={isCollapsed ? route.label : undefined}
              style={{ animationDelay: `${index * 50}ms` }}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-in group",
                isActive(route.match)
                  ? "bg-[#FF4D00]/10 text-[#FF4D00] shadow-sm"
                  : "text-[#6B6966] hover:bg-[#F5F4F2] hover:text-[#1A1818]",
                isCollapsed && "justify-center px-0",
              )}
            >
              <route.icon
                size={20}
                className={cn(
                  "transition-all duration-200 shrink-0",
                  isActive(route.match)
                    ? "text-[#FF4D00]"
                    : "text-[#6B6966] group-hover:text-[#1A1818]",
                )}
              />
              {!isCollapsed && <span className="truncate">{route.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-[#E8E6E3]/50">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-[#6B6966] hover:text-red-500 hover:bg-red-50 transition-all duration-200",
              isCollapsed && "justify-center px-0",
            )}
            title="Cerrar Sesión"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE NAVIGATION - Componente separado optimizado */}
      <MobileNav />
    </>
  );
}
