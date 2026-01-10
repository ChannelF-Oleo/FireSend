"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  limit,
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
  Clock,
  Bot,
  UserCheck,
  Zap,
  Smile,
} from "lucide-react";

interface Metrics {
  conversationsToday: number;
  totalConversations: number;
  leadsNegotiation: number;
  unreadMessages: number;
  botPausedCount: number;
  isConfigured: boolean;
  isBotActive: boolean;
}

interface DailyStats {
  total_messages: number;
  ai_messages: number;
  user_messages: number;
  human_interventions: number;
  time_saved_minutes: number;
  new_conversations: number;
  hourly_messages: Record<string, number>;
  total_sentiment: number;
  sentiment_count: number;
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
    isBotActive: true,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    total_messages: 0,
    ai_messages: 0,
    user_messages: 0,
    human_interventions: 0,
    time_saved_minutes: 0,
    new_conversations: 0,
    hourly_messages: {},
    total_sentiment: 0,
    sentiment_count: 0,
  });
  const [weeklyMessages, setWeeklyMessages] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = new Date().toISOString().split("T")[0];

    // Cargar configuración del tenant
    const checkConfig = async () => {
      const tenantDoc = await getDoc(doc(db, "tenants", user.uid));
      const data = tenantDoc.data();
      setMetrics((prev) => ({
        ...prev,
        isConfigured: !!data?.instagramToken,
        isBotActive: data?.isBotActive !== false,
      }));
    };
    checkConfig();

    // Escuchar stats del día
    const statsRef = doc(db, "tenants", user.uid, "stats_daily", dateKey);
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DailyStats;
        setDailyStats({
          total_messages: data.total_messages || 0,
          ai_messages: data.ai_messages || 0,
          user_messages: data.user_messages || 0,
          human_interventions: data.human_interventions || 0,
          time_saved_minutes: data.time_saved_minutes || 0,
          new_conversations: data.new_conversations || 0,
          hourly_messages: data.hourly_messages || {},
          total_sentiment: data.total_sentiment || 0,
          sentiment_count: data.sentiment_count || 0,
        });
      }
    });

    // Cargar stats de los últimos 7 días para el gráfico
    const loadWeeklyStats = async () => {
      const weekData: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        const dayDoc = await getDoc(
          doc(db, "tenants", user.uid, "stats_daily", key),
        );
        weekData.push(dayDoc.exists() ? dayDoc.data()?.total_messages || 0 : 0);
      }
      setWeeklyMessages(weekData);
    };
    loadWeeklyStats();

    // Escuchar conversaciones
    const conversationsRef = collection(db, "conversations");
    const qAll = query(conversationsRef, where("tenant_id", "==", user.uid));

    const unsubConversations = onSnapshot(qAll, (snapshot) => {
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

    return () => {
      unsubStats();
      unsubConversations();
    };
  }, [user]);

  // Calcular tasa de desvío (deflection rate)
  const deflectionRate =
    dailyStats.total_messages > 0
      ? Math.round(
          ((dailyStats.ai_messages - dailyStats.human_interventions) /
            dailyStats.ai_messages) *
            100,
        ) || 0
      : 0;

  // Calcular sentimiento promedio (1-10)
  const avgSentiment =
    dailyStats.sentiment_count > 0
      ? Math.round(
          (dailyStats.total_sentiment / dailyStats.sentiment_count) * 10,
        ) / 10
      : 0;

  // Emoji y color según sentimiento
  const getSentimentDisplay = (score: number) => {
    if (score === 0)
      return { emoji: "😐", color: "text-gray-500", label: "Sin datos" };
    if (score >= 7)
      return { emoji: "😊", color: "text-emerald-500", label: "Positivo" };
    if (score >= 4)
      return { emoji: "😐", color: "text-amber-500", label: "Neutral" };
    return { emoji: "😟", color: "text-red-500", label: "Negativo" };
  };

  const sentimentDisplay = getSentimentDisplay(avgSentiment);

  // Formatear tiempo ahorrado
  const formatTimeSaved = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Obtener el máximo para el gráfico
  const maxMessages = Math.max(...weeklyMessages, 1);

  // Días de la semana
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const todayIndex = new Date().getDay();
  const orderedDays = [
    ...weekDays.slice((todayIndex + 1) % 7),
    ...weekDays.slice(0, (todayIndex + 1) % 7),
  ];

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
              Conecta tu Instagram para empezar a recibir mensajes.
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

      {!metrics.isBotActive && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <BotOff className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800">
              Bot pausado globalmente
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Los mensajes se están guardando pero no se responden
              automáticamente.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900 mt-2"
            >
              <Settings className="h-4 w-4" /> Activar Bot
            </Link>
          </div>
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#FF4D00]" />
            </div>
            {metrics.conversationsToday > 0 && (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <p className="text-xs font-medium text-[#6B6966] mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-[#1A1818]">
            {metrics.totalConversations}
          </p>
          <p className="text-xs text-[#6B6966] mt-1">
            +{dailyStats.new_conversations} hoy
          </p>
        </div>

        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center mb-3">
            <Zap className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-xs font-medium text-[#6B6966] mb-1">
            Tasa de Desvío
          </p>
          <p className="text-2xl font-bold text-[#1A1818]">{deflectionRate}%</p>
          <p className="text-xs text-emerald-600 mt-1">Resuelto por IA</p>
        </div>

        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center mb-3">
            <Clock className="h-5 w-5 text-violet-500" />
          </div>
          <p className="text-xs font-medium text-[#6B6966] mb-1">
            Tiempo Ahorrado
          </p>
          <p className="text-2xl font-bold text-[#1A1818]">
            {formatTimeSaved(dailyStats.time_saved_minutes)}
          </p>
          <p className="text-xs text-violet-600 mt-1">🔥 Hoy</p>
        </div>

        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 flex items-center justify-center mb-3">
            <Smile className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-xs font-medium text-[#6B6966] mb-1">Sentimiento</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sentimentDisplay.emoji}</span>
            <span className={`text-lg font-bold ${sentimentDisplay.color}`}>
              {avgSentiment > 0 ? avgSentiment.toFixed(1) : "-"}
            </span>
          </div>
          <p className={`text-xs mt-1 ${sentimentDisplay.color}`}>
            {sentimentDisplay.label}
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

      {/* Gráfico de Mensajes y Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Gráfico de barras - Mensajes por día */}
        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1A1818] mb-4">
            Mensajes (Últimos 7 días)
          </h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyMessages.map((count, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-gradient-to-t from-[#FF4D00] to-[#FF7A3D] rounded-t-md transition-all duration-300"
                  style={{
                    height: `${Math.max((count / maxMessages) * 100, 4)}%`,
                    minHeight: count > 0 ? "8px" : "4px",
                  }}
                />
                <span className="text-[10px] text-[#6B6966]">
                  {orderedDays[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución IA vs Humano */}
        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1A1818] mb-4">
            Distribución de Respuestas Hoy
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FF4D00]/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#FF4D00]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#6B6966]">
                    Atendido por IA
                  </span>
                  <span className="text-sm font-semibold text-[#1A1818]">
                    {dailyStats.ai_messages}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF4D00] rounded-full transition-all duration-500"
                    style={{
                      width: `${dailyStats.total_messages > 0 ? (dailyStats.ai_messages / dailyStats.total_messages) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#6B6966]">
                    Intervención Humana
                  </span>
                  <span className="text-sm font-semibold text-[#1A1818]">
                    {dailyStats.human_interventions}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${dailyStats.total_messages > 0 ? (dailyStats.human_interventions / dailyStats.total_messages) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Bot y Alertas */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${metrics.isBotActive && metrics.isConfigured ? "bg-emerald-100" : "bg-gray-100"}`}
              >
                {metrics.isBotActive && metrics.isConfigured ? (
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
                  className={`text-xs ${metrics.isBotActive && metrics.isConfigured ? "text-emerald-600" : "text-gray-500"}`}
                >
                  {!metrics.isConfigured
                    ? "Pendiente de configuración"
                    : metrics.isBotActive
                      ? "Activo y respondiendo"
                      : "Pausado globalmente"}
                </p>
              </div>
            </div>
            {metrics.isBotActive && metrics.isConfigured && (
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

      {/* Acciones Rápidas */}
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
