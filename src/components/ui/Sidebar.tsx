"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from "lucide-react";

// Configuración de rutas (Centralizada para fácil edición)
const ROUTES = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    match: "/dashboard" // Para detectar active state exacto o parcial
  },
  {
    label: "Inbox",
    icon: MessageSquare,
    href: "/dashboard/inbox",
    match: "/dashboard/inbox"
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/dashboard/settings",
    match: "/dashboard/settings"
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Función de Logout conectada a Firebase
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    } catch (error) {
      console.error("Error al salir:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  // Helper para saber si una ruta está activa
  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* =========================================================
          DESKTOP SIDEBAR (Oculto en móvil 'hidden md:flex')
         ========================================================= */}
      <aside 
        className={cn(
          "hidden md:flex flex-col h-screen border-r bg-white transition-all duration-300 relative z-20",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Botón de Colapso */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 h-6 w-6 bg-white border shadow-sm rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors z-30"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo / Header */}
        <div className={cn("h-16 flex items-center border-b px-4", isCollapsed ? "justify-center" : "justify-start gap-3")}>
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Zap size={18} fill="currentColor" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-slate-800 tracking-tight">FireSend</span>
          )}
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
          {ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              title={isCollapsed ? route.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                isActive(route.match) 
                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                isCollapsed && "justify-center px-0"
              )}
            >
              <route.icon size={20} className={cn(isActive(route.match) ? "text-blue-600" : "text-slate-500")} />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t bg-slate-50/50">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors",
              isCollapsed && "justify-center px-0"
            )}
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>


      {/* =========================================================
          MOBILE BOTTOM NAV (Visible solo en móvil 'md:hidden')
         ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        {ROUTES.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              isActive(route.match) ? "text-blue-600" : "text-slate-400"
            )}
          >
            <route.icon size={22} strokeWidth={isActive(route.match) ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{route.label}</span>
          </Link>
        ))}
        
        {/* Mobile Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 hover:text-red-500"
        >
          <LogOut size={22} />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>
    </>
  );
}

