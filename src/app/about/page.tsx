"use client";

import Link from "next/link";
import { Flame, ArrowLeft, Users, Target, Zap } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function AboutPage() {
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
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1818] mb-4">
              Sobre Nosotros
            </h1>
            <p className="text-[#6B6966] text-lg max-w-2xl mx-auto">
              Somos un equipo apasionado por la automatización y la inteligencia
              artificial, dedicados a ayudar a negocios a escalar sus ventas en
              Instagram.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#E8E6E3] text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center mb-4 mx-auto">
                <Target size={24} className="text-[#FF4D00]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1818] mb-2">
                Nuestra Misión
              </h3>
              <p className="text-[#6B6966] text-sm">
                Democratizar el acceso a herramientas de automatización con IA
                para negocios de todos los tamaños.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#E8E6E3] text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center mb-4 mx-auto">
                <Zap size={24} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1818] mb-2">
                Nuestra Visión
              </h3>
              <p className="text-[#6B6966] text-sm">
                Ser la plataforma líder de automatización de Instagram en
                Latinoamérica y el Caribe.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#E8E6E3] text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center mb-4 mx-auto">
                <Users size={24} className="text-violet-500" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1818] mb-2">
                Nuestro Equipo
              </h3>
              <p className="text-[#6B6966] text-sm">
                Un equipo diverso de desarrolladores, diseñadores y expertos en
                marketing digital.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#FF6B2B] text-white text-center">
            <h2 className="text-2xl font-bold mb-4">FireforgeRD</h2>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              FireSend es un producto de FireforgeRD, una empresa de tecnología
              con sede en República Dominicana enfocada en crear soluciones
              innovadoras para negocios digitales.
            </p>
            <a
              href="https://fireforgerd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#FF4D00] rounded-xl font-medium hover:bg-white/90 transition-colors"
            >
              Visitar FireforgeRD
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
