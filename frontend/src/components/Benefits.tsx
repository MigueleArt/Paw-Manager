import React from "react";
import { motion } from "motion/react";
import { Heart, Activity, CheckCircle, ShieldCheck, HeartHandshake } from "lucide-react";

export default function Benefits() {
  const benefitsList = [
    {
      img: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80",
      alt: "Veterinaria revisando el expediente digital de un paciente",
      title: "Nunca pierdas el historial médico de un paciente",
      tagline: "EXPEDIENTE CLÍNICO DIGITAL",
      emoji: "🩺",
      description: "Consulta vacunas, tratamientos, diagnósticos y notas de cada visita desde cualquier dispositivo. Todo el historial de tus pacientes, siempre a la mano.",
      badge: "Sincronizado"
    },
    {
      img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80",
      alt: "Recepcionista de veterinaria agendando una cita en computadora",
      title: "Agenda citas médicas y de estética sin choques de horario",
      tagline: "AGENDA INTELIGENTE",
      emoji: "📅",
      description: "Organiza consultas, vacunación, baños y cortes en un solo calendario. Recordatorios automáticos reducen las ausencias y los espacios vacíos.",
      badge: "-50% Inasistencias"
    },
    {
      img: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800&q=80",
      alt: "Veterinario sonriente entregando una mascota saludable a su dueño",
      title: "Da seguimiento post-consulta sin esfuerzo",
      tagline: "SEGUIMIENTO CLÍNICO",
      emoji: "❤️‍🩹",
      description: "Programa recordatorios de próximas dosis, controles y revisiones. Cada seguimiento queda anexado automáticamente al expediente del paciente.",
      badge: "+92% Pacientes al Día"
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F4845F] font-mono bg-[#F4845F]/10 px-3.5 py-1.5 rounded-full inline-block">
            El Impacto Real de PawManager
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1B4332] leading-tight">
            Más citas atendidas. Menos caos administrativo.
          </h2>
          <p className="text-gray-600 font-sans max-w-2xl mx-auto">
            Hacemos que lo complejo se sienta natural, devolviéndote valioso tiempo libre para enfocarte en lo que de verdad importa: el bienestar de tus pacientes.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefitsList.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-[#FDF8F0] rounded-[2rem] overflow-hidden border border-[#E9C46A]/10 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-[#2D6A4F]/20 transition-all duration-300 group"
            >
              {/* Top Image Frame */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual badge overlay */}
                <div className="absolute top-4 left-4 bg-[#1B4332]/95 backdrop-blur-md text-[#E9C46A] text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/10 shadow-sm">
                  {item.tagline}
                </div>

                {/* Counter Metric overlay */}
                <span className="absolute bottom-4 right-4 bg-[#FDF8F0] text-[#1B4332] font-semibold text-xs px-3 py-1 rounded-full border border-[#2D6A4F]/10 shadow-sm">
                  {item.badge}
                </span>
              </div>

              {/* Text Card Body */}
              <div className="p-6 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <h3 className="font-serif font-extrabold text-xl text-[#1B4332] leading-snug group-hover:text-[#F4845F] transition-colors duration-250">
                      {item.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-dashed border-[#F4845F]/15 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Modulo Integrado</span>
                  <div className="flex items-center space-x-1 text-[#2D6A4F]">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-bold font-sans">Activo</span>
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}