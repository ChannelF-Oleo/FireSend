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
    // 1. Definir rango de tiempo para "Hoy"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    // 2. Referencia a la colección de conversaciones
    const conversationsRef = collection(db, "conversations");

    // Query 1: Conversaciones activas/modificadas hoy (Aprox. para mensajes)
    // Nota: Para escalabilidad total, el TDD sugiere workers[cite: 14].
    // Lo ideal es que el worker incremente un contador en 'tenants/{id}/stats'.
    // Por ahora, hacemos query directo para cumplir "no placeholders".
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

    // 3. Suscripciones en tiempo real (Snapshots)
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      setMetrics((prev) => ({ ...prev, messagesToday: snapshot.size }));
    });

    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      setMetrics((prev) => ({ ...prev, leadsCaptured: snapshot.size }));
      setLoading(false);
    });

    // Simulación de estado del bot (podría venir de tenants/{id}/status)
    setMetrics((prev) => ({ ...prev, botStatus: "Activo" }));

    return () => {
      unsubscribeMessages();
      unsubscribeLeads();
    };
  }, [user]);

  if (loading) return <div className="p-6">Cargando métricas...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Panel de Control - FireSend</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Tarjeta: Mensajes Hoy */}
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Conversaciones Hoy
          </h3>
          <p className="text-2xl font-bold">{metrics.messagesToday}</p>
        </div>

        {/* Tarjeta: Leads Capturados */}
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Leads en Negociación
          </h3>
          <p className="text-2xl font-bold">{metrics.leadsCaptured}</p>
        </div>

        {/* Tarjeta: Estado del Bot */}
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Estado del Bot
          </h3>
          <p
            className={`text-2xl font-bold ${metrics.botStatus === "Activo" ? "text-green-600" : "text-red-600"}`}
          >
            {metrics.botStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
