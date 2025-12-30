import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Bot, Zap, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Simple */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <Zap className="text-blue-600 fill-current" />
          FireSend
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
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
        <section className="w-full py-24 md:py-32 lg:py-40 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-slate-900">
                Tu Instagram en Piloto Automático con{" "}
                <span className="text-blue-600">Inteligencia Artificial</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400">
                Responde a clientes, califica leads y cierra ventas 24/7 sin
                levantar un dedo. Conecta tu cuenta y deja que nuestra IA
                trabaje por ti.
              </p>
            </div>
            <div className="space-y-2 mt-8">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-lg gap-2">
                  Empezar Ahora <ArrowRight size={18} />
                </Button>
              </Link>
              <p className="text-xs text-slate-400 pt-2">
                No requiere tarjeta de crédito
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-slate-50/50">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Bot size={32} />
                </div>
                <h3 className="text-xl font-bold">Respuestas con IA</h3>
                <p className="text-slate-500">
                  Nuestro bot entiende el contexto, responde dudas sobre precios
                  y agenda citas usando lenguaje natural.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-slate-50/50">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold">Instalación Instantánea</h3>
                <p className="text-slate-500">
                  Conéctate con tu cuenta de Instagram Business en 3 clics. Sin
                  configuraciones complejas de servidores.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-slate-50/50">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <BarChart3 size={32} />
                </div>
                <h3 className="text-xl font-bold">CRM Integrado</h3>
                <p className="text-slate-500">
                  Cada conversación se guarda y organiza. Detectamos leads
                  calificados y los enviamos a tu base de datos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Check list */}
        <section className="w-full py-20 bg-slate-50 border-t">
          <div className="container px-4 md:px-6 mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mb-10">
              Todo lo que necesitas para escalar
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
              {[
                "GPT-4 Turbo Integrado",
                "Soporte Multi-cuenta",
                "Logs en Tiempo Real",
                "Seguridad Bancaria",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="text-green-500 h-5 w-5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 border-t px-6 flex items-center justify-between text-sm text-slate-500">
        <p>© 2024 FireSend Inc. Todos los derechos reservados.</p>
        <nav className="flex gap-4">
          <Link href="#" className="hover:underline">
            Términos
          </Link>
          <Link href="#" className="hover:underline">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
