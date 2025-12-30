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
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Estado del formulario
  const [formData, setFormData] = useState({
    openaiKey: "",
    instagramToken: "",
    instagramPageId: "",
    systemPrompt:
      "Eres un asistente amable de ventas. Tu objetivo es agendar citas.",
  });

  // 1. Cargar datos existentes al abrir la página
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "tenants", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data() as any);
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

  // 2. Guardar datos en Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Guardamos en la colección 'tenants', documento = ID del usuario
      await setDoc(doc(db, "tenants", user.uid), formData, { merge: true });
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8">Cargando configuración...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Configuración del Bot
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sección IA */}
        <Card>
          <CardHeader>
            <CardTitle>Inteligencia Artificial (OpenAI)</CardTitle>
            <CardDescription>Configura la conexión con GPT-4.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={formData.openaiKey}
                onChange={(e) =>
                  setFormData({ ...formData, openaiKey: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Nunca compartiremos tu llave.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Prompt del Sistema (Personalidad)</Label>
              {/* Si falla Textarea, usa <Input /> o instala textarea: npx shadcn@latest add textarea */}
              <Textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Instrucciones para el bot..."
                value={formData.systemPrompt}
                onChange={(e) =>
                  setFormData({ ...formData, systemPrompt: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección Instagram */}
        <Card>
          <CardHeader>
            <CardTitle>Conexión con Meta (Instagram)</CardTitle>
            <CardDescription>Credenciales de la Graph API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
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
