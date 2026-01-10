"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Clock,
  MessageSquare,
  Bot,
  UserCheck,
  Smile,
  Frown,
  Meh,
} from "lucide-react";

interface DailyStats {
  date: string;
  total_messages: number;
  ai_messages: number;
  user_messages: number;
  human_interventions: number;
  time_saved_minutes: number;
  new_conversations: number;
  total_sentiment: number;
  sentiment_count: number;
  hourly_messages?: Record<string, number>;
}

interface WeeklyData {
  day: string;
  fullDate: string;
  messages: number;
  aiMessages: number;
  humanMessages: number;
  sentiment: number;
  timeSaved: number;
}

const COLORS = ["#FF4D00", "#FF7A3D", "#FFB088"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<
    { hour: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadAnalytics = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const data: WeeklyData[] = [];

        // Cargar últimos 7 días
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split("T")[0];
          const dayName = weekDays[date.getDay()];

          const statsDoc = await getDoc(
            doc(db, "tenants", user.uid, "stats_daily", dateKey),
          );

          if (statsDoc.exists()) {
            const stats = statsDoc.data() as DailyStats;
            const avgSentiment =
              stats.sentiment_count > 0
                ? stats.total_sentiment / stats.sentiment_count
                : 5;

            data.push({
              day: dayName,
              fullDate: dateKey,
              messages: stats.total_messages || 0,
              aiMessages: stats.ai_messages || 0,
              humanMessages: stats.human_interventions || 0,
              sentiment: Math.round(avgSentiment * 10) / 10,
              timeSaved: stats.time_saved_minutes || 0,
            });

            // Guardar stats de hoy
            if (dateKey === today) {
              setTodayStats(stats);

              // Procesar heatmap
              if (stats.hourly_messages) {
                const hourlyData = [];
                for (let h = 0; h < 24; h++) {
                  hourlyData.push({
                    hour: `${h.toString().padStart(2, "0")}:00`,
                    count: stats.hourly_messages[h.toString()] || 0,
                  });
                }
                setHeatmapData(hourlyData);
              }
            }
          } else {
            data.push({
              day: dayName,
              fullDate: dateKey,
              messages: 0,
              aiMessages: 0,
              humanMessages: 0,
              sentiment: 5,
              timeSaved: 0,
            });
          }
        }

        setWeeklyData(data);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  // Calcular totales de la semana
  const weeklyTotals = weeklyData.reduce(
    (acc, day) => ({
      messages: acc.messages + day.messages,
      aiMessages: acc.aiMessages + day.aiMessages,
      humanMessages: acc.humanMessages + day.humanMessages,
      timeSaved: acc.timeSaved + day.timeSaved,
    }),
    { messages: 0, aiMessages: 0, humanMessages: 0, timeSaved: 0 },
  );

  // Calcular tasa de desvío semanal
  const weeklyDeflectionRate =
    weeklyTotals.aiMessages > 0
      ? Math.round(
          ((weeklyTotals.aiMessages - weeklyTotals.humanMessages) /
            weeklyTotals.aiMessages) *
            100,
        )
      : 0;

  // Datos para pie chart
  const pieData = [
    { name: "IA", value: weeklyTotals.aiMessages },
    { name: "Humano", value: weeklyTotals.humanMessages },
  ];

  // Formatear tiempo
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // Sentimiento promedio semanal
  const avgWeeklySentiment =
    weeklyData.length > 0
      ? weeklyData.reduce((acc, d) => acc + d.sentiment, 0) / weeklyData.length
      : 5;

  const getSentimentIcon = (score: number) => {
    if (score >= 7) return <Smile className="h-6 w-6 text-emerald-500" />;
    if (score >= 4) return <Meh className="h-6 w-6 text-amber-500" />;
    return <Frown className="h-6 w-6 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6966] text-sm">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1818] mb-2">Analíticas</h1>
        <p className="text-[#6B6966]">
          Métricas de rendimiento de los últimos 7 días
        </p>
      </div>

      {/* KPIs Semanales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6966]">Mensajes Totales</p>
                <p className="text-3xl font-bold text-[#1A1818]">
                  {weeklyTotals.messages}
                </p>
                <p className="text-xs text-[#6B6966] mt-1">Esta semana</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#FF4D00]/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-[#FF4D00]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6966]">Tasa de Desvío</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {weeklyDeflectionRate}%
                </p>
                <p className="text-xs text-emerald-600 mt-1">Resuelto por IA</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6966]">Tiempo Ahorrado</p>
                <p className="text-3xl font-bold text-violet-600">
                  {formatTime(weeklyTotals.timeSaved)}
                </p>
                <p className="text-xs text-violet-600 mt-1">🔥 Esta semana</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6966]">Sentimiento Promedio</p>
                <p className="text-3xl font-bold text-[#1A1818]">
                  {avgWeeklySentiment.toFixed(1)}
                </p>
                <p className="text-xs text-[#6B6966] mt-1">de 10</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center">
                {getSentimentIcon(avgWeeklySentiment)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Mensajes por día */}
        <Card>
          <CardHeader>
            <CardTitle>Mensajes por Día</CardTitle>
            <CardDescription>Últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                  <XAxis dataKey="day" stroke="#6B6966" fontSize={12} />
                  <YAxis stroke="#6B6966" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E8E6E3",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="aiMessages"
                    name="IA"
                    fill="#FF4D00"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="humanMessages"
                    name="Humano"
                    fill="#FFB088"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribución IA vs Humano */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Respuestas</CardTitle>
            <CardDescription>IA vs Intervención Humana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Tendencia de Sentimiento */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Sentimiento</CardTitle>
            <CardDescription>Evolución del humor de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                  <XAxis dataKey="day" stroke="#6B6966" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#6B6966" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E8E6E3",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sentiment"
                    name="Sentimiento"
                    stroke="#EC4899"
                    fill="#EC4899"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tiempo Ahorrado por día */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo Ahorrado</CardTitle>
            <CardDescription>Minutos ahorrados por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                  <XAxis dataKey="day" stroke="#6B6966" fontSize={12} />
                  <YAxis stroke="#6B6966" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E8E6E3",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value} min`, "Tiempo"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="timeSaved"
                    name="Minutos"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: "#8B5CF6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap de Actividad */}
      {heatmapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad por Hora (Hoy)</CardTitle>
            <CardDescription>
              Distribución de mensajes durante el día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                  <XAxis
                    dataKey="hour"
                    stroke="#6B6966"
                    fontSize={10}
                    interval={2}
                  />
                  <YAxis stroke="#6B6966" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E8E6E3",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Mensajes"
                    fill="#FF4D00"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
