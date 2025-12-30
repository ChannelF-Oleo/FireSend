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
  limit,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, User, Clock, ChevronRight } from "lucide-react";

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

    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("tenant_id", "==", user.uid),
      orderBy("last_message_at", "desc"),
      limit(50), // Paginación básica
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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "negotiation":
        return "bg-violet-50 text-violet-600 border-violet-100";
      case "active":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "closed":
        return "bg-gray-50 text-gray-600 border-gray-100";
      default:
        return "bg-[#F5F4F2] text-[#6B6966] border-[#E8E6E3]";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6966] text-sm">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1818] mb-2">
          Bandeja de Entrada
        </h1>
        <p className="text-[#6B6966]">
          Gestiona tus conversaciones de Instagram
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-[#F5F4F2] flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-[#6B6966]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1818] mb-2">
              Sin conversaciones
            </h3>
            <p className="text-[#6B6966] text-center max-w-sm">
              Las conversaciones de Instagram aparecerán aquí cuando configures
              tu webhook.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {conversations.map((convo) => (
            <Card
              key={convo.id}
              className="group cursor-pointer hover:-translate-y-0.5"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <User className="h-6 w-6 text-[#FF4D00]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-[#1A1818]">
                        @{convo.instagram_username}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1.5 mt-1 text-[#6B6966]">
                        <Clock className="h-3 w-3" />
                        {convo.last_message_at
                          ?.toDate()
                          .toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${getStageColor(convo.stage)}`}
                      >
                        {convo.stage}
                      </span>
                      {convo.unread_count && convo.unread_count > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4D00] text-white font-bold min-w-[20px] text-center">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#6B6966] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B6966] line-clamp-2 leading-relaxed">
                  {convo.last_message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
