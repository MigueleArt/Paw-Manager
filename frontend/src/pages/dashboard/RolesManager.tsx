import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, X } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export default function RolesManager() {
  const { userData } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({ name: '', role: 'Veterinario Titular', email: '' });

  useEffect(() => {
    if (!userData?.clinicId) return;

    const q = query(collection(db, 'roles'), where('clinicId', '==', userData.clinicId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRoles(data);
    });
    return () => unsubscribe();
  }, [userData]);

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClinicId = userData?.clinicId || 'clinica_por_defecto';

    try {
      if (editingRole) {
        await updateDoc(doc(db, 'roles', editingRole.id), {
          name: newRole.name,
          role: newRole.role,
          email: newRole.email
        });
        setEditingRole(null);
      } else {
        await addDoc(collection(db, 'roles'), {
          ...newRole,
          clinicId: activeClinicId,
          status: 'Activo'
        });
      }
      setShowModal(false);
      setNewRole({ name: '', role: 'Veterinario Titular', email: '' });
    } catch (error: any) {
      console.error("Error saving role:", error);
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const handleEditClick = (role: any) => {
    setEditingRole(role);
    setNewRole({ name: role.name, role: role.role, email: role.email });
    setShowModal(true);
  };

  const deleteRole = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar a este miembro del personal?")) {
      try {
        await deleteDoc(doc(db, 'roles', id));
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const openNewModal = () => {
    setEditingRole(null);
    setNewRole({ name: '', role: 'Veterinario Titular', email: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal y Roles</h1>
        <button onClick={openNewModal} className="bg-[#1B4332] text-white px-4 py-2 rounded-xl flex items-center hover:bg-[#2a6b50] transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center text-gray-700 font-semibold">
            <Shield className="h-5 w-5 mr-2 text-[#1B4332]" />
            <span>Directorio de Personal ({roles.length})</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {roles.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No hay personal registrado en esta clínica.</p>
          ) : roles.map((person) => (
            <div key={person.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4 md:gap-0">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex-shrink-0 bg-[#E9C46A]/20 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#1B4332]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-4 mt-2 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-0 w-full md:w-auto">
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {person.role}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    person.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {person.status}
                  </span>
                </div>
                <div className="flex space-x-1 shrink-0">
                  <button onClick={() => handleEditClick(person)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200" title="Editar">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => deleteRole(person.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Eliminar">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-xl font-bold">{editingRole ? 'Editar Personal' : 'Añadir Personal'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800"><X /></button>
            </div>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <input required type="text" placeholder="Nombre completo" value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} className="w-full border p-2 rounded-xl" />
              <input required type="email" placeholder="Correo electrónico" value={newRole.email} onChange={e => setNewRole({...newRole, email: e.target.value})} className="w-full border p-2 rounded-xl" />
              <select value={newRole.role} onChange={e => setNewRole({...newRole, role: e.target.value})} className="w-full border p-2 rounded-xl">
                <option value="Veterinario Titular">Veterinario Titular</option>
                <option value="Asistente Veterinario">Asistente Veterinario</option>
                <option value="Recepcionista">Recepcionista</option>
              </select>
              <button type="submit" className="w-full bg-[#1B4332] text-white p-3 rounded-xl font-bold">
                {editingRole ? 'Guardar Cambios' : 'Guardar Personal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
