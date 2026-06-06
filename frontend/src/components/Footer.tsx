import React from "react";
import { PawPrint, Heart, Mail, Landmark, Globe, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1B4332] text-white pt-16 pb-12 overflow-hidden border-t-4 border-[#E9C46A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top footer columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand block (col span 5) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <div className="bg-white text-[#1B4332] p-2 rounded-xl">
                <PawPrint className="h-5 w-5 fill-[#F4845F] text-[#F4845F]" />
              </div>
              <span className="text-xl font-bold font-serif tracking-tight">
                Paw<span className="text-[#F4845F]">Manager</span>
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-sm font-sans leading-relaxed">
              La plataforma de administración definitiva diseñada exclusivamente para centros de adopción, refugios y heroicos rescatistas independientes de habla hispana.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-[#E9C46A] font-mono">
              <Globe className="h-4 w-4 shrink-0" />
              <span>Disponible en México y toda Latinoamérica</span>
            </div>
          </div>

          {/* Nav category 1 (col span 2) */}
          <div className="md:col-span-2 text-left space-y-3">
            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#E9C46A]">Plataforma</h5>
            <ul className="space-y-2 text-sm text-gray-300 font-sans">
              <li><a href="#problemas" className="hover:text-white transition-colors">Problemas Comunes</a></li>
              <li><a href="#solucion" className="hover:text-white transition-colors">Características</a></li>
              <li><a href="#beneficios" className="hover:text-white transition-colors">Planes Beta</a></li>
              <li><a href="#galeria" className="hover:text-white transition-colors">Fichas de Adopción</a></li>
            </ul>
          </div>

          {/* Nav category 2 (col span 2) */}
          <div className="md:col-span-2 text-left space-y-3">
            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#E9C46A]">Legal</h5>
            <ul className="space-y-2 text-sm text-gray-300 font-sans">
              <li><a href="#registro" className="hover:text-white transition-colors">Términos de Uso</a></li>
              <li><a href="#registro" className="hover:text-white transition-colors">Privacidad de Datos</a></li>
              <li><a href="#registro" className="hover:text-white transition-colors">Acuerdo de Resguardo</a></li>
              <li><a href="#registro" className="hover:text-white transition-colors">Soporte HIPAA Animal</a></li>
            </ul>
          </div>

          {/* Contact help (col span 3) */}
          <div className="md:col-span-3 text-left space-y-3">
            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-[#E9C46A]">Soporte Directo</h5>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              ¿Dudas o necesitas ayuda migrando tus Excels? Nuestro equipo técnico te ayuda de forma humana 1 a 1.
            </p>
            <div className="pt-1">
              <a
                href="mailto:soporte@pawmanager.la"
                className="inline-flex items-center space-x-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl transition-all"
              >
                <Mail className="h-4 w-4" />
                <span>contacto@pawmanager.la</span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom Metadata & Tagline */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 font-sans gap-4">
          <div className="flex items-center space-x-1">
            <span>© {currentYear} PawManager. Todos los derechos reservados.</span>
          </div>

          {/* Emotional Heart Statement */}
          <div className="flex items-center space-x-1.5 text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <span>Hecho con</span>
            <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400 shrink-0" />
            <span>para los que cuidan sin descanso</span>
          </div>

          <div className="font-mono text-[10px]">
             Vite React SPA Engine 🚀
          </div>
        </div>

      </div>
    </footer>
  );
}
