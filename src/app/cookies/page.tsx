"use client";

import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="px-4 sm:px-6 h-16 flex items-center justify-between border-b border-[#E8E6E3]/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#1A1818]">
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

      <main className="flex-1 py-12 sm:py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1818] mb-8">
            Política de Cookies
          </h1>
          
          <p className="text-sm text-[#6B6966] mb-8">
            Última actualización: 10 de enero de 2026
          </p>

          <div className="prose prose-gray max-w-none space-y-8">
      <section>
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
          cuando visitas un sitio web. Estas nos ayudan a recordar tus preferencias, 
          entender cómo usas nuestro servicio y mejorar tu experiencia.
        </p>
      </section>

      <section>
        <h2>2. Tipos de cookies que utilizamos</h2>
        
        <h3>Cookies esenciales</h3>
        <p>
          Son necesarias para el funcionamiento básico del sitio. Incluyen cookies 
          de autenticación que te mantienen conectado a tu cuenta.
        </p>

        <h3>Cookies de rendimiento</h3>
        <p>
          Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio, 
          recopilando información de forma anónima para mejorar nuestros servicios.
        </p>

        <h3>Cookies funcionales</h3>
        <p>
          Permiten recordar tus preferencias (como idioma o región) para proporcionarte 
          una experiencia más personalizada.
        </p>
      </section>

      <section>
        <h2>3. Cookies de terceros</h2>
        <p>
          Utilizamos servicios de terceros que pueden establecer sus propias cookies:
        </p>
        <ul>
          <li><strong>Firebase/Google:</strong> Para autenticación y análisis</li>
          <li><strong>Vercel:</strong> Para análisis de rendimiento</li>
        </ul>
      </section>

      <section>
        <h2>4. Control de cookies</h2>
        <p>
          Puedes controlar y/o eliminar las cookies según desees. Puedes eliminar 
          todas las cookies que ya están en tu dispositivo y configurar la mayoría 
          de los navegadores para que no las acepten.
        </p>
        <p>
          Sin embargo, si bloqueas las cookies, es posible que algunas funciones 
          de FireSend no funcionen correctamente.
        </p>
      </section>

      <section>
        <h2>5. Cómo gestionar cookies en tu navegador</h2>
        <ul>
          <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
          <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
          <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
          <li><strong>Edge:</strong> Configuración → Privacidad → Cookies</li>
        </ul>
      </section>

      <section>
        <h2>6. Actualizaciones</h2>
        <p>
          Podemos actualizar esta política de cookies ocasionalmente. Te notificaremos 
          sobre cambios significativos publicando la nueva política en esta página.
        </p>
      </section>

      <section>
        <h2>7. Contacto</h2>
        <p>
          Si tienes preguntas sobre nuestra política de cookies, contáctanos en{" "}
          <a href="mailto:Info@fireforgerd.com" className="text-[#FF4D00] hover:underline">
            Info@fireforgerd.com
          </a>
        </p>
      </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
