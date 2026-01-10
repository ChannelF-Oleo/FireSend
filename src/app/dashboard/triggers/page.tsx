"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Zap,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  PauseCircle,
  MessageSquare,
  Tag,
  Bell,
} from "lucide-react";

interface Trigger {
  id: string;
  name: string;
  keywords: string[];
  action: "pause_bot" | "send_message" | "change_stage" | "notify";
  message?: string;
  stage?: string;
  enabled: boolean;
  createdAt?: Date;
}

const ACTION_OPTIONS = [
  {
    value: "pause_bot",
    label: "Pausar Bot",
    description: "Pausa el bot y envía un mensaje",
    icon: PauseCircle,
  },
  {
    value: "send_message",
    label: "Enviar Mensaje",
    description: "Envía un mensaje predefinido",
    icon: MessageSquare,
  },
  {
    value: "change_stage",
    label: "Cambiar Etapa",
    description: "Cambia la etapa del lead",
    icon: Tag,
  },
  {
    value: "notify",
    label: "Solo Notificar",
    description: "Notifica sin interrumpir",
    icon: Bell,
  },
];

const STAGE_OPTIONS = [
  { value: "new", label: "Nuevo" },
  { value: "interested", label: "Interesado" },
  { value: "negotiation", label: "En Negociación" },
  { value: "converted", label: "Convertido" },
  { value: "support", label: "Soporte" },
];

export default function TriggersPage() {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    keywords: "",
    action: "send_message" as Trigger["action"],
    message: "",
    stage: "support",
    enabled: true,
  });

  useEffect(() => {
    if (!user) return;

    const triggersRef = collection(db, "tenants", user.uid, "triggers");
    const q = query(triggersRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Trigger[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        } as Trigger);
      });
      setTriggers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: "",
      keywords: "",
      action: "send_message",
      message: "",
      stage: "support",
      enabled: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (trigger: Trigger) => {
    setFormData({
      name: trigger.name,
      keywords: trigger.keywords.join(", "),
      action: trigger.action,
      message: trigger.message || "",
      stage: trigger.stage || "support",
      enabled: trigger.enabled,
    });
    setEditingId(trigger.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.name.trim() || !formData.keywords.trim()) {
      toast.error("Nombre y palabras clave son requeridos");
      return;
    }

    setSaving(true);

    try {
      const keywords = formData.keywords
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0);

      const triggerData = {
        name: formData.name.trim(),
        keywords,
        action: formData.action,
        message: formData.message.trim() || null,
        stage: formData.action === "change_stage" ? formData.stage : null,
        enabled: formData.enabled,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "tenants", user.uid, "triggers", editingId),
          triggerData,
        );
        toast.success("Trigger actualizado");
      } else {
        await addDoc(collection(db, "tenants", user.uid, "triggers"), {
          ...triggerData,
          createdAt: serverTimestamp(),
        });
        toast.success("Trigger creado");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving trigger:", error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (triggerId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "tenants", user.uid, "triggers", triggerId));
      toast.success("Trigger eliminado");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleToggle = async (triggerId: string, enabled: boolean) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "tenants", user.uid, "triggers", triggerId), {
        enabled,
      });
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const getActionIcon = (action: string) => {
    const option = ACTION_OPTIONS.find((o) => o.value === action);
    return option ? option.icon : Zap;
  };

  const getActionLabel = (action: string) => {
    const option = ACTION_OPTIONS.find((o) => o.value === action);
    return option ? option.label : action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6966] text-sm">Cargando triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1818] mb-2">
            Automatizaciones
          </h1>
          <p className="text-[#6B6966]">
            Configura acciones automáticas basadas en palabras clave
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo Trigger
          </Button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingId ? "Editar Trigger" : "Nuevo Trigger"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Ej: Soporte Urgente"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Palabras Clave (separadas por coma)</Label>
                <Input
                  placeholder="soporte, ayuda, problema, urgente"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Acción</Label>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {ACTION_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        action: option.value as Trigger["action"],
                      })
                    }
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.action === option.value
                        ? "border-[#FF4D00] bg-[#FF4D00]/5"
                        : "border-[#E8E6E3] hover:border-[#FF4D00]/50"
                    }`}
                  >
                    <option.icon
                      className={`h-5 w-5 mb-2 ${
                        formData.action === option.value
                          ? "text-[#FF4D00]"
                          : "text-[#6B6966]"
                      }`}
                    />
                    <p className="text-sm font-medium text-[#1A1818]">
                      {option.label}
                    </p>
                    <p className="text-xs text-[#6B6966]">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {(formData.action === "pause_bot" ||
              formData.action === "send_message") && (
              <div className="space-y-2">
                <Label>Mensaje a Enviar</Label>
                <Textarea
                  placeholder="Ej: Un agente te atenderá en breve..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
            )}

            {formData.action === "change_stage" && (
              <div className="space-y-2">
                <Label>Nueva Etapa</Label>
                <select
                  value={formData.stage}
                  onChange={(e) =>
                    setFormData({ ...formData, stage: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                >
                  {STAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enabled: checked })
                  }
                />
                <Label>Activado</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>¿Cómo funcionan los triggers?</strong> Cuando un cliente envía
          un mensaje que contiene alguna de las palabras clave, se ejecuta la
          acción configurada ANTES de que la IA responda.
        </p>
      </div>

      {/* Lista de Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Triggers Configurados ({triggers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {triggers.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-[#E8E6E3] mx-auto mb-3" />
              <p className="text-[#6B6966]">No hay triggers configurados</p>
              <p className="text-sm text-[#6B6966] mt-1">
                Crea tu primer trigger para automatizar respuestas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {triggers.map((trigger) => {
                const ActionIcon = getActionIcon(trigger.action);
                return (
                  <div
                    key={trigger.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      trigger.enabled
                        ? "bg-white border-[#E8E6E3]"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          trigger.enabled ? "bg-[#FF4D00]/10" : "bg-gray-100"
                        }`}
                      >
                        <ActionIcon
                          className={`h-5 w-5 ${
                            trigger.enabled ? "text-[#FF4D00]" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1818]">
                          {trigger.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#6B6966]">
                            {getActionLabel(trigger.action)}
                          </span>
                          <span className="text-xs text-[#6B6966]">•</span>
                          <span className="text-xs text-[#6B6966]">
                            {trigger.keywords.slice(0, 3).join(", ")}
                            {trigger.keywords.length > 3 &&
                              ` +${trigger.keywords.length - 3}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={trigger.enabled}
                        onCheckedChange={(checked) =>
                          handleToggle(trigger.id, checked)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(trigger)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(trigger.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
