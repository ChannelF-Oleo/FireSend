"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Sparkles,
  Instagram,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

// Configuración de Facebook SDK
const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || "";
const FB_PERMISSIONS = [
  "instagram_basic",
  "pages_show_list",
  "pages_messaging",
  "instagram_manage_messages",
].join(",");

// URLs de Cloud Functions
const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || "";

interface PageOption {
  pageId: string;
  pageName: string;
  instagramAccountId: string;
  pageAccessToken: string;
}

interface TenantData {
  geminiKey?: string;
  systemPrompt?: string;
  oauthConnected?: boolean;
  connectedPageName?: string;
  instagramPageId?: string;
  tokenExpiresAt?: { toDate: () => Date } | Date;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [connectingFb, setConnectingFb] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");

  const [formData, setFormData] = useState({
    geminiKey: "",
    systemPrompt:
      "Eres un asistente amable de ventas. Tu objetivo es agendar citas.",
  });

  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    pageName?: string;
    expiresAt?: Date;
  }>({ connected: false });

  // Cargar configuración inicial
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "tenants", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as TenantData;
        setFormData({
          geminiKey: data.geminiKey || "",
          systemPrompt:
            data.systemPrompt ||
            "Eres un asistente amable de ventas. Tu objetivo es agendar citas.",
        });
        setConnectionStatus({
          connected: data.oauthConnected || false,
          pageName: data.connectedPageName,
          expiresAt: data.tokenExpiresAt
            ? typeof data.tokenExpiresAt === "object" &&
              "toDate" in data.tokenExpiresAt
              ? data.tokenExpiresAt.toDate()
              : new Date(data.tokenExpiresAt as unknown as string)
            : undefined,
        });
      }
      setFetching(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Inicializar Facebook SDK
  useEffect(() => {
    if (typeof window !== "undefined" && FB_APP_ID) {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        window.FB?.init({
          appId: FB_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v21.0",
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleFacebookLogin = useCallback(() => {
    if (!window.FB || !user) {
      toast.error("Facebook SDK no cargado");
      return;
    }

    setConnectingFb(true);

    window.FB.login(
      async (response: { authResponse?: { accessToken: string } }) => {
        if (response.authResponse) {
          const shortLivedToken = response.authResponse.accessToken;

          try {
            // Intercambiar por Long-Lived Token
            const authResponse = await fetch(
              `${FUNCTIONS_BASE_URL}/authInstagram`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shortLivedToken, userId: user.uid }),
              },
            );

            if (!authResponse.ok) {
              const error = await authResponse.json();
              throw new Error(error.details || "Error al conectar");
            }

            toast.success("¡Conectado con Facebook!");

            // Cargar páginas disponibles
            await loadPages();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Error al conectar",
            );
          }
        } else {
          toast.error("Conexión cancelada");
        }
        setConnectingFb(false);
      },
      { scope: FB_PERMISSIONS },
    );
  }, [user]);

  const loadPages = async () => {
    if (!user) return;
    setLoadingPages(true);

    try {
      const response = await fetch(`${FUNCTIONS_BASE_URL}/getPages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Error al cargar páginas");
      }

      const data = await response.json();
      setPages(data.pages || []);

      if (data.pages?.length === 0) {
        toast.info("No se encontraron páginas con Instagram Business");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar páginas",
      );
    } finally {
      setLoadingPages(false);
    }
  };

  const handleConnectPage = async () => {
    if (!user || !selectedPage) return;

    const page = pages.find((p) => p.instagramAccountId === selectedPage);
    if (!page) return;

    setLoading(true);
    try {
      const response = await fetch(`${FUNCTIONS_BASE_URL}/connectPage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          pageId: page.pageId,
          instagramAccountId: page.instagramAccountId,
          pageAccessToken: page.pageAccessToken,
          pageName: page.pageName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Error al conectar página");
      }

      toast.success(`¡${page.pageName} conectada!`);
      setPages([]);
      setSelectedPage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al conectar");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${FUNCTIONS_BASE_URL}/disconnectInstagram`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid }),
        },
      );

      if (!response.ok) throw new Error("Error al desconectar");
      toast.success("Instagram desconectado");
    } catch (error) {
      toast.error("Error al desconectar");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await setDoc(doc(db, "tenants", user.uid), formData, { merge: true });
      toast.success("Configuración guardada");
    } catch (error) {
      toast.error("Error al guardar");
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sección Instagram OAuth */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle>Conexión con Instagram</CardTitle>
                <CardDescription>
                  Conecta tu cuenta de Instagram Business
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionStatus.connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Conectado</p>
                    <p className="text-sm text-green-600">
                      {connectionStatus.pageName || "Página conectada"}
                      {connectionStatus.expiresAt && (
                        <span className="ml-2">
                          · Expira:{" "}
                          {connectionStatus.expiresAt.toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={loading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Desconectar Instagram
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pages.length === 0 ? (
                  <Button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={connectingFb || !FB_APP_ID}
                    className="bg-[#1877F2] hover:bg-[#166FE5]"
                  >
                    {connectingFb ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Instagram className="mr-2 h-4 w-4" />
                    )}
                    Conectar Instagram
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Label>Selecciona tu página</Label>
                    <select
                      value={selectedPage}
                      onChange={(e) => setSelectedPage(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">-- Selecciona una página --</option>
                      {pages.map((page) => (
                        <option
                          key={page.instagramAccountId}
                          value={page.instagramAccountId}
                        >
                          {page.pageName}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleConnectPage}
                        disabled={!selectedPage || loading}
                      >
                        Conectar página seleccionada
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadPages}
                        disabled={loadingPages}
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${loadingPages ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>
                  </div>
                )}
                {!FB_APP_ID && (
                  <p className="text-sm text-amber-600">
                    ⚠️ Configura NEXT_PUBLIC_FB_APP_ID en .env.local
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

// Tipos para Facebook SDK
declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken: string };
        }) => void,
        options: { scope: string },
      ) => void;
    };
  }
}
