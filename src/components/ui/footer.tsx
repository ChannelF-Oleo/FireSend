"use client";

import Link from "next/link";
import { Flame, Instagram, Mail, Heart, MessageCircle } from "lucide-react";

const FOOTER_LINKS = {
  producto: [
    { label: "Características", href: "/#features" },
    { label: "Precios", href: "/#pricing" },
    { label: "Integraciones", href: "/#integrations" },
  ],
  empresa: [
    { label: "Sobre Nosotros", href: "/about" },
    { label: "Contacto", href: "/contact" },
  ],
  legal: [
    { label: "Términos de Servicio", href: "/terms" },
    { label: "Política de Privacidad", href: "/privacy" },
    { label: "Política de Cookies", href: "/cookies" },
  ],
};

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/fireforgerd?igsh=MWFkcXV5bWF3MWx6Yg%3D%3D&utm_source=qr",
    label: "Instagram",
  },
  { icon: Mail, href: "mailto:Info@fireforgerd.com", label: "Email" },
  {
    icon: MessageCircle,
    href: "https://wa.me/18498534067",
    label: "WhatsApp",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-white/50 to-[#F5F4F2] border-t border-[#E8E6E3]/50">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-[#FF4D00] to-[#FF7A3D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4D00]/20">
                <Flame size={20} fill="currentColor" />
              </div>
              <span className="font-bold text-xl text-[#1A1818]">FireSend</span>
            </Link>
            <p className="text-[#6B6966] text-sm leading-relaxed max-w-xs mb-6">
              Automatiza tu Instagram con IA. Responde mensajes, califica leads
              y cierra ventas 24/7.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="h-10 w-10 rounded-xl bg-white/80 border border-[#E8E6E3] flex items-center justify-center text-[#6B6966] hover:text-[#FF4D00] hover:border-[#FF4D00]/30 hover:bg-[#FF4D00]/5 transition-all duration-200"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-[#1A1818] mb-4 text-sm uppercase tracking-wider">
              Producto
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.producto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6966] hover:text-[#FF4D00] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1A1818] mb-4 text-sm uppercase tracking-wider">
              Empresa
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6966] hover:text-[#FF4D00] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1A1818] mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6966] hover:text-[#FF4D00] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#E8E6E3]/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6B6966] flex items-center gap-1.5 flex-wrap justify-center md:justify-start">
              © {currentYear} FireSend. Hecho con{" "}
              <Heart size={14} className="text-[#FF4D00] fill-[#FF4D00]" /> en
              República Dominicana por{" "}
              <a
                href="https://fireforgerd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4D00] hover:underline font-medium"
              >
                FireforgeRD
              </a>
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[#9B9895] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Todos los sistemas operativos
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
