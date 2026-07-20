import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  CheckCircle,
  Pencil,
  Trash2,
  History,
  Info,
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  LayoutGrid,
  Filter,
  User,
  BadgeCheck,
  ChevronDown,
  Check,
  Users,
} from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const ROW_HEIGHT = 72; // px per hour row in the calendar grid
const START_HOUR = 8; // 08:00
const END_HOUR = 20; // 20:00 (exclusive of the last drawn row start)
const DEFAULT_DURATION_MIN = 45;

const APPOINTMENT_TYPES = ['Consulta General', 'Vacunación', 'Estética', 'Cirugía', 'Revisión'];

const STATUS_META: Record<string, { short: string; badge: string; card: string; dot: string }> = {
  Pendiente: {
    short: 'PEND',
    badge: 'bg-[#E9C46A] text-[#1B4332]',
    card: 'bg-[#FBF1D9] border border-[#E9C46A] text-[#7a5c14]',
    dot: 'bg-[#E9C46A]',
  },
  Confirmada: {
    short: 'CONF',
    badge: 'bg-blue-500 text-white',
    card: 'bg-blue-50 border border-blue-400 text-blue-900',
    dot: 'bg-blue-500',
  },
  Completada: {
    short: 'COMPL',
    badge: 'bg-[#1B4332] text-white',
    card: 'bg-[#1B4332]/10 border border-[#1B4332]/40 text-[#1B4332]',
    dot: 'bg-[#1B4332]',
  },
  Cancelada: {
    short: 'CANC',
    badge: 'bg-red-500 text-white',
    card: 'bg-red-50 border border-red-400 text-red-900',
    dot: 'bg-red-500',
  },
};

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getWeekDays = (monday: Date) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

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

  // Calendar view state
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [periodMode, setPeriodMode] = useState<'day' | 'week'>('week');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set(APPOINTMENT_TYPES));

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target as Node)) {
        setDoctorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    setLoading(true);
    setErrorMessage('');

    const activeClinicId = userData?.clinicId || 'clinica_por_defecto';

    if (!newAppt.petName || !newAppt.doctor) {
      setErrorMessage("Por favor escribe/selecciona un paciente y un doctor.");
      setLoading(false);
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
      setErrorMessage(`Error al agendar cita: ${error.message}`);
    } finally {
      setLoading(false);
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

  // ------------------------------------------------------------------
  // Calendar derived data
  // ------------------------------------------------------------------

  const weekDays = useMemo(() => getWeekDays(getMonday(anchorDate)), [anchorDate]);
  const daysToRender = periodMode === 'week' ? weekDays : [anchorDate];
  const today = new Date();

  const doctorNames = useMemo(() => {
    const names = new Set<string>();
    roles.forEach(r => { if (r.name) names.add(r.name); });
    appointments.forEach(a => { if (a.doctor) names.add(a.doctor); });
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'es'));
  }, [roles, appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (doctorFilter !== 'all' && a.doctor !== doctorFilter) return false;
      if (typeFilter.size > 0 && a.type && !typeFilter.has(a.type)) return false;
      return true;
    });
  }, [appointments, doctorFilter, typeFilter]);

  const getApptsForDay = (day: Date) => {
    const key = toDateKey(day);
    return filteredAppointments.filter(a => a.date === key);
  };

  const rangeLabel = useMemo(() => {
    if (periodMode === 'day') {
      return capitalize(anchorDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = capitalize(start.toLocaleDateString('es-ES', { month: 'long' }));
    const endMonth = capitalize(end.toLocaleDateString('es-ES', { month: 'long' }));
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} – ${end.getDate()} de ${startMonth}, ${end.getFullYear()}`;
    }
    return `${start.getDate()} de ${startMonth} – ${end.getDate()} de ${endMonth}, ${end.getFullYear()}`;
  }, [periodMode, anchorDate, weekDays]);

  const goPrev = () => {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() - (periodMode === 'week' ? 7 : 1));
    setAnchorDate(d);
  };
  const goNext = () => {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + (periodMode === 'week' ? 7 : 1));
    setAnchorDate(d);
  };
  const goToday = () => setAnchorDate(new Date());

  const openNewApptAt = (day: Date, hour: number) => {
    setNewAppt({
      ...newAppt,
      date: toDateKey(day),
      time: `${String(hour).padStart(2, '0')}:00`,
    });
    setErrorMessage('');
    setShowModal(true);
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Agenda</h1>
          <p className="text-gray-500 text-sm mt-1">Visualiza los horarios ocupados por día, semana y veterinario.</p>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Calendario / Lista toggle */}
            <div className="flex items-center border border-gray-200 rounded-full p-1 bg-white">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-gray-100 text-[#1B4332]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="h-4 w-4 mr-1.5" /> Calendario
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-gray-100 text-[#1B4332]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListIcon className="h-4 w-4 mr-1.5" /> Lista
              </button>
            </div>

            {/* Día / Semana toggle (only relevant in calendar mode) */}
            {viewMode === 'calendar' && (
              <div className="flex items-center border border-gray-200 rounded-full p-1 bg-white">
                <button
                  onClick={() => setPeriodMode('day')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    periodMode === 'day' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Día
                </button>
                <button
                  onClick={() => setPeriodMode('week')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    periodMode === 'week' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Semana
                </button>
              </div>
            )}
          </div>

          <button onClick={() => { setErrorMessage(''); setShowModal(true); }} className="bg-[#1B4332] text-white px-4 py-2 rounded-xl flex items-center hover:bg-[#2a6b50] transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Navigation bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50/50">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={goToday} className="text-sm font-bold text-gray-700 hover:text-[#1B4332] transition-colors">
                Hoy
              </button>
              <div className="flex items-center">
                <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors" title="Anterior">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={goNext} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors" title="Siguiente">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-800">{rangeLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={doctorDropdownRef}>
                <button
                  onClick={() => setDoctorDropdownOpen(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                    {doctorFilter === 'all'
                      ? <Users className="h-3.5 w-3.5" />
                      : <span className="text-[10px] font-bold uppercase text-[#1B4332]">{doctorFilter.replace(/^Dr\.?a?\.?\s*/i, '').charAt(0)}</span>}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 truncate max-w-[140px]">
                    {doctorFilter === 'all' ? 'Todos los doctores' : doctorFilter}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${doctorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {doctorDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30 max-h-72 overflow-y-auto">
                    <button
                      onClick={() => { setDoctorFilter('all'); setDoctorDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${doctorFilter === 'all' ? 'text-[#1B4332] font-bold' : 'text-gray-700'}`}
                    >
                      Todos los doctores
                      {doctorFilter === 'all' && <Check className="h-4 w-4" />}
                    </button>
                    <div className="border-t border-gray-50 my-1" />
                    {doctorNames.length === 0 ? (
                      <p className="px-4 py-2 text-xs text-gray-400">Aún no hay personal registrado en "Personal".</p>
                    ) : doctorNames.map(name => (
                      <button
                        key={name}
                        onClick={() => { setDoctorFilter(name); setDoctorDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-2 ${doctorFilter === name ? 'text-[#1B4332] font-bold' : 'text-gray-700'}`}
                      >
                        <span className="truncate">{name}</span>
                        {doctorFilter === name && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowTypeFilter(v => !v)}
                  className={`p-2.5 rounded-xl border transition-colors ${showTypeFilter ? 'bg-[#1B4332] border-[#1B4332] text-white' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'}`}
                  title="Filtrar por tipo de cita"
                >
                  <Filter className="h-4 w-4" />
                </button>
                {showTypeFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-30">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Tipo de cita</p>
                    <div className="space-y-1.5">
                      {APPOINTMENT_TYPES.map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={typeFilter.has(type)}
                            onChange={() => toggleTypeFilter(type)}
                            className="rounded border-gray-300 text-[#1B4332] focus:ring-[#1B4332]"
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: daysToRender.length * 140 + 70 }}>
              {/* Day headers */}
              <div className="grid sticky top-0 bg-white z-10" style={{ gridTemplateColumns: `70px repeat(${daysToRender.length}, 1fr)` }}>
                <div className="p-3 text-xs font-bold text-gray-400 uppercase border-b border-r border-gray-100">Hora</div>
                {daysToRender.map((d, i) => {
                  const todayCol = isSameDay(d, today);
                  return (
                    <div key={i} className={`p-3 text-center border-b border-gray-100 ${todayCol ? 'bg-[#1B4332]/5' : ''}`}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        {d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                      </p>
                      <p className={`text-lg font-bold ${todayCol ? 'text-[#1B4332]' : 'text-gray-800'}`}>{d.getDate()}</p>
                      {todayCol && <span className="block mx-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-[#1B4332]" />}
                    </div>
                  );
                })}
              </div>

              {/* Body: hour column + day columns */}
              <div className="grid max-h-[640px] overflow-y-auto" style={{ gridTemplateColumns: `70px repeat(${daysToRender.length}, 1fr)` }}>
                {/* Hour labels */}
                <div className="border-r border-gray-100">
                  {HOURS.map(h => (
                    <div key={h} style={{ height: ROW_HEIGHT }} className="text-xs text-gray-400 font-semibold px-2 pt-1 border-b border-gray-100">
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {daysToRender.map((day, di) => {
                  const dayAppts = getApptsForDay(day);
                  const todayCol = isSameDay(day, today);
                  return (
                    <div
                      key={di}
                      className={`relative border-r border-gray-100 last:border-r-0 ${todayCol ? 'bg-[#1B4332]/[0.02]' : ''}`}
                      style={{ height: ROW_HEIGHT * HOURS.length }}
                    >
                      {HOURS.map((h, hi) => (
                        <div
                          key={hi}
                          onClick={() => openNewApptAt(day, h)}
                          className="absolute left-0 right-0 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ top: hi * ROW_HEIGHT, height: ROW_HEIGHT }}
                          title="Agendar nueva cita"
                        />
                      ))}

                      {dayAppts.map(apt => {
                        const [hh, mm] = (apt.time || '00:00').split(':').map(Number);
                        const minutesFromStart = (hh - START_HOUR) * 60 + (mm || 0);
                        const top = (minutesFromStart / 60) * ROW_HEIGHT;
                        const height = Math.max((DEFAULT_DURATION_MIN / 60) * ROW_HEIGHT, 44);
                        const meta = STATUS_META[apt.status] || STATUS_META.Pendiente;

                        if (hh < START_HOUR || hh >= END_HOUR) return null;

                        return (
                          <div
                            key={apt.id}
                            onClick={(e) => { e.stopPropagation(); setViewAppt(apt); }}
                            className={`absolute rounded-lg px-2 py-1.5 cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-shadow ${meta.card}`}
                            style={{ top, height, left: 4, right: 4 }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate">{apt.petName}</span>
                              <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${meta.badge}`}>
                                {meta.short}
                              </span>
                            </div>
                            <p className="text-[10px] truncate opacity-80">{apt.type}</p>
                            {height > 56 && (
                              <p className="text-[10px] truncate opacity-70 flex items-center gap-1 mt-0.5">
                                <User className="h-2.5 w-2.5" /> {apt.doctor}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-100 flex flex-wrap items-center gap-4 bg-gray-50/50">
            {Object.entries(STATUS_META).map(([status, meta]) => (
              <div key={status} className="flex items-center text-xs text-gray-600">
                <span className={`h-2.5 w-2.5 rounded-full mr-1.5 ${meta.dot}`} />
                {status}
              </div>
            ))}
          </div>
        </div>
      ) : (
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
              const meta = STATUS_META[apt.status] || STATUS_META.Pendiente;
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
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${meta.badge}`}>
                      {apt.status}
                    </span>

                    {(apt.status === 'Pendiente' || apt.status === 'Confirmada') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                          title="Editar cita"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>

                        {apt.status === 'Pendiente' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'Confirmada'); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            title="Confirmar cita"
                          >
                            <BadgeCheck className="h-5 w-5" />
                          </button>
                        )}
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
      )}

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
                  {APPOINTMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B4332] hover:bg-[#2a6b50] disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3.5 rounded-xl font-bold mt-4 transition-colors flex justify-center items-center"
              >
                <CalendarIcon className="w-5 h-5 mr-2" />
                {loading ? 'Guardando...' : 'Agendar Cita'}
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
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${(STATUS_META[viewAppt.status] || STATUS_META.Pendiente).badge}`}>
                  {viewAppt.status}
                </span>
              </div>

              {(viewAppt.status === 'Pendiente' || viewAppt.status === 'Confirmada') && (
                <div className="flex gap-2 pt-1">
                  {viewAppt.status === 'Pendiente' && (
                    <button
                      onClick={() => { updateStatus(viewAppt.id, 'Confirmada'); setViewAppt({ ...viewAppt, status: 'Confirmada' }); }}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 p-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                    >
                      <BadgeCheck className="h-4 w-4 mr-1.5" /> Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => { updateStatus(viewAppt.id, 'Completada'); setViewAppt({ ...viewAppt, status: 'Completada' }); }}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 p-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Completar
                  </button>
                  <button
                    onClick={() => { updateStatus(viewAppt.id, 'Cancelada'); setViewAppt({ ...viewAppt, status: 'Cancelada' }); }}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 p-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" /> Cancelar
                  </button>
                </div>
              )}
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