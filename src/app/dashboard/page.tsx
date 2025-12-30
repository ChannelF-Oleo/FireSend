"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { MessageSquare, Users, Activity, TrendingUp } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    messagesToday: 0,
    leadsCaptured: 0,
    botStatus: "Inactivo",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const conversationsRef = collection(db, "conversations");

    const qMessages = query(
      conversationsRef,
      where("tenant_id", "==", user.uid),
      where("last_message_at", ">=", todayTimestamp),
    );

    const qLeads = query(
      conversationsRef,
      where("tenant_id", "==", user.uid),
      where("stage", "==", "negotiation"),
    );

    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      setMetrics((prev) => ({ ...prev, messagesToday: snapshot.size }));
    });

    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      setMetrics((prev) => ({ ...prev, leadsCaptured: snapshot.size }));
      setLoading(false);
    });

    setMetrics((prev) => ({ ...prev, botStatus: "Activo" }));

    return () => {
      unsubscribeMessages();
      unsubscribeLeads();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6966] text-sm">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1818] mb-2">
          Panel de Control
        </h1>
        <p className="text-[#6B6966]">Resumen de tu actividad en FireSend</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {/* Conversaciones Hoy */}
        <div className="group p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(26,24,24,0.06)] hover:shadow-[0_12px_40px_rgba(26,24,24,0.1)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="h-6 w-6 text-[#FF4D00]" />
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-[#6B6966] mb-1">
            Conversaciones Hoy
          </p>
          <p className="text-3xl font-bold text-[#1A1818]">
            {metrics.messagesToday}
          </p>
        </div>

        {/* Leads en Negociación */}
        <div className="group p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(26,24,24,0.06)] hover:shadow-[0_12px_40px_rgba(26,24,24,0.1)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-violet-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-[#6B6966] mb-1">
            Leads en Negociación
          </p>
          <p className="text-3xl font-bold text-[#1A1818]">
            {metrics.leadsCaptured}
          </p>
        </div>

        {/* Estado del Bot */}
        <div className="group p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(26,24,24,0.06)] hover:shadow-[0_12px_40px_rgba(26,24,24,0.1)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
            {metrics.botStatus === "Activo" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[#6B6966] mb-1">
            Estado del Bot
          </p>
          <p
            className={`text-3xl font-bold ${metrics.botStatus === "Activo" ? "text-emerald-600" : "text-red-500"}`}
          >
            {metrics.botStatus}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gradient-to-br from-[#1A1818] to-[#2D2A2A] rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">
          ¿Necesitas ayuda?
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Configura tu bot de IA en la sección de configuración para empezar a
          automatizar.
        </p>
        <a
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF4D00] text-white text-sm font-semibold rounded-xl hover:bg-[#E64500] transition-colors"
        >
          Ir a Configuración
        </a>
      </div>
    </div>
  );
}
