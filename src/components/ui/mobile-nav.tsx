"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  Settings,
  LogOut,
  Zap,
  BookOpen,
  Flame,
  ChevronRight,
} from "lucide-react";

const log = logger.module("MobileNav");

// 4 iconos principales para la barra inferior
const MAIN_NAV_ITEMS = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Inbox", icon: MessageSquare, href: "/dashboard/inbox" },
  { label: "Stats", icon: BarChart3, href: "/dashboard/analytics" },
];

// Items adicionales para el menú hamburguesa
const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Inbox", icon: MessageSquare, href: "/dashboard/inbox" },
  { label: "Analíticas", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Triggers", icon: Zap, href: "/dashboard/triggers" },
  { label: "Knowledge Base", icon: BookOpen, href: "/dashboard/knowledge" },
  { label: "Configuración", icon: Settings, href: "/dashboard/settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      log.info("Cerrando sesión...");
      await signOut(auth);
      toast.success("Sesión cerrada correctamente");
      log.success("Sesión cerrada");
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
      {/* Bottom Navigation Bar - Solo móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-[#E8E6E3]/50 z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(26,24,24,0.08)]">
        {MAIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
              isActive(item.href)
                ? "text-[#FF4D00]"
                : "text-[#6B6966] active:text-[#FF4D00]",
            )}
          >
            <item.icon
              size={22}
              strokeWidth={isActive(item.href) ? 2.5 : 2}
              className={cn(
                "transition-transform duration-200",
                isActive(item.href) && "scale-110",
              )}
            />
            <span className="text-[10px] font-semibold mt-1">{item.label}</span>
          </Link>
        ))}

        {/* Botón Menú Hamburguesa */}
        <button
          onClick={() => {
            setIsMenuOpen(true);
            log.debug("Menú abierto");
          }}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
            isMenuOpen ? "text-[#FF4D00]" : "text-[#6B6966]",
          )}
        >
          <Menu size={22} strokeWidth={2} />
          <span className="text-[10px] font-semibold mt-1">Más</span>
        </button>
      </nav>

      {/* Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Slide-up Menu Panel */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] transition-transform duration-300 ease-out max-h-[85vh] overflow-hidden",
          isMenuOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#E8E6E3] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E3]/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-[#FF4D00] to-[#FF7A3D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4D00]/20">
              <Flame size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-[#1A1818]">FireSend</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="h-10 w-10 rounded-xl bg-[#F5F4F2] flex items-center justify-center text-[#6B6966] hover:bg-[#E8E6E3] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-1">
            {MENU_ITEMS.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${index * 30}ms` }}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 animate-fade-in",
                  isActive(item.href)
                    ? "bg-[#FF4D00]/10 text-[#FF4D00]"
                    : "text-[#1A1818] hover:bg-[#F5F4F2] active:bg-[#E8E6E3]",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight
                  size={18}
                  className={cn(
                    "transition-colors",
                    isActive(item.href) ? "text-[#FF4D00]" : "text-[#9B9895]",
                  )}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-[#E8E6E3]/50 pb-safe">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-200 font-medium"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
