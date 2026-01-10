"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  Bot,
  PauseCircle,
  PlayCircle,
  MoreVertical,
  Clock,
  CheckCheck,
  Tag,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  type: "user" | "assistant";
  timestamp: Timestamp;
  status?: string;
  message_type?: string;
}

interface Conversation {
  id: string;
  instagram_user_id: string;
  instagram_username: string;
  last_message: string;
  stage: string;
  bot_paused?: boolean;
  tenant_id: string;
}

const STAGES = [
  {
    value: "active",
    label: "Activo",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "negotiation",
    label: "Negociación",
    color: "bg-violet-100 text-violet-700",
  },
  {
    value: "qualified",
    label: "Calificado",
    color: "bg-blue-100 text-blue-700",
  },
  { value: "closed", label: "Cerrado", color: "bg-gray-100 text-gray-700" },
];

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [botPaused, setBotPaused] = useState(false);
  const [currentStage, setCurrentStage] = useState("active");
  const [showStageMenu, setShowStageMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar conversación y mensajes
  useEffect(() => {
    if (!user || !conversationId) return;

    // Listener para la conversación
    const convRef = doc(db, "conversations", conversationId);
    const unsubConv = onSnapshot(convRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tenant_id !== user.uid) {
          toast.error("No tienes acceso a esta conversación");
          router.push("/dashboard/inbox");
          return;
        }
        setConversation({ id: docSnap.id, ...data } as Conversation);
        setBotPaused(data.bot_paused || false);
        setCurrentStage(data.stage || "active");
      } else {
        toast.error("Conversación no encontrada");
        router.push("/dashboard/inbox");
      }
      setLoading(false);
    });

    // Listener para mensajes
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages",
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => {
      unsubConv();
      unsubMessages();
    };
  }, [user, conversationId, router]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Marcar como leído
  useEffect(() => {
    if (!user || !conversationId || !conversation) return;
    if (conversation.tenant_id === user.uid) {
      updateDoc(doc(db, "conversations", conversationId), {
        unread_count: 0,
      }).catch(console.error);
    }
  }, [user, conversationId, conversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversation) return;

    setSending(true);
    try {
      // Obtener token del tenant
      const tenantDoc = await getDoc(doc(db, "tenants", user.uid));
      const tenantData = tenantDoc.data();

      if (!tenantData?.instagramToken) {
        toast.error("Configura tu conexión con Instagram primero");
        setSending(false);
        return;
      }

      // Enviar mensaje via Cloud Function
      const response = await fetch(`/api/sendManualMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          conversationId,
          recipientId: conversation.instagram_user_id,
          message: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Error al enviar mensaje");
      }

      setNewMessage("");
      toast.success("Mensaje enviado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  const toggleBotPause = async () => {
    if (!conversationId) return;
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        bot_paused: !botPaused,
      });
      setBotPaused(!botPaused);
      toast.success(
        botPaused ? "Bot activado" : "Bot pausado para esta conversación",
      );
    } catch (error) {
      toast.error("Error al cambiar estado del bot");
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (!conversationId || !user) return;
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        stage: newStage,
      });
      setCurrentStage(newStage);
      setShowStageMenu(false);
      toast.success(
        `Etapa cambiada a ${STAGES.find((s) => s.value === newStage)?.label}`,
      );
    } catch (error) {
      toast.error("Error al cambiar etapa");
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF4D00]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/inbox")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF4D00]/20 to-[#FF4D00]/10 flex items-center justify-center">
            <User className="h-5 w-5 text-[#FF4D00]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#1A1818]">
              @{conversation?.instagram_username}
            </h2>
            <p className="text-xs text-[#6B6966]">
              {botPaused ? "Bot pausado" : "Bot activo"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Stage Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStageMenu(!showStageMenu)}
              className={`gap-1.5 ${STAGES.find((s) => s.value === currentStage)?.color}`}
            >
              <Tag className="h-3.5 w-3.5" />
              {STAGES.find((s) => s.value === currentStage)?.label}
            </Button>
            {showStageMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border p-1 z-50 min-w-[140px]">
                {STAGES.map((stage) => (
                  <button
                    key={stage.value}
                    onClick={() => handleStageChange(stage.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                      currentStage === stage.value ? "font-medium" : ""
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${stage.color.split(" ")[0]}`}
                    />
                    {stage.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleBotPause}
            className={botPaused ? "text-emerald-600" : "text-amber-600"}
          >
            {botPaused ? (
              <>
                <PlayCircle className="h-4 w-4 mr-1" /> Activar Bot
              </>
            ) : (
              <>
                <PauseCircle className="h-4 w-4 mr-1" /> Pausar Bot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F8F6]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6B6966]">
            <p>No hay mensajes aún</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "assistant" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.type === "assistant"
                    ? "bg-[#FF4D00] text-white rounded-br-md"
                    : "bg-white border border-[#E8E6E3] text-[#1A1818] rounded-bl-md"
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.type === "user" && (
                    <User className="h-4 w-4 mt-0.5 text-[#6B6966] shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        msg.type === "assistant"
                          ? "text-white/70"
                          : "text-[#6B6966]"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {formatTime(msg.timestamp)}
                      {msg.type === "assistant" && msg.status === "sent" && (
                        <CheckCheck className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </div>
                  {msg.type === "assistant" && (
                    <Bot className="h-4 w-4 mt-0.5 text-white/80 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {botPaused && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ El bot está pausado. Solo tú puedes responder.
          </p>
        )}
      </form>
    </div>
  );
}
