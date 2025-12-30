// src/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // DEFINICIÓN DE RUTAS:
      // Rutas donde puede entrar cualquiera (invitados)
      const isPublicPath =
        pathname === "/login" || pathname === "/register" || pathname === "/";

      // LÓGICA DE REDIRECCIÓN:

      // 1. Protección: Si NO hay usuario y trata de entrar a zona privada -> Login
      if (!currentUser && !isPublicPath) {
        router.push("/login");
      }

      // 2. Redirección Inteligente: Si YA hay usuario y entra a Login o Landing -> Dashboard
      // (Así no tienen que volver a loguearse si ya tienen sesión activa)
      else if (currentUser && (pathname === "/login" || pathname === "/")) {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
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
