"use client";

import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-[#E8E6E3]/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl text-[#1A1818]"
        >
          <div className="h-9 w-9 bg-gradient-to-br from-[#FF4D00] to-[#FF7A3D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4D00]/20">
            <Flame size={18} fill="currentColor" />
          </div>
          FireSend
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-[#6B6966] hover:text-[#1A1818] transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-[#1A1818] mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-[#6B6966] text-lg">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              1. Información que Recopilamos
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              FireSend recopila la siguiente información para proporcionar
              nuestros servicios:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>
                <strong>Información de cuenta:</strong> Nombre, dirección de
                correo electrónico y datos de autenticación cuando te registras.
              </li>
              <li>
                <strong>Datos de Instagram:</strong> Información de tu cuenta de
                Instagram Business, incluyendo el ID de página y tokens de
                acceso necesarios para la integración.
              </li>
              <li>
                <strong>Mensajes:</strong> Los mensajes que recibes y envías a
                través de Instagram Direct para poder procesarlos con nuestra
                IA.
              </li>
              <li>
                <strong>Datos de uso:</strong> Información sobre cómo utilizas
                nuestra plataforma para mejorar el servicio.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              2. Cómo Usamos tu Información
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>
                <strong>Procesamiento con IA:</strong> Analizamos los mensajes
                entrantes usando Google Gemini para generar respuestas
                automáticas personalizadas según tus instrucciones.
              </li>
              <li>
                <strong>Gestión de conversaciones:</strong> Almacenamos el
                historial de mensajes para que puedas revisar y gestionar tus
                conversaciones.
              </li>
              <li>
                <strong>Mejora del servicio:</strong> Utilizamos datos agregados
                y anónimos para mejorar nuestros algoritmos y funcionalidades.
              </li>
              <li>
                <strong>Comunicaciones:</strong> Enviarte actualizaciones
                importantes sobre el servicio y tu cuenta.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              3. Compartición de Datos
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              No vendemos tu información personal. Compartimos datos únicamente
              con:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>
                <strong>Meta/Instagram:</strong> Para enviar y recibir mensajes
                a través de la API de Instagram.
              </li>
              <li>
                <strong>Google (Gemini AI):</strong> Para procesar mensajes y
                generar respuestas automáticas.
              </li>
              <li>
                <strong>Firebase/Google Cloud:</strong> Para almacenamiento
                seguro de datos.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              4. Seguridad de los Datos
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Implementamos medidas de seguridad estándar de la industria para
              proteger tu información, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>Encriptación de datos en tránsito y en reposo</li>
              <li>Autenticación segura mediante Firebase Auth</li>
              <li>Acceso restringido a datos sensibles</li>
              <li>Tokens de acceso con expiración automática</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              5. Tus Derechos - Solicitud de Borrado de Datos
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Tienes derecho a solicitar el borrado de tus datos personales.
              Para hacerlo:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-[#6B6966]">
              <li>
                Envía un correo electrónico a{" "}
                <strong>privacy@firesend.app</strong> con el asunto "Solicitud
                de Borrado de Datos".
              </li>
              <li>
                Incluye el correo electrónico asociado a tu cuenta de FireSend.
              </li>
              <li>Procesaremos tu solicitud en un plazo máximo de 30 días.</li>
              <li>
                Recibirás confirmación una vez que tus datos hayan sido
                eliminados.
              </li>
            </ol>
            <p className="text-[#6B6966] leading-relaxed mt-4">
              También puedes eliminar tu cuenta directamente desde la
              configuración de tu dashboard, lo cual eliminará todos tus datos
              asociados.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              6. Retención de Datos
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Conservamos tus datos mientras tu cuenta esté activa. Si eliminas
              tu cuenta o solicitas el borrado de datos, eliminaremos tu
              información personal en un plazo de 30 días, excepto cuando la ley
              requiera su conservación.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              7. Cambios a esta Política
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Podemos actualizar esta política ocasionalmente. Te notificaremos
              sobre cambios significativos por correo electrónico o mediante un
              aviso en nuestra plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              8. Contacto
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Si tienes preguntas sobre esta política de privacidad, contáctanos
              en:
            </p>
            <p className="text-[#6B6966]">
              <strong>Email:</strong> privacy@fireforgerd.com
            </p>
          </section>
        </div>
      </main>

      <footer className="py-8 w-full border-t border-[#E8E6E3]/50 px-6 bg-white/50 mt-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#6B6966]">
            <Flame size={16} className="text-[#FF4D00]" />
            <p className="text-sm">
              © 2025 FireSend. Todos los derechos reservados.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link
              href="/terms"
              className="text-sm text-[#6B6966] hover:text-[#1A1818] transition-colors"
            >
              Términos
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-[#FF4D00] font-medium"
            >
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
