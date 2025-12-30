"use client";

import { Sidebar } from "@/components/ui/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* El Sidebar maneja su propia anchura y visibilidad.
        No necesitamos envolverlo en divs extraños.
      */}
      <Sidebar />

      {/* MAIN CONTENT AREA
        md:flex-1: Toma el espacio restante en desktop.
        w-full: Ocupa todo el ancho en mobile.
        mb-16: Margen abajo en mobile para que el Bottom Nav no tape el contenido.
        md:mb-0: Sin margen abajo en desktop.
        h-screen: Altura completa.
        overflow-y-auto: Scroll interno independiente del sidebar.
      */}
      <main className="flex-1 w-full h-screen overflow-y-auto mb-16 md:mb-0">
        {/* Contenedor con límites de anchura para pantallas ultra-wide */}
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
