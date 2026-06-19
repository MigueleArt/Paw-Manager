import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, KanbanSquare, BellRing, MessageSquareHeart, BarChart3, Users, 
  ArrowRight
} from "lucide-react";

export default function Solution() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const features = [
    {
      title: "Ficha clínica digital",
      description: "Toda la información del paciente unificada en menos de 3 clics: radiografías, vacunas aplicadas, historial de alergias, peso histórico e indicaciones nutricionales.",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-emerald-500",
      view: "pets"
    },
    {
      title: "Tablero de Hospitalización",
      description: "Gestiona los pacientes internados mediante un tablero visual interactivo. Ve quién está en recuperación, quién requiere medicamentos y quién está listo para alta.",
      icon: <KanbanSquare className="h-5 w-5" />,
      color: "bg-orange-500",
      view: "adoption-board"
    },
    {
      title: "Recordatorios de Vacunas",
      description: "Olvídate de agendar a mano. El sistema alerta por WhatsApp o correo a los dueños sobre sus próximas citas de vacunación y desparasitación.",
      icon: <BellRing className="h-5 w-5" />,
      color: "bg-amber-500",
      view: "reminders"
    },
    {
      title: "Comunicación con el Cliente",
      description: "Plantillas automáticas para dar seguimiento post-consulta. Envía recordatorios de medicación y recibe reportes del estado de la mascota desde casa.",
      icon: <MessageSquareHeart className="h-5 w-5" />,
      color: "bg-rose-500",
      view: "comms"
    },
    {
      title: "Estadísticas y Finanzas",
      description: "Analiza la rentabilidad de tu clínica con reportes en tiempo real sobre los servicios más solicitados, inventario y flujo de caja.",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-blue-500",
      view: "reports"
    },
    {
      title: "Control de Personal",
      description: "Define permisos específicos. Tus recepcionistas pueden agendar citas, tus médicos actualizar diagnósticos y los gerentes acceder a la contabilidad.",
      icon: <Users className="h-5 w-5" />,
      color: "bg-teal-500",
      view: "volunteers"
    }
  ];

  return (
    <section id="solucion" className="py-20 bg-[#FDF8F0] relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#2D6A4F]/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F] font-mono bg-[#2D6A4F]/10 px-3.5 py-1.5 rounded-full inline-block">
            La Plataforma Definitiva
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1B4332] leading-tight">
            Una sola plataforma para gestionar toda tu Clínica
          </h2>
          <p className="text-gray-600 font-sans max-w-2xl mx-auto">
            Creado de la mano con veterinarios para resolver los desafíos 
            operativos reales del día a día en la consulta.
          </p>
        </div>

        {/* Feature Layout Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
          
          {/* Features Checklist List (Left Column) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <p className="text-left text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Haz clic para previsualizar en el Dashboard 📲</p>
            {features.map((feature, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-start text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeTab === idx
                    ? "bg-white border-[#2D6A4F] shadow-md shadow-[#2D6A4F]/5 scale-[1.02]"
                    : "bg-[#FDF8F0] border-gray-200/60 hover:bg-white hover:border-[#2D6A4F]/30"
                }`}
              >
                {/* Icon Circle */}
                <div className={`p-2.5 rounded-xl mr-4 text-white ${feature.color}`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-[#1B4332]">
                      {feature.title}
                    </h3>
                    {activeTab === idx && (
                      <motion.span
                        layoutId="active-dot"
                        className="h-1.5 w-1.5 rounded-full bg-[#F4845F]"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-sans">
                    {feature.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive CSS Dashboard Mockup (Right Column) */}
          <div className="lg:col-span-7">
            <div className="relative">
              {/* Soft visual background card shadows */}
              <div className="absolute inset-0 bg-[#2D6A4F]/10 rounded-[2.5rem] transform -rotate-2 scale-[0.98] -z-10" />
              <div className="absolute inset-0 bg-white rounded-[2.5rem] transform rotate-1 scale-[0.99] -z-10 shadow-lg" />

              {/* Main Simulated Browser frame */}
              <div className="bg-[#1E1E1E] rounded-[2.2rem] p-3 shadow-2xl border border-gray-700 overflow-hidden text-left relative min-h-[480px] flex flex-col">
                
                {/* Top Browser Bar */}
                <div className="flex items-center justify-between pb-3 px-4 border-b border-gray-800">
                  <div className="flex space-x-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block" />
                    <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 inline-block" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="bg-gray-800 text-gray-400 text-xs px-6 py-1 rounded-full font-mono max-w-[280px] truncate text-center block">
                    app.pawmanager.la/control_panel
                  </span>
                  <div className="w-12" /> {/* balanced space */}
                </div>

                {/* Simulated App Sandbox Shell */}
                <div className="flex-1 bg-white p-5 flex flex-col justify-between overflow-hidden">
                  
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Panel de Control: Clínica San Roque</h4>
                      <h3 className="font-serif font-black text-[#1B4332] text-xl">Administración Activa</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#2D6A4F] text-[#FDF8F0] p-1.5 rounded-lg text-xs font-bold leading-none">🐾 CSR</span>
                    </div>
                  </div>

                  {/* Active Window Content updated interactively */}
                  <div className="flex-1 py-4">
                    <AnimatePresence mode="wait">
                      
                      {/* VIEW 0: Pets Database List */}
                      {activeTab === 0 && (
                        <motion.div
                          key="pets-db"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-1 rounded-lg">FICHA CLÍNICA DIGITAL</span>
                            <span className="text-xs text-gray-500 font-mono">2,148 pacientes registrados</span>
                          </div>
                          
                          <div className="space-y-2">
                            {/* Pet item 1 */}
                            <div className="flex items-center justify-between p-3 bg-[#FDF8F0] border border-[#2D6A4F]/15 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">🐕</span>
                                <div>
                                  <h5 className="font-bold text-[#1B4332] text-sm leading-tight">Roco</h5>
                                  <p className="text-xs text-gray-500">Mestizo Pitbull • Dueño: Juan P.</p>
                                </div>
                              </div>
                              <span className="bg-[#2D6A4F]/20 text-[#2D6A4F] text-[10px] font-bold px-2.5 py-1 rounded-full">Vacunas al día</span>
                            </div>

                            {/* Pet item 2 */}
                            <div className="flex items-center justify-between p-3 bg-[#FDF8F0] border border-[#2D6A4F]/15 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">🐈</span>
                                <div>
                                  <h5 className="font-bold text-[#1B4332] text-sm leading-tight">Mimi</h5>
                                  <p className="text-xs text-gray-500">Gatito Angora • Dueño: Karla L.</p>
                                </div>
                              </div>
                              <span className="bg-[#F4845F]/20 text-[#F4845F] text-[10px] font-bold px-2.5 py-1 rounded-full">⚠ Tratamiento Otitis</span>
                            </div>

                            {/* Pet item 3 */}
                            <div className="flex items-center justify-between p-3 bg-[#FDF8F0] border border-[#2D6A4F]/15 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">🐕</span>
                                <div>
                                  <h5 className="font-bold text-[#1B4332] text-sm leading-tight">Bella</h5>
                                  <p className="text-xs text-gray-500">Pastor Belga • Dueño: Carlos M.</p>
                                </div>
                              </div>
                              <span className="bg-[#E9C46A]/30 text-[#805B10] text-[10px] font-bold px-2.5 py-1 rounded-full">Cita de control hoy</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 1: Adoptions Kanban Tab */}
                      {activeTab === 1 && (
                        <motion.div
                          key="adoption"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-[#F4845F] bg-[#F4845F]/10 px-2 py-1 rounded-lg">PACIENTES HOSPITALIZADOS</span>
                            <span className="text-xs text-green-700 font-mono">6 en piso actualmente</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {/* Column 1 */}
                            <div className="bg-[#FFF8F6] p-2.5 rounded-xl border border-[#F4845F]/10 space-y-2">
                              <h5 className="font-bold text-[10px] text-[#F4845F] uppercase font-mono tracking-wider">Terapia Intensiva (2)</h5>
                              <div className="bg-white p-2 rounded-lg shadow-sm border border-orange-100 text-[11px]">
                                <p className="font-bold">Max</p>
                                <p className="text-gray-500 text-[9px] font-sans">Monitoreo constante</p>
                              </div>
                            </div>

                            {/* Column 2 */}
                            <div className="bg-amber-50/50 p-2.5 rounded-xl border border-[#E9C46A]/20 space-y-2">
                              <h5 className="font-bold text-[10px] text-[#805B10] uppercase font-mono tracking-wider">Recuperación (1)</h5>
                              <div className="bg-white p-2 rounded-lg shadow-sm border border-amber-100 text-[11px] relative">
                                <p className="font-bold">Pelusa</p>
                                <span className="bg-[#2D6A4F] text-white text-[7px] px-1 rounded absolute top-1 right-1 font-mono">Meds 4PM</span>
                                <p className="text-gray-500 text-[9px]">Post-cirugía</p>
                              </div>
                            </div>

                            {/* Column 3 */}
                            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-[#2D6A4F]/20 space-y-2">
                              <h5 className="font-bold text-[10px] text-[#2D6A4F] uppercase font-mono tracking-wider">Alta Médica (3)</h5>
                              <div className="bg-white p-2 rounded-lg shadow-sm border border-emerald-100 text-[11px]">
                                <p className="font-bold">Héctor Luna</p>
                                <p className="text-emerald-700 text-[9px] font-semibold">Esperando al dueño</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 2: Reminders Automation Tab */}
                      {activeTab === 2 && (
                        <motion.div
                          key="rems"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">VENCIMIENTOS Y CITAS</span>
                            <span className="text-xs text-gray-500 font-mono">Mañana: 12 consultas</span>
                          </div>

                          <div className="space-y-2.5">
                            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/50 flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-3">
                                <span className="p-1.5 rounded-lg bg-amber-500 text-white">🔔</span>
                                <div>
                                  <p className="font-bold font-sans">Vacuna Anual - Roco</p>
                                  <p className="text-[10px] text-gray-500">Dr. Asignado: Elena Ortiz</p>
                                </div>
                              </div>
                              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">DUEÑO AVISADO</span>
                            </div>

                            <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200/50 flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-3">
                                <span className="p-1.5 rounded-lg bg-rose-500 text-white">💉</span>
                                <div>
                                  <p className="font-bold">Control Desparasitante - 4 Mascotas</p>
                                  <p className="text-[10px] text-gray-500">Notificación semanal programada</p>
                                </div>
                              </div>
                              <span className="text-[10px] bg-[#2D6A4F]/10 text-[#2D6A4F] px-2 py-0.5 rounded font-mono">AUTO-WHATSAPP ENVIADO ✓</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 3: Comms Central Hub */}
                      {activeTab === 3 && (
                        <motion.div
                          key="comms"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-3"
                        >
                          <span className="text-xs font-bold font-mono text-rose-700 bg-rose-50 px-2 py-1 rounded-lg">SEGUIMIENTO CLÍNICO POR WHATSAPP</span>
                          
                          <div className="border border-green-100 rounded-xl p-3 bg-green-50/20 text-xs text-left text-gray-700 font-sans leading-relaxed">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-green-100">
                              <span className="font-bold text-[#2D6A4F]">Plantilla Post-Operatoria</span>
                              <span className="text-xs text-gray-400 font-mono">A las 24 hrs de cirugía</span>
                            </div>
                            <p>
                              "Hola <strong>Fam. Salazar</strong> 🐾, somos de la Clínica San Roque. Queremos saber cómo ha pasado la noche <strong>Milo</strong> después de su cirugía. ¿Ha comido bien? Por favor responde con un 'Todo bien' o mándanos una foto si tienes dudas."
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-50">
                              <span className="text-xs text-gray-400 font-mono">Tasa de respuesta: 94%</span>
                              <span className="bg-emerald-600 text-white font-bold rounded px-2.5 py-0.5 text-[9px] uppercase">Enviado</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 4: Reports Statistics Tab */}
                      {activeTab === 4 && (
                        <motion.div
                          key="reports"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">REPORTE FINANCIERO MENSUAL</span>
                            <span className="text-xs text-brand-600 font-mono">Junio 2026</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#FDF8F0] p-3 rounded-2xl border border-[#2D6A4F]/10">
                              <span className="text-xs text-gray-500 font-sans block">Consultas Realizadas 🩺</span>
                              <span className="text-2xl font-bold text-[#1B4332] font-serif">412</span>
                              <span className="text-[10px] text-[#2D6A4F] block font-mono">▲ 14% vs mes pasado</span>
                            </div>
                            <div className="bg-[#FDF8F0] p-3 rounded-2xl border border-[#2D6A4F]/10">
                              <span className="text-xs text-gray-500 font-sans block">Ventas en Farmacia</span>
                              <span className="text-2xl font-bold text-[#1B4332] font-serif">$85k</span>
                              <span className="text-[10px] text-[#2D6A4F] block font-mono">Rotación saludable</span>
                            </div>
                          </div>

                          <div className="h-16 bg-blue-50/10 border border-blue-100 rounded-xl flex items-center justify-around text-xs p-2">
                            <div className="text-center">
                              <span className="text-[9px] text-gray-500 block uppercase font-mono">Ticket Promedio</span>
                              <strong className="text-blue-800">$850 MXN</strong>
                            </div>
                            <div className="w-[1px] h-8 bg-blue-100" />
                            <div className="text-center">
                              <span className="text-[9px] text-gray-500 block uppercase font-mono">Nuevos Clientes</span>
                              <strong className="text-emerald-800">+45 este mes</strong>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* VIEW 5: Volunteers Account Management */}
                      {activeTab === 5 && (
                        <motion.div
                          key="volunt"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">PERSONAL & ROLES</span>
                            <span className="text-xs text-gray-500 font-mono">8 colaboradores activos</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs">
                              <div className="flex items-center space-x-3">
                                <span className="w-8 h-8 rounded-full bg-[#E9C46A] flex items-center justify-center font-bold font-mono text-[#1B4332]">SO</span>
                                <div>
                                  <p className="font-bold">Sofia Orozco</p>
                                  <p className="text-[10px] text-gray-500">Recepcionista Principal</p>
                                </div>
                              </div>
                              <span className="bg-[#2D6A4F]/10 text-[#2D6A4F] text-[90%] font-semibold px-2 py-0.5 rounded">Caja y Agenda</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs">
                              <div className="flex items-center space-x-3">
                                <span className="w-8 h-8 rounded-full bg-[#F4845F] flex items-center justify-center font-bold font-mono text-white">DM</span>
                                <div>
                                  <p className="font-bold">Dr. Mateo Pérez</p>
                                  <p className="text-[10px] text-gray-500">Veterinario Especialista</p>
                                </div>
                              </div>
                              <span className="bg-amber-100 text-amber-800 text-[90%] font-semibold px-2 py-0.5 rounded">Médico</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Browser simulated footer status */}
                  <div className="bg-[#FDF8F0] p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs mt-3">
                    <span className="font-mono text-gray-500 flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
                      <span>Conexión cifrada segura SSL</span>
                    </span>
                    <button
                      onClick={() => {
                        const el = document.getElementById("registro");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#F4845F] flex items-center space-x-1 bg-white px-2.5 py-1 rounded-lg hover:shadow-xs"
                    >
                      <span>Obtener este panel hoy</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
