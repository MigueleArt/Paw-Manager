import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Plus, MoreHorizontal, User, PawPrint, Video, X, Trash2 } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  petName: string;
  ownerName: string;
  type: string;
  status: 'Confirmada' | 'En Espera';
  avatar: string;
}

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    time: '09:00',
    petName: 'Luna',
    ownerName: 'María García',
    type: 'Vacunación',
    status: 'Confirmada',
    avatar: '🐶'
  },
  {
    id: '2',
    time: '10:30',
    petName: 'Max',
    ownerName: 'Juan Pérez',
    type: 'Chequeo General',
    status: 'En Espera',
    avatar: '🐱'
  },
  {
    id: '3',
    time: '12:00',
    petName: 'Rocky',
    ownerName: 'Ana Martínez',
    type: 'Cirugía Menor',
    status: 'Confirmada',
    avatar: '🐕'
  }
];

export default function AppointmentModule() {
  const [activeTab, setActiveTab] = useState('Hoy');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    time: '',
    type: 'Chequeo General'
  });

  useEffect(() => {
    const stored = localStorage.getItem('pawmanager_appointments');
    if (stored) {
      setAppointments(JSON.parse(stored));
    } else {
      setAppointments(DEFAULT_APPOINTMENTS);
    }
  }, []);

  useEffect(() => {
    if (appointments.length > 0 || localStorage.getItem('pawmanager_appointments')) {
      localStorage.setItem('pawmanager_appointments', JSON.stringify(appointments));
    }
  }, [appointments]);

  const toggleStatus = (id: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        return { ...apt, status: apt.status === 'Confirmada' ? 'En Espera' : 'Confirmada' };
      }
      return apt;
    }));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
    setOpenMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petName || !formData.ownerName || !formData.time) return;

    const newApt: Appointment = {
      id: Date.now().toString(),
      time: formData.time,
      petName: formData.petName,
      ownerName: formData.ownerName,
      type: formData.type,
      status: 'En Espera',
      avatar: '🐾'
    };

    setAppointments(prev => [...prev, newApt]);
    setIsModalOpen(false);
    setFormData({ petName: '', ownerName: '', time: '', type: 'Chequeo General' });
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="modulo-citas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black font-serif text-[#1B4332] mb-4">
            Gestión de Citas Inteligente
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Olvídate del papel y las confusiones. Administra tu agenda diaria, envía recordatorios automáticos por WhatsApp y mantén un control total de tus pacientes con nuestro panel interactivo.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="bg-gray-50 rounded-3xl border border-gray-200 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          {/* Top Navbar Mockup */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#2D6A4F]" />
                <span>Agenda Activa</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            {/* Sidebar Mockup */}
            <div className="hidden md:block md:col-span-3 border-r border-gray-200 bg-white p-6">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl py-3 px-4 font-bold flex items-center justify-center space-x-2 transition-colors shadow-md cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Cita</span>
              </button>

              <div className="mt-8 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Vistas</p>
                {['Hoy', 'Semana', 'Mes'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === tab ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-1 md:col-span-9 p-6 sm:p-8 bg-gray-50/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-serif">Agenda de {activeTab}</h3>
                  <p className="text-sm text-gray-500 font-sans mt-1">{appointments.length} citas programadas.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="md:hidden bg-[#2D6A4F] text-white rounded-lg p-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {appointments.length === 0 && (
                     <motion.div 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }} 
                       className="text-center py-10 text-gray-400"
                     >
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No hay citas programadas.</p>
                     </motion.div>
                  )}
                  {appointments.map((apt, index) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow relative"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#FDF8F0] rounded-full flex items-center justify-center text-2xl border border-[#E9C46A]/30 shrink-0">
                          {apt.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 font-sans">{apt.petName} <span className="text-sm font-normal text-gray-500 ml-1">({apt.ownerName})</span></h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1 font-sans">
                            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {apt.time}</span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className="flex items-center text-gray-600"><PawPrint className="w-3.5 h-3.5 mr-1 text-[#F4845F]" /> {apt.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 relative">
                        <button 
                          onClick={() => toggleStatus(apt.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${apt.status === 'Confirmada' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                        >
                          {apt.status}
                        </button>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === apt.id ? null : apt.id)}
                            className="p-2 text-gray-400 hover:text-[#2D6A4F] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          <AnimatePresence>
                            {openMenuId === apt.id && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 shadow-lg rounded-xl z-10 overflow-hidden"
                              >
                                <button 
                                  onClick={() => deleteAppointment(apt.id)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Eliminar</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Cita */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="bg-[#2D6A4F] px-6 py-4 flex items-center justify-between text-white">
                <h3 className="font-bold text-lg">Agendar Nueva Cita</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Mascota</label>
                  <input 
                    type="text" required
                    value={formData.petName}
                    onChange={e => setFormData({...formData, petName: e.target.value})}
                    placeholder="Ej. Firulais"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Dueño</label>
                  <input 
                    type="text" required
                    value={formData.ownerName}
                    onChange={e => setFormData({...formData, ownerName: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hora</label>
                    <input 
                      type="time" required
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] outline-none transition-all cursor-pointer"
                    >
                      <option>Vacunación</option>
                      <option>Chequeo General</option>
                      <option>Cirugía Menor</option>
                      <option>Estética</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#F4845F] hover:bg-[#e26d47] text-white font-bold py-3 rounded-xl transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Guardar Cita</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
