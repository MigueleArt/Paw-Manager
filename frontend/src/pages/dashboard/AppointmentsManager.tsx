import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, XCircle, X } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export default function AppointmentsManager() {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
const [completedCount, setCompletedCount] = useState(0);
const [currentDate, setCurrentDate] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [viewAppt, setViewAppt] = useState<any>(null);
  const [newAppt, setNewAppt] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    time: '09:00', 
    petId: '', 
    petName: '', 
    type: 'Consulta General', 
    doctor: '',
    reason: ''
  });

  useEffect(() => {
    if (!userData?.clinicId) return;
    const clinicId = userData.clinicId;
    setCurrentDate(new Date().toLocaleString());

    const unsubscribeAppts = onSnapshot(query(collection(db, 'appointments'), where('clinicId', '==', clinicId)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
      setAppointments(data);
    });

    const unsubscribeRoles = onSnapshot(query(collection(db, 'roles'), where('clinicId', '==', clinicId)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRoles(data);
    });

    const unsubscribePets = onSnapshot(query(collection(db, 'pets'), where('clinicId', '==', clinicId)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPets(data);
    });

    return () => {
      unsubscribeAppts();
      unsubscribeRoles();
      unsubscribePets();
    };
  }, [userData]);

  const handleAddAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClinicId = userData?.clinicId || 'clinica_por_defecto';
    
    if (!newAppt.petName || !newAppt.doctor) {
      alert("Por favor escribe/selecciona un paciente y un doctor.");
      return;
    }

    try {
      let finalPetId = newAppt.petId;
      const existingPet = pets.find(p => p.name.toLowerCase() === newAppt.petName.toLowerCase());
      
      if (existingPet) {
        finalPetId = existingPet.id;
      } else {
        // Crear paciente automáticamente si no existe
        const newPetRef = await addDoc(collection(db, 'pets'), {
          name: newAppt.petName,
          species: 'No especificado',
          breed: 'No especificado',
          age: 'No especificada',
          owner: 'Completar en perfil',
          clinicId: activeClinicId,
          lastVisit: new Date().toLocaleDateString('es-ES')
        });
        finalPetId = newPetRef.id;
      }

      await addDoc(collection(db, 'appointments'), {
        ...newAppt,
        petId: finalPetId,
        clinicId: activeClinicId,
        status: 'Pendiente'
      });
      setShowModal(false);
      setNewAppt({ 
        date: new Date().toISOString().split('T')[0], 
        time: '09:00', 
        petId: '', 
        petName: '', 
        type: 'Consulta General', 
        doctor: '',
        reason: ''
      });
    } catch (error: any) {
      console.error("Error adding appointment:", error);
      alert(`Error al agendar cita: ${error.message}`);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (error) {
      console.error("Error updating status", error);
    }
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    try {
      const d = new Date(`${dateStr}T${timeStr}`);
      return {
        date: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: dateStr, time: timeStr };
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda de Citas</h1>
          <p className="text-gray-500 text-sm mt-1">Control de consultas programadas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#1B4332] text-white px-4 py-2 rounded-xl flex items-center hover:bg-[#2a6b50] transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center text-gray-700 font-semibold">
            <CalendarIcon className="h-5 w-5 mr-2 text-[#1B4332]" />
            <span>Citas Activas ({appointments.filter(a => a.status === 'Pendiente').length})</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {appointments.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No hay citas programadas.</p>
          ) : appointments.map((apt) => {
            const { date, time } = formatDateTime(apt.date, apt.time);
            return (
              <div 
                key={apt.id} 
                className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer gap-4 md:gap-0"
                onClick={() => setViewAppt(apt)}
              >
                <div className="flex items-start md:items-center space-x-4 md:space-x-6">
                  <div className="flex flex-col items-center justify-center min-w-[4rem] border-r border-gray-100 pr-4 md:pr-6 shrink-0">
                    <span className="text-xs text-gray-500 uppercase font-bold">{date}</span>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-[#1B4332] mr-1" />
                      <span className="font-bold text-gray-900">{time}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{apt.petName}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-1">
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#F4845F] mr-2"></span>
                        {apt.type}
                      </span>
                      <span>•</span>
                      <span>{apt.doctor}</span>
                    </div>
                    {apt.reason && (
                      <p className="text-xs text-gray-400 italic">" {apt.reason} "</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-100 md:border-0">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    apt.status === 'Completada' ? 'bg-green-100 text-green-800' :
                    apt.status === 'Cancelada' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {apt.status}
                  </span>

                  {apt.status === 'Pendiente' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'Completada'); }} 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200" 
                        title="Marcar completada"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'Cancelada'); }} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" 
                        title="Cancelar cita"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-xl font-bold text-[#1B4332]">Programar Consulta</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 bg-gray-100 p-2 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleAddAppt} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha</label>
                  <input required type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hora</label>
                  <input required type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Paciente</label>
                <input 
                  list="pets-list"
                  required 
                  value={newAppt.petName} 
                  onChange={e => setNewAppt({...newAppt, petName: e.target.value})} 
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none bg-white"
                  placeholder="Escribe un nombre nuevo o selecciona de la lista..."
                />
                <datalist id="pets-list">
                  {pets.map(p => (
                    <option key={p.id} value={p.name}>{p.name} (Dueño: {p.owner})</option>
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">Si escribes un nombre nuevo, se registrará automáticamente en tu base de pacientes.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Cita</label>
                <select value={newAppt.type} onChange={e => setNewAppt({...newAppt, type: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none bg-white">
                  <option value="Consulta General">Consulta General</option>
                  <option value="Vacunación">Vacunación</option>
                  <option value="Estética">Estética</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Revisión">Revisión de seguimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Doctor Asignado</label>
                <select required value={newAppt.doctor} onChange={e => setNewAppt({...newAppt, doctor: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none bg-white">
                  <option value="">Selecciona quién atenderá...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.name} ({r.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Motivo / Síntomas (Opcional)</label>
                <textarea 
                  placeholder="Ej. El paciente presenta vómito desde hace 2 días..." 
                  value={newAppt.reason} 
                  onChange={e => setNewAppt({...newAppt, reason: e.target.value})} 
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none h-20 resize-none"
                />
              </div>

              <button type="submit" className="w-full bg-[#1B4332] hover:bg-[#2a6b50] text-white p-3.5 rounded-xl font-bold mt-4 transition-colors flex justify-center items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Agendar Cita
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {viewAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 sticky top-0 bg-white z-10 pb-2">
              <div>
                <h2 className="text-xl font-bold text-[#1B4332]">Detalles de la Cita</h2>
                <p className="text-sm text-gray-500 mt-1">Consulta programada</p>
              </div>
              <button onClick={() => setViewAppt(null)} className="text-gray-500 hover:text-gray-800 bg-gray-100 p-2 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Paciente</p>
                <p className="text-lg font-bold text-gray-900">{viewAppt.petName}</p>
                <div className="inline-block mt-2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-[#F4845F] inline-block mr-2"></span>
                  {viewAppt.type}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Fecha y Hora</p>
                  <p className="font-medium text-gray-900">{viewAppt.date}</p>
                  <p className="font-medium text-[#1B4332]">{viewAppt.time}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Doctor Asignado</p>
                  <p className="font-medium text-gray-900">{viewAppt.doctor}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Motivo / Síntomas</p>
                <p className="text-gray-700 whitespace-pre-wrap">{viewAppt.reason || 'Sin detalles especificados.'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <p className="text-xs text-gray-500 uppercase font-bold">Estado Actual</p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  viewAppt.status === 'Completada' ? 'bg-green-100 text-green-800' :
                  viewAppt.status === 'Cancelada' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {viewAppt.status}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button onClick={() => setViewAppt(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-xl font-bold transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
