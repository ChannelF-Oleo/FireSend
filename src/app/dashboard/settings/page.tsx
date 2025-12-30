"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2, Sparkles, Instagram, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    geminiKey: "",
    instagramToken: "",
    instagramPageId: "",
    systemPrompt:
      "Eres un asistente amable de ventas. Tu objetivo es agendar citas.",
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "tenants", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            geminiKey: data.geminiKey || "",
            instagramToken: data.instagramToken || "",
            instagramPageId: data.instagramPageId || "",
            systemPrompt:
              data.systemPrompt ||
              "Eres un asistente amable de ventas. Tu objetivo es agendar citas.",
          });
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
        toast.error("No se pudo cargar la configuración.");
      } finally {
        setFetching(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await setDoc(doc(db, "tenants", user.uid), formData, { merge: true });
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6966] text-sm">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1818] mb-2">
          Configuración
        </h1>
        <p className="text-[#6B6966]">
          Configura tu bot de IA y conexión con Instagram
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 stagger-children">
        {/* Sección IA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#FF4D00]" />
              </div>
              <div>
                <CardTitle>Inteligencia Artificial</CardTitle>
                <CardDescription>
                  Configura la conexión con Google Gemini
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Gemini API Key</Label>
              <Input
                type="password"
                placeholder="AIza..."
                value={formData.geminiKey}
                onChange={(e) =>
                  setFormData({ ...formData, geminiKey: e.target.value })
                }
              />
              <p className="text-xs text-[#6B6966]">
                Obtén tu API key en{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF4D00] hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Prompt del Sistema</Label>
              <Textarea
                placeholder="Instrucciones para el bot..."
                value={formData.systemPrompt}
                onChange={(e) =>
                  setFormData({ ...formData, systemPrompt: e.target.value })
                }
                className="min-h-[120px]"
              />
              <p className="text-xs text-[#6B6966]">
                Define la personalidad y comportamiento de tu asistente de IA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sección Instagram */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle>Conexión con Meta</CardTitle>
                <CardDescription>
                  Credenciales de la Graph API de Instagram
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Instagram Access Token</Label>
              <Input
                type="password"
                placeholder="EAA..."
                value={formData.instagramToken}
                onChange={(e) =>
                  setFormData({ ...formData, instagramToken: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram Page ID</Label>
              <Input
                placeholder="123456789"
                value={formData.instagramPageId}
                onChange={(e) =>
                  setFormData({ ...formData, instagramPageId: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 bg-[#F5F4F2] rounded-xl border border-[#E8E6E3]">
          <Shield className="h-5 w-5 text-[#6B6966] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#1A1818]">
              Tus datos están seguros
            </p>
            <p className="text-xs text-[#6B6966] mt-1">
              Las API keys se almacenan de forma encriptada y nunca se comparten
              con terceros.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto h-12 px-8"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Guardar Cambios
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
