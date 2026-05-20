import React from "react";
import { motion } from "motion/react";
import { Star, ShieldCheck, Quote, Users, MapPin, Building } from "lucide-react";

interface WaitlistEntry {
  id: string;
  shelterName: string;
  userName: string;
  petCount: string;
  timestamp: string;
}

interface SocialProofProps {
  waitlist: WaitlistEntry[];
}

export default function SocialProof({ waitlist }: SocialProofProps) {
  const testimonials = [
    {
      quote: "Antes de PawManager, las dosis de desparasitación mensual de nuestros 80 animalitos eran un dolor de cabeza. Algún voluntario olvidaba anotarla y duplicábamos de forma involuntaria. Hoy nos toma 30 segundos agendar todo el año.",
      author: "Lic. Clara Bustamante",
      role: "Directora de Operaciones",
      shelter: "Refugio Amigos Peludos, CDMX",
      stars: 5,
      avatarBg: "bg-[#2D6A4F] text-[#FDF8F0]"
    },
    {
      quote: "Me encanta el tablero visual de adopciones. En un formato parecido a Trello sabemos exactamente en qué etapa de evaluación está cada familia interesada. Filtramos mejor y redujimos a cero las adopciones fallidas.",
      author: "María Inés Santos",
      role: "Fundadora",
      shelter: "Fundación Casita de Perros, GDL",
      stars: 5,
      avatarBg: "bg-[#F4845F] text-white"
    },
    {
      quote: "Soy rescatista independiente y PawManager me devolvió la cordura. Compartiendo el link público obtuve 15 solicitudes completadas en 2 días y aprobé una adopción ideal de forma totalmente segura.",
      author: "Dra. Natalia Ruiz",
      role: "Rescatista Independiente",
      shelter: "Salva un Amigo, Querétaro",
      stars: 5,
      avatarBg: "bg-[#E9C46A] text-[#1B4332]"
    }
  ];

  // Base list of pre-registered organizations to display live waitlist updates
  const preRegistered = [
    { shelterName: "Gatitos Huérfanos Toluca", petCount: "10-50", timestamp: "Hace 1 hora" },
    { shelterName: "Asociación Canina del Norte, MTY", petCount: "+100", timestamp: "Hace 2 horas" },
    { shelterName: "Rescate Animal Hermosillo", petCount: "1-10", timestamp: "Hace 1 día" },
    { shelterName: "Huellitas del Fénix, Puebla", petCount: "50-100", timestamp: "Hace 1 día" }
  ];

  const totalWaitlistCount = 12 + waitlist.length;

  return (
    <section id="testimonios" className="py-20 bg-white relative overflow-hidden">
      
      {/* Wave design background separator */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-emerald-500/10 to-[#F4845F]/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F] font-mono bg-[#2D6A4F]/10 px-3.5 py-1.5 rounded-full inline-block">
            Soporte Comunitario
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1B4332] leading-tight">
            Únete a los primeros refugios en México que están probando la plataforma
          </h2>
          <p className="text-gray-600 font-sans max-w-2xl mx-auto">
            Héroes anónimos que dedican su vida a cuidar de quienes no tienen voz ya están organizando sus labores de manera profesional.
          </p>
        </div>

        {/* Counter Widget */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 bg-[#2D6A4F]/5 border-2 border-dashed border-[#2D6A4F]/20 rounded-3xl p-6 max-w-2xl mx-auto text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-mono text-gray-500 font-bold mb-1">¡Lista de Espera Beta Cerrada!</p>
              <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                <span className="text-5xl font-black font-serif text-[#2D6A4F] tracking-tight">
                  {totalWaitlistCount}
                </span>
                <span className="text-lg font-serif text-gray-600 font-bold">refugios pre-registrados</span>
              </div>
            </div>
            <div className="h-[2px] w-12 sm:h-12 sm:w-[2px] bg-[#2D6A4F]/25" />
            <div className="text-left space-y-1.5 text-xs text-gray-700">
              <span className="flex items-center space-x-1.5 font-bold text-[#F4845F]">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
                <span>Quedan solo 8 lugares gratuitos</span>
              </span>
              <p className="text-gray-500 max-w-xs leading-relaxed font-sans">
                La fase beta incluye soporte de migración gratuito desde hojas de Excel a la plataforma.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#FDF8F0] border border-[#F4845F]/10 rounded-3xl p-6 text-left flex flex-col justify-between shadow-xs hover:border-[#2D6A4F]/30 hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Visual Stars */}
                <div className="flex space-x-1">
                  {[...Array(t.stars)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-[#E9C46A] text-[#E9C46A]" />
                  ))}
                </div>

                {/* Main Quote text */}
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-[#2D6A4F]/10 -z-10" />
                  <p className="text-sm text-gray-800 leading-relaxed font-sans italic pl-4">
                    "{t.quote}"
                  </p>
                </div>
              </div>

              {/* Author Footer */}
              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center space-x-3 text-xs">
                <div className={`w-10 h-10 rounded-full font-serif font-black flex items-center justify-center shrink-0 ${t.avatarBg}`}>
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 font-sans">{t.author}</h4>
                  <p className="text-gray-500 text-[11px]">{t.role}</p>
                  <p className="text-[#2D6A4F] font-semibold text-[11px] flex items-center space-x-1">
                    <Building className="h-3 w-3 inline mr-0.5" />
                    <span>{t.shelter}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time waiting list ticker */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-4xl mx-auto text-left">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-[#2D6A4F]" />
            <h4 className="font-serif font-bold text-base text-[#1B4332]">Últimas organizaciones en registrarse:</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* User Waitlist if any exists */}
            {waitlist.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 p-3 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">
                    ¡Registrado! 🐾
                  </span>
                  <h5 className="font-bold text-xs text-[#1B4332] truncate font-sans">{entry.shelterName}</h5>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-2 pt-2 border-t border-[#2D6A4F]/10">
                  <span>Cant: {entry.petCount}</span>
                  <span className="text-[#2D6A4F] font-bold">Ahora</span>
                </div>
              </motion.div>
            ))}

            {/* Fictional Pre-registered items */}
            {preRegistered.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 p-3 rounded-xl flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-1 text-gray-400 mb-1.5 font-mono text-[9px]">
                    <MapPin className="h-2.5 w-2.5 text-gray-400" />
                    <span>MÉXICO</span>
                  </div>
                  <h5 className="font-semibold text-xs text-gray-800 truncate font-sans">{item.shelterName}</h5>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-2 pt-2 border-t border-gray-50">
                  <span>Cant: {item.petCount}</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
