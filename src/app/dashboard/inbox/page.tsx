"use client";

import { useEffect, useState, useMemo } from "react";
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
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  User,
  Clock,
  ChevronRight,
  Search,
  Filter,
  BotOff,
} from "lucide-react";

interface Conversation {
  id: string;
  instagram_user_id: string;
  instagram_username: string;
  last_message: string;
  last_message_at: Timestamp;
  stage: string;
  unread_count?: number;
  bot_paused?: boolean;
}

type FilterType = "all" | "unread" | "active" | "negotiation" | "bot_paused";


export default function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!user) return;

    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("tenant_id", "==", user.uid),
      orderBy("last_message_at", "desc"),
      limit(100),
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

  const filteredConversations = useMemo(() => {
    let result = conversations;

    switch (activeFilter) {
      case "unread":
        result = result.filter((c) => c.unread_count && c.unread_count > 0);
        break;
      case "active":
        result = result.filter((c) => c.stage === "active");
        break;
      case "negotiation":
        result = result.filter((c) => c.stage === "negotiation");
        break;
      case "bot_paused":
        result = result.filter((c) => c.bot_paused);
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.instagram_username?.toLowerCase().includes(q) ||
          c.last_message?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [conversations, activeFilter, searchQuery]);

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

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "negotiation": return "Negociación";
      case "active": return "Activo";
      case "closed": return "Cerrado";
      default: return stage;
    }
  };

  const counts = useMemo(() => ({
    all: conversations.length,
    unread: conversations.filter((c) => c.unread_count && c.unread_count > 0).length,
    active: conversations.filter((c) => c.stage === "active").length,
    negotiation: conversations.filter((c) => c.stage === "negotiation").length,
    bot_paused: conversations.filter((c) => c.bot_paused).length,
  }), [conversations]);

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1818] mb-2">Bandeja de Entrada</h1>
        <p className="text-[#6B6966]">Gestiona tus conversaciones de Instagram</p>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6966]" />
          <Input
            placeholder="Buscar por usuario o mensaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Todos", count: counts.all },
            { key: "unread", label: "No leídos", count: counts.unread },
            { key: "active", label: "Activos", count: counts.active },
            { key: "negotiation", label: "Negociación", count: counts.negotiation },
            { key: "bot_paused", label: "Bot pausado", count: counts.bot_paused },
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.key as FilterType)}
              className="gap-1.5"
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === filter.key ? "bg-white/20" : "bg-[#F5F4F2]"
                }`}>
                  {filter.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-[#F5F4F2] flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-[#6B6966]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1818] mb-2">Sin conversaciones</h3>
            <p className="text-[#6B6966] text-center max-w-sm">
              Las conversaciones de Instagram aparecerán aquí cuando configures tu webhook.
            </p>
          </CardContent>
        </Card>
      ) : filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-8 w-8 text-[#6B6966] mb-3" />
            <p className="text-[#6B6966]">No hay conversaciones que coincidan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((convo) => (
            <Link key={convo.id} href={`/dashboard/inbox/${convo.id}`}>
              <Card className="group cursor-pointer hover:-translate-y-0.5 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <User className="h-6 w-6 text-[#FF4D00]" />
                        </div>
                        {convo.bot_paused && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-amber-100 rounded-full flex items-center justify-center border-2 border-white">
                            <BotOff className="h-3 w-3 text-amber-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-[#1A1818] flex items-center gap-2">
                          @{convo.instagram_username}
                          {convo.unread_count && convo.unread_count > 0 && (
                            <span className="h-2 w-2 rounded-full bg-[#FF4D00] animate-pulse" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                          <Clock className="h-3 w-3" />
                          {convo.last_message_at?.toDate().toLocaleString("es-ES", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${getStageColor(convo.stage)}`}>
                          {getStageLabel(convo.stage)}
                        </span>
                        {convo.unread_count && convo.unread_count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4D00] text-white font-bold">
                            {convo.unread_count}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#6B6966] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#6B6966] line-clamp-2">{convo.last_message}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
