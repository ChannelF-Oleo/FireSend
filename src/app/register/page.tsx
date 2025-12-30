"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Crear documento de tenant para el nuevo usuario
      await setDoc(doc(db, "tenants", userCredential.user.uid), {
        email: email,
        createdAt: new Date(),
        systemPrompt:
          "Eres un asistente amable de ventas. Tu objetivo es agendar citas y responder preguntas sobre productos.",
        geminiKey: "",
        instagramToken: "",
        instagramPageId: "",
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("email-already-in-use")) {
          setError("Este email ya está registrado");
        } else if (err.message.includes("invalid-email")) {
          setError("Email inválido");
        } else {
          setError(err.message);
        }
      } else {
        setError("Error al crear la cuenta");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#FF4D00]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#FF4D00]/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-br from-[#FF4D00] to-[#FF7A3D] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#FF4D00]/25">
              <Flame size={28} fill="currentColor" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1A1818]">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-[#6B6966]">
            Comienza a automatizar tu Instagram
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-5 pt-4">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 animate-fade-in">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
            <p className="text-sm text-[#6B6966] text-center">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-[#FF4D00] font-medium hover:underline"
              >
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
