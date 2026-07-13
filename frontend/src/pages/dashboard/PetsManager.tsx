import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, FileText, X, Trash2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { petsApi } from '../../lib/api';
import ClientPicker, { SelectedClient } from '../../components/ClientPicker';

export default function PetsManager() {
  const { user, userData } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [editingPet, setEditingPet] = useState<any>(null);
  const [activePet, setActivePet] = useState<any>(null);

  const [newPet, setNewPet] = useState({ name: '', species: 'Perro', breed: '', age: '' });
  const [selectedClient, setSelectedClient] = useState<SelectedClient | null>(null);

  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);

  const fetchPets = async () => {
    if (!userData?.clinicId) return;
    try {
      setLoading(true);
      const petsData = await petsApi.getAll(userData.clinicId);
      setPets(petsData);
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const fetchNotes = async (petId: string) => {
    try {
      const notesData = await petsApi.getNotes(petId);
      setNotes(notesData);
    } catch (error) {
      console.error('Error al obtener historial:', error);
    }
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClinicId = userData?.clinicId || 'clinica_por_defecto';

    if (!selectedClient?.id) {
      alert('Selecciona un cliente existente o crea uno nuevo antes de guardar el paciente.');
      return;
    }

    try {
      if (editingPet) {
        await petsApi.update(editingPet.id, {
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed,
          age: newPet.age,
          clientId: selectedClient.id,
        });
      } else {
        await petsApi.create({
          ...newPet,
          clientId: selectedClient.id,
          clinicId: activeClinicId,
        });
      }
      setShowModal(false);
      setEditingPet(null);
      setNewPet({ name: '', species: 'Perro', breed: '', age: '' });
      setSelectedClient(null);
      await fetchPets();
    } catch (error: any) {
      console.error('Error saving pet:', error);
      alert(`Error al guardar paciente: ${error.message}`);
    }
  };

  const handleEditClick = (pet: any) => {
    setEditingPet(pet);
    setNewPet({ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age });
    setSelectedClient(
      pet.clientId ? { id: pet.clientId, name: pet.owner, phone: pet.ownerPhone } : null
    );
    setShowModal(true);
  };

  const openNewPetModal = () => {
    setEditingPet(null);
    setNewPet({ name: '', species: 'Perro', breed: '', age: '' });
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleDeletePet = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar a este paciente?')) {
      try {
        await petsApi.remove(id);
        await fetchPets();
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !activePet || !userData?.clinicId) return;

    try {
      await petsApi.addNote(activePet.id, {
        text: newNote,
        doctor: userData?.name || user?.email?.split('@')[0] || 'Admin',
        clinicId: userData?.clinicId,
      });
      setNewNote('');
      await fetchNotes(activePet.id);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const openHistory = (pet: any) => {
    setActivePet(pet);
    setShowHistoryModal(true);
    fetchNotes(pet.id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Directorio de Pacientes</h1>
        <button onClick={openNewPetModal} className="bg-[#1B4332] text-white px-4 py-2 rounded-xl flex items-center hover:bg-[#2a6b50] transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paciente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] sm:text-sm"
            placeholder="Buscar por nombre de mascota, dueño o especie..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Cargando pacientes...</p>
        ) : pets.length === 0 ? (
          <p className="text-gray-500">No hay pacientes registrados aún.</p>
        ) : pets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative">
            <button
              onClick={() => handleDeletePet(pet.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar paciente"
            >
              <Trash2 className="h-5 w-5" />
            </button>

            <div className="flex justify-between items-start mb-4 pr-8">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">
                  {pet.species === 'Perro' ? '🐕' : '🐈'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                  <p className="text-xs text-gray-500">{pet.breed} • {pet.age}</p>
                </div>
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {pet.species}
              </span>
            </div>

            <div className="border-t border-gray-50 pt-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Dueño:</span>
                <span className="font-medium text-gray-900">{pet.owner}</span>
              </div>
              {pet.ownerPhone && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="font-medium text-gray-900">{pet.ownerPhone}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Última visita:</span>
                <span className="font-medium text-gray-900">{pet.lastVisit}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => openHistory(pet)}
                className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-blue-100 transition-colors"
              >
                <FileText className="h-4 w-4 mr-1" />
                Historial
              </button>
              <button
                onClick={() => handleEditClick(pet)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                Perfil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pet Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-xl font-bold">{editingPet ? 'Editar Perfil del Paciente' : 'Añadir Paciente'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800"><X /></button>
            </div>
            <form onSubmit={handleSavePet} className="space-y-4">
              <input required type="text" placeholder="Nombre de la Mascota" value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} className="w-full border p-3 rounded-xl bg-gray-50" />
              <select value={newPet.species} onChange={e => setNewPet({...newPet, species: e.target.value})} className="w-full border p-3 rounded-xl bg-gray-50">
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Exótico">Exótico</option>
              </select>
              <input required type="text" placeholder="Raza" value={newPet.breed} onChange={e => setNewPet({...newPet, breed: e.target.value})} className="w-full border p-3 rounded-xl bg-gray-50" />
              <input required type="number" min="0" max="50" placeholder="Edad (años)" value={newPet.age} onChange={e => setNewPet({...newPet, age: e.target.value})} className="w-full border p-3 rounded-xl bg-gray-50" />

              <ClientPicker
                clinicId={userData?.clinicId || ''}
                value={selectedClient}
                onChange={setSelectedClient}
              />

              <button type="submit" className="w-full bg-[#1B4332] text-white p-3 rounded-xl font-bold mt-2 hover:bg-[#2a6b50] transition-colors">
                {editingPet ? 'Guardar Cambios' : 'Registrar Paciente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Clinical History Modal */}
      {showHistoryModal && activePet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-[#1B4332]">Expediente Clínico</h2>
                <p className="text-gray-500">Paciente: <span className="font-semibold text-gray-900">{activePet.name}</span> ({activePet.owner})</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-gray-800 bg-gray-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {notes.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay notas médicas registradas en este expediente.</p>
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-[#2D6A4F]">{note.doctor}</span>
                      <span className="text-xs text-gray-500">{new Date(note.timestamp).toLocaleString('es-ES')}</span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-2xl">
              <form onSubmit={handleAddNote} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Agregar nueva nota médica, diagnóstico o receta..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="flex-1 border border-gray-200 p-3 rounded-xl bg-gray-50 focus:outline-none focus:border-[#1B4332]"
                />
                <button type="submit" disabled={!newNote.trim()} className="bg-[#1B4332] text-white p-3 rounded-xl hover:bg-[#2a6b50] transition-colors disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}