import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Sparkles, CheckCircle, ArrowRight, ShieldCheck, Heart, Users, X, Activity, PawPrint } from "lucide-react";

export default function Hero() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState("dogs");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="hero" className="relative pt-24 pb-16 md:pt-32 md:pb-28 overflow-hidden bg-paw-pattern">
      {/* Decorative Warm Blobs */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-[#F4845F]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#E9C46A]/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-[#2D6A4F]/10 text-[#2D6A4F] px-4 py-1.5 rounded-full text-xs font-semibold self-start shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#E9C46A] fill-[#E9C46A]" />
              <span>SaaS para Héroes de Cuatro Patas 🐕🐈</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif text-[#1B4332] leading-[1.12]"
            >
              Tu refugio merece una herramienta tan buena como tu <span className="text-[#F4845F] relative">trabajo<span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#E9C46A]/50 rounded-full -z-10" /></span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-700 font-sans max-w-2xl leading-relaxed"
            >
              Deja de perder mascotas entre hojas de Excel y mensajes de WhatsApp. 
              Organiza fichas médicas, solicitudes de adopción, vacunas y voluntarios en un solo lugar.
            </motion.p>

            {/* Trust checkmarks */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm text-[#1B4332] font-semibold"
            >
              <div className="flex items-center space-x-2 bg-white/60 p-2.5 rounded-xl border border-[#2D6A4F]/10">
                <CheckCircle className="h-4 w-4 text-[#2D6A4F] shrink-0" />
                <span>Acceso en beta</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 p-2.5 rounded-xl border border-[#2D6A4F]/10">
                <CheckCircle className="h-4 w-4 text-[#2D6A4F] shrink-0" />
                <span>Increíblemente fácil</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 p-2.5 rounded-xl border border-[#2D6A4F]/10">
                <CheckCircle className="h-4 w-4 text-[#2D6A4F] shrink-0" />
                <span>Hecho para refugios</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection("registro")}
                className="bg-[#F4845F] hover:bg-[#e26d47] text-white text-base font-bold py-4 px-8 rounded-2xl shadow-lg shadow-[#F4845F]/20 transition-all duration-200 flex items-center justify-center space-x-3 cursor-pointer group"
              >
                <span>Registrarme</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDemoModal(true)}
                className="bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] text-base font-bold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer border border-[#2D6A4F]/20"
              >
                <Play className="h-5 w-5 fill-[#2D6A4F] text-[#2D6A4F]" />
                <span>Ver demo en vivo</span>
              </motion.button>
            </motion.div>



          </div>

          {/* Hero Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative mt-6 lg:mt-0"
          >
            {/* Background Accent Card Behind Image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E9C46A] to-[#F4845F] rounded-[2.5rem] transform rotate-3 scale-95 opacity-20 -z-10" />
            
            {/* Framed Hero Image */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] sm:aspect-square lg:aspect-[4/5] object-cover group">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80"
                alt="Adorables mascotas esperando por un hogar"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Image Overlay Cards */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-[#F4845F]/10 flex items-center space-x-3 pointer-events-none">
                <div className="bg-[#2D6A4F] text-white p-2 rounded-xl">
                  <Heart className="h-4 w-4 fill-white text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-mono text-gray-500">ESTADO DE HOY</p>
                  <p className="text-sm font-semibold text-gray-800">¡3 Adopciones Hoy!</p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 left-4 bg-[#1B4332]/90 backdrop-blur-md p-4 rounded-2xl shadow-lg text-left">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-[#E9C46A]" />
                    <span className="text-xs font-mono text-gray-300 font-bold tracking-wider">EXPEDIENTE CENTRAL</span>
                  </div>
                  <span className="bg-[#F4845F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Listo para Adopción</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-white font-serif font-bold text-lg">"Toby"</h4>
                    <p className="text-xs text-gray-300">Golden Retriever • 1.5 años • Vacunado</p>
                  </div>
                  <span className="text-2xl">🐕</span>
                </div>
              </div>
            </div>

            {/* Little Paw floating icons */}
            <div className="absolute -top-6 -right-6 bg-[#E9C46A] text-[#1B4332] p-4 rounded-full shadow-lg -rotate-12 hover:rotate-12 transition-transform duration-300">
              <span className="text-2xl font-bold">🐾</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Demo Modal / Interactive Quick Sandbox Simulator */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoModal(false)}
              className="absolute inset-0 bg-[#1B4332]/80 backdrop-blur-sm"
            />

            {/* Sandbox Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ thickness: 2, duration: 0.3 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-950/20 z-10"
            >
              {/* Header */}
              <div className="bg-[#2D6A4F] text-white p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-white/10 p-1.5 rounded-lg">
                    <PawPrint className="h-5 w-5 text-[#E9C46A]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg">Simulador de Ficha PawManager</h3>
                    <p className="text-xs text-emerald-100 font-sans">Mira cómo se vería tu panel en segundos</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Demo Content */}
              <div className="p-6 bg-[#FDF8F0] grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left controls */}
                <div className="md:col-span-4 flex flex-col space-y-3">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Elige una Mascota</p>
                  
                  <button
                    onClick={() => setActiveDemoTab("dogs")}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${
                      activeDemoTab === "dogs"
                        ? "bg-[#2D6A4F]/10 border-[#2D6A4F] shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">🐕</span>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">Toby (Perro)</h4>
                      <p className="text-xs text-gray-500">Pendiente de desparasitación</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveDemoTab("cats")}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${
                      activeDemoTab === "cats"
                        ? "bg-[#2D6A4F]/10 border-[#2D6A4F] shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">🐈</span>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">Luna (Gato)</h4>
                      <p className="text-xs text-gray-500">Vacunación Completa</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveDemoTab("bunny")}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${
                      activeDemoTab === "bunny"
                        ? "bg-[#2D6A4F]/10 border-[#2D6A4F] shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">🐇</span>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">Copito (Conejo)</h4>
                      <p className="text-xs text-gray-500">Rescatado ayer por voluntario</p>
                    </div>
                  </button>

                  <div className="bg-[#E9C46A]/20 p-4 rounded-2xl border border-[#E9C46A]/30 mt-4">
                    <p className="text-xs text-[#805B10] font-semibold leading-relaxed">
                      💡 En el sistema completo, un voluntario puede escanear un QR en la jaula para actualizar estas fichas médicas al instante.
                    </p>
                  </div>
                </div>

                {/* Right Interactive Dashboard Sheet */}
                <div className="md:col-span-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-4">
                  
                  {activeDemoTab === "dogs" && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🐕</span>
                          <div>
                            <h4 className="font-serif font-bold text-[#1B4332] text-lg">Toby</h4>
                            <p className="text-xs text-gray-500">ID: #PM-8092 • Golden Retriever</p>
                          </div>
                        </div>
                        <span className="bg-[#F4845F]/20 text-[#F4845F] text-xs font-bold px-3 py-1 rounded-full border border-[#F4845F]/30">
                          Urgente • Falta Vacuna Sextuple
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Edad</span>
                          <span className="font-semibold text-gray-800">1 año, 6 meses</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Ingreso</span>
                          <span className="font-semibold text-gray-800">14 Abril 2026</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Ubicación</span>
                          <span className="font-semibold text-gray-800">Jaula 4B (Temporal Poniente)</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Adoptantes Interesados</span>
                          <span className="font-semibold text-[#2D6A4F]">4 Solicitudes activas</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <h5 className="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wide">Historial Médico</h5>
                        <ul className="space-y-1.5 text-xs text-gray-700">
                          <li className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Vacuna de la Rabia - <strong className="text-emerald-700">Aplicada</strong> (10 de Mayo)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <span>Desparasitación Triple - <strong>Pendiente</strong> (Próx Jueves)</span>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {activeDemoTab === "cats" && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🐈</span>
                          <div>
                            <h4 className="font-serif font-bold text-[#1B4332] text-lg">Luna</h4>
                            <p className="text-xs text-gray-500">ID: #PM-4412 • Siamés Mestizo</p>
                          </div>
                        </div>
                        <span className="bg-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold px-3 py-1 rounded-full border border-[#2D6A4F]/30">
                          Expediente Completo
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Edad</span>
                          <span className="font-semibold text-gray-800">8 meses</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Ingreso</span>
                          <span className="font-semibold text-gray-800">01 Mayo 2026</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Esterilización</span>
                          <span className="font-semibold text-[#2D6A4F]">Realizada ✓</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Temperamento</span>
                          <span className="font-semibold text-gray-800">Tranquilo, miedoso</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <h5 className="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wide font-mono">Última Nota del Veterinario</h5>
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg italic">
                          "Luna se encuentra en excelente estado general. Se adaptó muy bien al alimento húmedo. Su siguiente control de peso es el 1 de Junio."
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeDemoTab === "bunny" && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🐇</span>
                          <div>
                            <h4 className="font-serif font-bold text-[#1B4332] text-lg">Copito</h4>
                            <p className="text-xs text-gray-500">ID: #PM-1200 • Conejo Blanco Angora</p>
                          </div>
                        </div>
                        <span className="bg-amber-100 text-[#805B10] text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                          Recién Rescatado
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Edad</span>
                          <span className="font-semibold text-gray-800">Desconocida (~1 año)</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Ingreso</span>
                          <span className="font-semibold text-gray-800">Ayer, 04:12 Z</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Rescatista</span>
                          <span className="font-semibold text-gray-800">Lucía Mendoza</span>
                        </div>
                        <div className="bg-[#FDF8F0] p-3 rounded-xl">
                          <span className="text-gray-500 block">Situación</span>
                          <span className="font-semibold text-red-600">En observación médica</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <h5 className="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wide">Acciones Inmediatas</h5>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-red-50 text-red-700 border border-red-100 text-[11px] font-medium px-2 py-1 rounded-lg">Programar Baño Especial</span>
                          <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[11px] font-medium px-2 py-1 rounded-lg">Examen Coprológico</span>
                          <span className="bg-gray-50 text-gray-600 border border-gray-100 text-[11px] font-medium px-2 py-1 rounded-lg">Subir Fotos de Ingreso</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Register prompt action inside sandbox */}
                  <div className="bg-[#2D6A4F] text-white p-3 rounded-xl flex items-center justify-between text-xs mt-2">
                    <span>¿Te gusta cómo funciona? Únete hoy</span>
                    <button
                      onClick={() => {
                        setShowDemoModal(false);
                        scrollToSection("registro");
                      }}
                      className="bg-white text-[#2D6A4F] font-bold px-3 py-1.5 rounded-lg hover:bg-opacity-90 cursor-pointer"
                    >
                      Registrarme
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
