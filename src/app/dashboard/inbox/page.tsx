"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, User, Clock } from "lucide-react";

interface Conversation {
  id: string;
  instagram_user_id: string;
  instagram_username: string;
  last_message: string;
  last_message_at: Timestamp;
  stage: string;
  unread_count?: number;
}

export default function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Query para obtener conversaciones del tenant actual
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("tenant_id", "==", user.uid),
      orderBy("last_message_at", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos: Conversation[] = [];
      snapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">
          Cargando conversaciones...
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">
          Bandeja de Entrada
        </h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              No hay conversaciones aún. Las conversaciones de Instagram
              aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Bandeja de Entrada
      </h1>

      <div className="space-y-3">
        {conversations.map((convo) => (
          <Card
            key={convo.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      @{convo.instagram_username}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {convo.last_message_at?.toDate().toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {convo.stage}
                  </span>
                  {convo.unread_count && convo.unread_count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 line-clamp-2">
                {convo.last_message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
