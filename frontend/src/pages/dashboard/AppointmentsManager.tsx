import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  CheckCircle,
  XCircle,
  X,
  Pencil,
  Trash2,
  History,
  Info,
} from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

type ApptStatus = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';

interface HistoryEntry {
  text: string;
  timestamp: string;
}

export default function AppointmentsManager() {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [viewAppt, setViewAppt] = useState<any>(null);
  const [editingAppt, setEditingAppt] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [newAppt, setNewAppt] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    petId: '',
    petName: '',
    type: 'Consulta General',
    doctor: '',
    reason: '',
  });

  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    doctor: '',
    reason: '',
    status: 'Pendiente' as ApptStatus,
  });

  useEffect(() => {
    if (!userData?.clinicId) return;
    const clinicId = userData.clinicId;

    const unsubscribeAppts = onSnapshot(query(collection(db, 'appointments'), where('clinicId', '==', clinicId)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
      setAppointments(data);

      // Si el modal de edición está abierto, refresca su copia con los datos más recientes
      setEditingAppt((prev: any) => {
        if (!prev) return prev;
        const updated = data.find((a: any) => a.id === prev.id);
        return updated || prev;
      });
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

      const now = new Date().toISOString();
      await addDoc(collection(db, 'appointments'), {
        ...newAppt,
        petId: finalPetId,
        clinicId: activeClinicId,
        status: 'Pendiente',
        createdAt: now,
        history: [{ text: 'Cita creada por recepción', timestamp: now }],
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
      const appt = appointments.find(a => a.id === id);
      await updateDoc(doc(db, 'appointments', id), {
        status,
        ...(appt
          ? {
              history: arrayUnion({
                text: `Estado cambiado de ${appt.status} a ${status}`,
                timestamp: new Date().toISOString(),
              }),
            }
          : {}),
      });
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

  const formatHistoryTimestamp = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const statusBadgeClasses = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      case 'Confirmada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPetOwner = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.owner || 'Sin registrar';
  };

  const getPetSpeciesEmoji = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    if (pet?.species === 'Perro') return '🐕';
    if (pet?.species === 'Gato') return '🐈';
    return '🐾';
  };

  const openEditModal = (apt: any) => {
    setEditingAppt(apt);
    setEditForm({
      date: apt.date,
      time: apt.time,
      doctor: apt.doctor,
      reason: apt.reason || '',
      status: apt.status,
    });
  };

  const closeEditModal = () => {
    setEditingAppt(null);
  };

  const buildDiffEntries = (original: any, updated: typeof editForm): HistoryEntry[] => {
    const entries: HistoryEntry[] = [];
    const now = new Date().toISOString();

    if (original.date !== updated.date || original.time !== updated.time) {
      entries.push({
        text: `Hora modificada de ${original.time} a ${updated.time}${
          original.date !== updated.date ? ` (fecha: ${updated.date})` : ''
        }`,
        timestamp: now,
      });
    }
    if (original.doctor !== updated.doctor) {
      entries.push({ text: `Veterinario reasignado de ${original.doctor} a ${updated.doctor}`, timestamp: now });
    }
    if ((original.reason || '') !== (updated.reason || '')) {
      entries.push({ text: 'Motivo de consulta actualizado', timestamp: now });
    }
    if (original.status !== updated.status) {
      entries.push({ text: `Estado cambiado de ${original.status} a ${updated.status}`, timestamp: now });
    }
    return entries;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppt) return;
    setSavingEdit(true);
    try {
      const diffEntries = buildDiffEntries(editingAppt, editForm);
      await updateDoc(doc(db, 'appointments', editingAppt.id), {
        date: editForm.date,
        time: editForm.time,
        doctor: editForm.doctor,
        reason: editForm.reason,
        status: editForm.status,
        ...(diffEntries.length > 0 ? { history: arrayUnion(...diffEntries) } : {}),
      });
      closeEditModal();
    } catch (error: any) {
      console.error('Error al actualizar cita:', error);
      alert(`Error al guardar cambios: ${error.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleReprogram = async () => {
    if (!editingAppt) return;
    setSavingEdit(true);
    try {
      const entries: HistoryEntry[] = [];
      if (editingAppt.date !== editForm.date || editingAppt.time !== editForm.time) {
        entries.push({
          text: `Hora modificada de ${editingAppt.time} a ${editForm.time}${
            editingAppt.date !== editForm.date ? ` (fecha: ${editForm.date})` : ''
          }`,
          timestamp: new Date().toISOString(),
        });
      }
      await updateDoc(doc(db, 'appointments', editingAppt.id), {
        date: editForm.date,
        time: editForm.time,
        ...(entries.length > 0 ? { history: arrayUnion(...entries) } : {}),
      });
      closeEditModal();
    } catch (error: any) {
      console.error('Error al reprogramar cita:', error);
      alert(`Error al reprogramar: ${error.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteAppt = async () => {
    if (!editingAppt) return;
    if (!window.confirm('¿Estás seguro de eliminar esta cita? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDoc(doc(db, 'appointments', editingAppt.id));
      closeEditModal();
    } catch (error) {
      console.error('Error al eliminar cita:', error);
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

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-100 md:border-0">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClasses(apt.status)}`}>
                    {apt.status}
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                      title="Editar cita"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>

                    {apt.status === 'Pendiente' && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Appointment Modal */}
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
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClasses(viewAppt.status)}`}>
                  {viewAppt.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setViewAppt(null); openEditModal(viewAppt); }}
                className="flex-1 bg-[#1B4332] hover:bg-[#2a6b50] text-white p-3 rounded-xl font-bold transition-colors flex items-center justify-center"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar Cita
              </button>
              <button onClick={() => setViewAppt(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-xl font-bold transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-[#1B4332]">Editar Cita</h2>
                <p className="text-sm text-gray-500 mt-1">Gestión de cita existente programada</p>
              </div>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-800 bg-gray-100 p-2 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 text-sm">
              {/* Pet + owner card */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl">
                    {getPetSpeciesEmoji(editingAppt.petId)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{editingAppt.petName}</p>
                    <p className="text-xs text-gray-500">{editingAppt.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Propietario</p>
                  <p className="font-semibold text-gray-800 text-sm">{getPetOwner(editingAppt.petId)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Cita</label>
                  <input
                    required
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hora</label>
                  <input
                    required
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Veterinario Asignado</label>
                  <select
                    required
                    value={editForm.doctor}
                    onChange={(e) => setEditForm({ ...editForm, doctor: e.target.value })}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none bg-white"
                  >
                    <option value="">Selecciona...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>{r.name} ({r.role})</option>
                    ))}
                    {editForm.doctor && !roles.some((r) => r.name === editForm.doctor) && (
                      <option value={editForm.doctor}>{editForm.doctor}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Motivo de Consulta</label>
                  <input
                    type="text"
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Estado de la Cita</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { value: 'Pendiente', icon: Clock },
                    { value: 'Confirmada', icon: CheckCircle },
                    { value: 'Cancelada', icon: XCircle },
                    { value: 'Completada', icon: CheckCircle2 },
                  ] as { value: ApptStatus; icon: any }[]).map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, status: value })}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 text-xs font-semibold transition-colors ${
                        editForm.status === value
                          ? 'border-[#E9C46A] bg-[#FEF6E4] text-[#8a6d1d]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#FEF6E4] border border-[#F3E1B3] rounded-xl p-3 flex items-start space-x-2">
                <Info className="h-4 w-4 text-[#8a6d1d] mt-0.5 shrink-0" />
                <p className="text-xs text-[#7a5d15]">
                  Al reprogramar, se conservarán los datos del paciente y solo se actualizará la fecha u hora.
                </p>
              </div>

              {(editingAppt.history?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center text-xs font-bold text-gray-700 uppercase mb-2">
                    <History className="h-4 w-4 mr-1" />
                    Historial de cambios
                  </div>
                  <div className="space-y-3 max-h-32 overflow-y-auto pr-1">
                    {[...editingAppt.history]
                      .sort((a: HistoryEntry, b: HistoryEntry) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((entry: HistoryEntry, idx: number) => (
                        <div key={idx} className="flex space-x-3">
                          <div className="h-2 w-2 rounded-full bg-[#2D6A4F] mt-1.5 shrink-0" />
                          <div>
                            <p className="text-sm text-gray-800">{entry.text}</p>
                            <p className="text-xs text-gray-400">{formatHistoryTimestamp(entry.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDeleteAppt}
                  className="flex items-center text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar Cita
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReprogram}
                    disabled={savingEdit}
                    className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Reprogramar
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="bg-[#1B4332] hover:bg-[#2a6b50] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
                  >
                    {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}