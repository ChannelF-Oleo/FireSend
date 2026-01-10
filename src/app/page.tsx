import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Bot,
  Zap,
  BarChart3,
  Flame,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6]">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-[#E8E6E3]/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5 font-bold text-xl text-[#1A1818]">
          <div className="h-9 w-9 bg-gradient-to-br from-[#FF4D00] to-[#FF7A3D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4D00]/20">
            <Flame size={18} fill="currentColor" />
          </div>
          FireSend
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[#6B6966] hover:text-[#1A1818] transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link href="/login">
            <Button>Comenzar Gratis</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#FF4D00]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#FF4D00]/5 rounded-full blur-3xl" />

          <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
            <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8E6E3] shadow-sm">
                <Sparkles size={14} className="text-[#FF4D00]" />
                <span className="text-sm font-medium text-[#6B6966]">
                  Potenciado por IA
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-[#1A1818]">
                Tu Instagram en{" "}
                <span className="bg-gradient-to-r from-[#FF4D00] to-[#FF7A3D] bg-clip-text text-transparent">
                  Piloto Automático
                </span>
              </h1>
              <p className="mx-auto max-w-[600px] text-[#6B6966] text-lg md:text-xl leading-relaxed">
                Responde a clientes, califica leads y cierra ventas 24/7 sin
                levantar un dedo. Conecta tu cuenta y deja que nuestra IA
                trabaje por ti.
              </p>
            </div>
            <div
              className="space-y-3 mt-10 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base gap-2 shadow-xl shadow-[#FF4D00]/25"
                >
                  Empezar Ahora <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-24 bg-white/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1818] mb-4">
                Todo lo que necesitas
              </h2>
              <p className="text-[#6B6966] text-lg max-w-xl mx-auto">
                Herramientas poderosas para automatizar tu negocio en Instagram
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {/* Feature 1 */}
              <div className="group flex flex-col p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(26,24,24,0.06)] hover:shadow-[0_12px_40px_rgba(26,24,24,0.1)] transition-all duration-300 hover:-translate-y-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bot size={28} className="text-[#FF4D00]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1818] mb-3">
                  Respuestas con IA
                </h3>
                <p className="text-[#6B6966] leading-relaxed">
                  Nuestro bot entiende el contexto, responde dudas sobre precios
                  y agenda citas usando lenguaje natural.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group flex flex-col p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(26,24,24,0.06)] hover:shadow-[0_12px_40px_rgba(26,24,24,0.1)] transition-all duration-300 hover:-translate-y-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={28} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1818] mb-3">
                  Instalación Instantánea
                </h3>
                <p className="text-[#6B6966] leading-relaxed">
                  Conéctate con tu cuenta de Instagram Business en 3 clics. Sin
                  configuraciones complejas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group flex flex-col p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(26,24,24,0.06)] hover:shadow-[0_12px_40px_rgba(26,24,24,0.1)] transition-all duration-300 hover:-translate-y-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 size={28} className="text-violet-500" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1818] mb-3">
                  CRM Integrado
                </h3>
                <p className="text-[#6B6966] leading-relaxed">
                  Cada conversación se guarda y organiza. Detectamos leads
                  calificados automáticamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="w-full py-24 border-t border-[#E8E6E3]/50">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1A1818] mb-12">
              Todo lo que necesitas para escalar
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
              {[
                "Gemini AI Integrado",
                "Soporte Multi-cuenta",
                "Logs en Tiempo Real",
                "Seguridad Avanzada",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-[#E8E6E3]/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="text-[#FF4D00] h-5 w-5 shrink-0" />
                  <span className="font-medium text-[#1A1818]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full py-24 bg-white/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1818] mb-4">
                Planes simples y transparentes
              </h2>
              <p className="text-[#6B6966] text-lg max-w-xl mx-auto">
                Empieza gratis y escala cuando lo necesites
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Plan Gratis */}
              <div className="flex flex-col p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#E8E6E3] shadow-sm">
                <h3 className="text-xl font-bold text-[#1A1818] mb-2">
                  Starter
                </h3>
                <p className="text-[#6B6966] mb-4">Para probar el servicio</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1A1818]">$0</span>
                  <span className="text-[#6B6966]">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[#6B6966]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    100 mensajes/mes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#6B6966]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />1
                    cuenta de Instagram
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#6B6966]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Dashboard básico
                  </li>
                </ul>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Comenzar Gratis
                  </Button>
                </Link>
              </div>

              {/* Plan Pro */}
              <div className="flex flex-col p-8 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#FF6B2B] text-white shadow-xl shadow-[#FF4D00]/20 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1A1818] text-white text-xs font-semibold rounded-full">
                  Popular
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-white/80 mb-4">
                  Para negocios en crecimiento
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-white/80">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4" />
                    5,000 mensajes/mes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4" />3 cuentas de Instagram
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4" />
                    Métricas avanzadas
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4" />
                    Soporte prioritario
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-white text-[#FF4D00] hover:bg-white/90">
                    Empezar Ahora
                  </Button>
                </Link>
              </div>

              {/* Plan Enterprise */}
              <div className="flex flex-col p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#E8E6E3] shadow-sm">
                <h3 className="text-xl font-bold text-[#1A1818] mb-2">
                  Enterprise
                </h3>
                <p className="text-[#6B6966] mb-4">Para grandes equipos</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1A1818]">$99</span>
                  <span className="text-[#6B6966]">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[#6B6966]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Mensajes ilimitados
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#6B6966]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Cuentas ilimitadas
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#6B6966]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    API personalizada
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#6B6966]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Soporte dedicado
                  </li>
                </ul>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Contactar Ventas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 bg-gradient-to-br from-[#1A1818] to-[#2D2A2A]">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para automatizar?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Únete a cientos de negocios que ya usan FireSend para escalar sus
              ventas.
            </p>
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-base gap-2">
                Comenzar Gratis <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 w-full border-t border-[#E8E6E3]/50 px-6 bg-white/50">
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
