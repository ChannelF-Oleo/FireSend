"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, ArrowLeft, Loader2, CheckCircle2, Send } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbziMyrpWJqc5LtNLA-0Prq-2f7YFUPCKDDa44G6wXG-ZW6hhzzWrwh_s2jFKAlnaoMu9g/exec";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    whatsapp: "",
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const dataToSend = {
        ...formData,
        fecha: new Date().toLocaleString("es-DO", {
          timeZone: "America/Santo_Domingo",
        }),
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      setSuccess(true);
      setFormData({ nombre: "", email: "", whatsapp: "", mensaje: "" });
    } catch {
      setError("Hubo un error al enviar el mensaje. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="px-4 sm:px-6 h-16 flex items-center justify-between border-b border-[#E8E6E3]/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl text-[#1A1818]"
        >
          <div className="h-9 w-9 bg-gradient-to-br from-[#FF4D00] to-[#FF7A3D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4D00]/20">
            <Flame size={18} fill="currentColor" />
          </div>
          <span>FireSend</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-[#6B6966] hover:text-[#FF4D00] transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </header>

      <main className="flex-1 py-16 sm:py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1818] mb-4">
              Contacto
            </h1>
            <p className="text-[#6B6966] text-lg">
              ¿Tienes preguntas? Escríbenos y te responderemos pronto.
            </p>
          </div>

          {success ? (
            <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-emerald-200 text-center">
              <CheckCircle2
                size={48}
                className="text-emerald-500 mx-auto mb-4"
              />
              <h2 className="text-xl font-bold text-[#1A1818] mb-2">
                ¡Mensaje enviado!
              </h2>
              <p className="text-[#6B6966] mb-6">
                Gracias por contactarnos. Te responderemos en menos de 24 horas.
              </p>
              <Button onClick={() => setSuccess(false)} variant="outline">
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#E8E6E3] space-y-5"
            >
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+1 809 000 0000"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje</Label>
                <Textarea
                  id="mensaje"
                  placeholder="¿En qué podemos ayudarte?"
                  rows={4}
                  value={formData.mensaje}
                  onChange={(e) =>
                    setFormData({ ...formData, mensaje: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
