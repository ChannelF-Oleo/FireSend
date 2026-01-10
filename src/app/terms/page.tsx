"use client";

import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          Términos de Servicio
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
              1. Aceptación de los Términos
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Al acceder y utilizar FireSend ("el Servicio"), aceptas estar
              sujeto a estos Términos de Servicio. Si no estás de acuerdo con
              alguna parte de estos términos, no podrás acceder al Servicio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              2. Descripción del Servicio
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              FireSend es una plataforma que permite automatizar respuestas en
              Instagram Direct mediante inteligencia artificial. El servicio
              incluye:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>Integración con Instagram Business API</li>
              <li>Procesamiento de mensajes con IA (Google Gemini)</li>
              <li>Panel de gestión de conversaciones</li>
              <li>Análisis y métricas de rendimiento</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              3. Requisitos de Cuenta
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Para usar FireSend necesitas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>
                Ser mayor de 18 años o tener la edad legal en tu jurisdicción
              </li>
              <li>Tener una cuenta de Instagram Business válida</li>
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la seguridad de tu cuenta y contraseña</li>
            </ul>
          </section>

          <section className="space-y-4 bg-amber-50 p-6 rounded-xl border border-amber-200">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              4. ⚠️ Exención de Responsabilidad sobre la IA
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              <strong>IMPORTANTE:</strong> Las respuestas generadas por la
              inteligencia artificial son automáticas y pueden contener errores,
              inexactitudes o información inapropiada. FireSend:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>
                <strong>NO garantiza</strong> la precisión, completitud o
                idoneidad de las respuestas generadas por la IA.
              </li>
              <li>
                <strong>NO se hace responsable</strong> de decisiones tomadas
                basándose en respuestas de la IA.
              </li>
              <li>
                <strong>NO se hace responsable</strong> de pérdidas comerciales,
                daños a la reputación o cualquier otro perjuicio derivado del
                uso de respuestas automáticas.
              </li>
              <li>
                <strong>Recomienda encarecidamente</strong> supervisar las
                conversaciones y configurar adecuadamente el prompt del sistema.
              </li>
            </ul>
            <p className="text-[#6B6966] leading-relaxed mt-4">
              El usuario es el único responsable del contenido que se envía a
              través de su cuenta de Instagram, incluyendo las respuestas
              generadas automáticamente por la IA.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              5. Uso Aceptable
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Te comprometes a NO usar FireSend para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>Enviar spam, contenido no solicitado o mensajes masivos</li>
              <li>Acosar, amenazar o difamar a otras personas</li>
              <li>
                Distribuir contenido ilegal, ofensivo o que viole derechos de
                terceros
              </li>
              <li>Suplantar identidades o engañar a usuarios</li>
              <li>Violar las políticas de Instagram/Meta</li>
              <li>Cualquier actividad ilegal o fraudulenta</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              6. Propiedad Intelectual
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              FireSend y todo su contenido, características y funcionalidad son
              propiedad de FireSend y están protegidos por leyes de propiedad
              intelectual. No puedes copiar, modificar, distribuir o crear obras
              derivadas sin autorización expresa.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              7. Limitación de Responsabilidad
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              En la máxima medida permitida por la ley, FireSend no será
              responsable por:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>Daños indirectos, incidentales, especiales o consecuentes</li>
              <li>Pérdida de beneficios, datos o oportunidades de negocio</li>
              <li>Interrupciones del servicio o errores técnicos</li>
              <li>Acciones de terceros, incluyendo Meta/Instagram</li>
              <li>Contenido generado por la IA</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              8. Terminación
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Podemos suspender o terminar tu acceso al Servicio inmediatamente,
              sin previo aviso, si:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#6B6966]">
              <li>Violas estos Términos de Servicio</li>
              <li>Violas las políticas de Instagram/Meta</li>
              <li>
                Tu uso del servicio puede causar daño a otros usuarios o a
                FireSend
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              9. Cambios al Servicio
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Nos reservamos el derecho de modificar o discontinuar el Servicio
              (o cualquier parte del mismo) en cualquier momento, con o sin
              previo aviso. No seremos responsables ante ti ni ante terceros por
              cualquier modificación, suspensión o discontinuación del Servicio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              10. Ley Aplicable
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Estos términos se regirán e interpretarán de acuerdo con las leyes
              aplicables, sin tener en cuenta sus disposiciones sobre conflictos
              de leyes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#1A1818]">
              11. Contacto
            </h2>
            <p className="text-[#6B6966] leading-relaxed">
              Si tienes preguntas sobre estos Términos de Servicio, contáctanos
              en:
            </p>
            <p className="text-[#6B6966]">
              <strong>Email:</strong> legal@fireforgerd.com
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
            <Link href="/terms" className="text-sm text-[#FF4D00] font-medium">
              Términos
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-[#6B6966] hover:text-[#1A1818] transition-colors"
            >
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
