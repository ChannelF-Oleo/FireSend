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
  doc,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Activity,
  TrendingUp,
  Inbox,
  Settings,
  AlertCircle,
  CheckCircle2,
  BotOff,
} from "lucide-react";

interface Metrics {
  conversationsToday: number;
  totalConversations: number;
  leadsNegotiation: number;
  unreadMessages: number;
  botPausedCount: number;
  isConfigured: boolean;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics>({
    conversationsToday: 0,
    totalConversations: 0,
    leadsNegotiation: 0,
    unreadMessages: 0,
    botPausedCount: 0,
    isConfigured: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkConfig = async () => {
      const tenantDoc = await getDoc(doc(db, "tenants", user.uid));
      const data = tenantDoc.data();
      setMetrics((prev) => ({
        ...prev,
        isConfigured: !!(data?.instagramToken && data?.geminiKey),
      }));
    };
    checkConfig();

    const conversationsRef = collection(db, "conversations");
    const qAll = query(conversationsRef, where("tenant_id", "==", user.uid));

    const unsubscribe = onSnapshot(qAll, (snapshot) => {
      let conversationsToday = 0;
      let leadsNegotiation = 0;
      let unreadMessages = 0;
      let botPausedCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.last_message_at?.toDate() >= today) conversationsToday++;
        if (data.stage === "negotiation") leadsNegotiation++;
        if (data.unread_count && data.unread_count > 0)
          unreadMessages += data.unread_count;
        if (data.bot_paused) botPausedCount++;
      });

      setMetrics((prev) => ({
        ...prev,
        conversationsToday,
        totalConversations: snapshot.size,
        leadsNegotiation,
        unreadMessages,
        botPausedCount,
      }));
      setLoading(false);
    });

    return () => unsubscribe();
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

      {!metrics.isConfigured && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800">
              Configuración pendiente
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Conecta tu Instagram y configura tu API de Gemini para empezar.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900 mt-2"
            >
              <Settings className="h-4 w-4" /> Ir a Configuración
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-[#FF4D00]" />
            </div>
            {metrics.conversationsToday > 0 && (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <p className="text-xs font-medium text-[#6B6966] mb-1">
            Conversaciones Hoy
          </p>
          <p className="text-2xl font-bold text-[#1A1818]">
            {metrics.conversationsToday}
          </p>
        </div>

        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center mb-3">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-xs font-medium text-[#6B6966] mb-1">
            Total Contactos
          </p>
          <p className="text-2xl font-bold text-[#1A1818]">
            {metrics.totalConversations}
          </p>
        </div>

        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center mb-3">
            <Activity className="h-5 w-5 text-violet-500" />
          </div>
          <p className="text-xs font-medium text-[#6B6966] mb-1">
            En Negociación
          </p>
          <p className="text-2xl font-bold text-[#1A1818]">
            {metrics.leadsNegotiation}
          </p>
        </div>

        <Link href="/dashboard/inbox">
          <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
                <Inbox className="h-5 w-5 text-amber-500" />
              </div>
              {metrics.unreadMessages > 0 && (
                <span className="h-2 w-2 rounded-full bg-[#FF4D00] animate-pulse" />
              )}
            </div>
            <p className="text-xs font-medium text-[#6B6966] mb-1">No Leídos</p>
            <p className="text-2xl font-bold text-[#1A1818]">
              {metrics.unreadMessages}
            </p>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${metrics.isConfigured ? "bg-emerald-100" : "bg-gray-100"}`}
              >
                {metrics.isConfigured ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1818]">
                  Estado del Bot
                </p>
                <p
                  className={`text-xs ${metrics.isConfigured ? "text-emerald-600" : "text-gray-500"}`}
                >
                  {metrics.isConfigured
                    ? "Activo y respondiendo"
                    : "Pendiente de configuración"}
                </p>
              </div>
            </div>
            {metrics.isConfigured && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                Online
              </span>
            )}
          </div>
        </div>

        {metrics.botPausedCount > 0 && (
          <Link href="/dashboard/inbox">
            <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200/50 shadow-sm cursor-pointer hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <BotOff className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Bot Pausado
                  </p>
                  <p className="text-xs text-amber-700">
                    {metrics.botPausedCount} conversación(es) en modo manual
                  </p>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/inbox">
          <div className="p-5 bg-gradient-to-br from-[#FF4D00] to-[#FF6B2B] rounded-2xl text-white cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <Inbox className="h-6 w-6" />
              <div>
                <p className="font-semibold">Ver Bandeja de Entrada</p>
                <p className="text-sm text-white/80">
                  Gestiona tus conversaciones
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/settings">
          <div className="p-5 bg-gradient-to-br from-[#1A1818] to-[#2D2A2A] rounded-2xl text-white cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <div>
                <p className="font-semibold">Configuración</p>
                <p className="text-sm text-white/80">
                  Ajusta tu bot y conexiones
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
