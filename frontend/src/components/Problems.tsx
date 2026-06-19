import React from "react";
import { motion } from "motion/react";
import { AlertCircle, FileSpreadsheet, Activity, CalendarOff, ArrowDownRight } from "lucide-react";

export default function Problems() {
  const painPoints = [
    {
      icon: <FileSpreadsheet className="h-8 w-8 text-[#E76F51]" />,
      title: "Historiales médicos dispersos y desordenados",
      description: "Hojas de Excel desactualizadas, expedientes físicos con tachones, chats con dueños y resultados de laboratorio en sistemas distintos.",
      list: [
        "No recuerdas qué paciente es alérgico a cierto medicamento",
        "Pérdida de historial clínico original al cambiar de recepcionista",
        "Buscar el carnet de vacunación toma 15 minutos"
      ],
      emoji: "🗂️"
    },
    {
      icon: <Activity className="h-8 w-8 text-[#E76F51]" />,
      title: "Falta de seguimiento en tratamientos y urgencias",
      description: "Mensajes de WhatsApp perdidos y recordatorios en libretas hacen que los dueños olviden las consultas de seguimiento de sus mascotas.",
      list: [
        "Un paciente crítico no asiste a su revisión post-operatoria",
        "Falta de estructura para el seguimiento de enfermedades crónicas",
        "Comunicación ineficiente con el equipo médico"
      ],
      emoji: "🏥"
    },
    {
      icon: <CalendarOff className="h-8 w-8 text-[#E76F51]" />,
      title: "Agenda caótica: Empalmes y olvidos",
      description: "Agendas en papel, salas de espera llenas y turnos duplicados. Pierdes tiempo y dinero por citas no asistidas o mal gestionadas.",
      list: [
        "Mascotas que llegan al mismo tiempo para el mismo doctor",
        "Dueños que olvidan su cita porque no hubo recordatorio",
        "Tiempos muertos que reducen la rentabilidad de la clínica"
      ],
      emoji: "📅"
    }
  ];

  return (
    <section id="problemas" className="relative py-20 bg-white">
      {/* Wave bottom decoration */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-[#F4845F]/10 to-[#E9C46A]/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F4845F] font-mono bg-[#F4845F]/10 px-3.5 py-1.5 rounded-full">
            El Caos Diario en las Clínicas
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1B4332] leading-tight">
            ¿Te identificas con alguna de estas situaciones?
          </h2>
          <p className="text-gray-600 font-sans">
            Cuidar de la salud de las mascotas es tu prioridad, pero la gestión administrativa
            obsoleta a menudo drena la energía de tu equipo veterinario y reduce tu rentabilidad.
          </p>
        </div>

        {/* Pain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {painPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative bg-[#FFF7F4]/90 hover:bg-[#FFF4EE] border border-[#F4845F]/20 rounded-3xl p-6 text-left flex flex-col justify-between shadow-sm transition-all duration-300 group"
            >
              {/* Alert Badge overlay */}
              <div className="absolute top-4 right-4 bg-red-100 text-[#E76F51] p-1 rounded-full flex items-center justify-center opacity-80 shadow-inner">
                <AlertCircle className="h-4 w-4" />
              </div>

              <div className="space-y-4">
                {/* Header Icon */}
                <div className="flex items-center space-x-3">
                  <div className="bg-red-50 p-3 rounded-2xl border border-[#F4845F]/15">
                    {point.icon}
                  </div>
                  <span className="text-3xl font-bold font-mono">{point.emoji}</span>
                </div>

                {/* Card Title */}
                <h3 className="text-xl font-bold font-serif text-[#1B4332] leading-snug group-hover:text-[#F4845F] transition-colors duration-200">
                  {point.title}
                </h3>

                {/* Plain description */}
                <p className="text-sm text-gray-700 leading-relaxed font-sans">
                  {point.description}
                </p>

                {/* Sublist of pains */}
                <div className="bg-[#FFFDFB] border border-red-200/30 p-4 rounded-2xl">
                  <p className="text-xs text-red-700 font-bold tracking-wide uppercase mb-2 font-mono flex items-center space-x-1">
                    <ArrowDownRight className="h-3 w-3 shrink-0" />
                    <span>Consecuencias críticas:</span>
                  </p>
                  <ul className="space-y-1.5">
                    {point.list.map((item, iIndex) => (
                      <li key={iIndex} className="text-xs text-gray-600 flex items-start space-x-1.5 font-sans">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom tag decoration */}
              <div className="text-right mt-6">
                <span className="text-[11px] font-bold font-mono text-gray-400 uppercase tracking-widest group-hover:text-[#E76F51] transition-colors duration-200">
                  Costo: Dinero y Prestigio
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empathy Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-[#FDF8F0] border border-[#E9C46A]/20 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-left gap-6"
        >
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-[#1B4332]">Sabemos que tu tiempo es para salvar vidas, no para el papeleo</h4>
            <p className="text-sm text-gray-600 font-sans">No deberías lidiar con procesos burocráticos y desordenados durante una urgencia médica.</p>
          </div>
          <button
            onClick={() => {
              const element = document.getElementById("solucion");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shrink-0 shadow-sm transition-all duration-200 cursor-pointer"
          >
            Ver la Solución →
          </button>
        </motion.div>

      </div>
    </section>
  );
}
