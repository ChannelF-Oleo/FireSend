// src/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { useRouter, usePathname } from "next/navigation";

const log = logger.module("Auth");

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    log.debug("Inicializando listener de autenticación");

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        log.success("Usuario autenticado", {
          uid: currentUser.uid,
          email: currentUser.email,
        });
      } else {
        log.info("Sin sesión activa");
      }

      // DEFINICIÓN DE RUTAS:
      // Rutas donde puede entrar cualquiera (invitados)
      const isPublicPath =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/" ||
        pathname === "/privacy" ||
        pathname === "/terms";

      // LÓGICA DE REDIRECCIÓN:

      // 1. Protección: Si NO hay usuario y trata de entrar a zona privada -> Login
      if (!currentUser && !isPublicPath) {
        log.warn("Acceso denegado - redirigiendo a login", { pathname });
        router.push("/login");
      }

      // 2. Redirección Inteligente: Si YA hay usuario y entra a Login o Landing -> Dashboard
      // (Así no tienen que volver a loguearse si ya tienen sesión activa)
      else if (currentUser && (pathname === "/login" || pathname === "/")) {
        log.info("Usuario ya autenticado - redirigiendo a dashboard");
        router.push("/dashboard");
      }
    });

    return () => {
      log.debug("Limpiando listener de autenticación");
      unsubscribe();
    };
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading ? (
        children
      ) : (
        <div className="h-screen w-full flex items-center justify-center bg-[#F9F8F6]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B6966] font-medium">
              Cargando FireSend...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
