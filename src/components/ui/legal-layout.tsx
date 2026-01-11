"use client";

import Link from "next/link";
import { Flame, ArrowLeft, ExternalLink } from "lucide-react";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  currentPage: "privacy" | "terms" | "data-deletion" | "support";
}

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacidad", key: "privacy" },
  { href: "/terms-of-service", label: "Términos", key: "terms" },
  {
    href: "/data-deletion",
    label: "Eliminación de Datos",
    key: "data-deletion",
  },
  { href: "/support", label: "Soporte", key: "support" },
];

export function LegalLayout({
  children,
  title,
  currentPage,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
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
          className="flex items-center gap-2 text-sm font-medium text-[#6B6966] hover:text-[#1A1818] transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Volver al inicio</span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1818] mb-6 sm:mb-8">
          {title}
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 sm:space-y-8">
          {children}
        </div>
      </main>

      {/* Footer Legal Completo */}
      <footer className="py-8 sm:py-12 w-full border-t border-[#E8E6E3]/50 px-4 sm:px-6 bg-white/50 mt-12">
        <div className="container mx-auto max-w-5xl">
          {/* Links de navegación legal */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`text-sm transition-colors ${
                  currentPage === link.key
                    ? "text-[#FF4D00] font-medium"
                    : "text-[#6B6966] hover:text-[#1A1818]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Separador */}
          <div className="border-t border-[#E8E6E3]/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Brand */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-[#FF4D00]" />
                  <p className="text-sm text-[#6B6966]">
                    © {new Date().getFullYear()} FireSend. Todos los derechos
                    reservados.
                  </p>
                </div>
              </div>

              {/* FireforgeRD Attribution */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#9B9895]">Un producto de</span>
                <a
                  href="https://fireforgerd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-[#FF4D00] hover:text-[#E64500] transition-colors"
                >
                  FireforgeRD
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
