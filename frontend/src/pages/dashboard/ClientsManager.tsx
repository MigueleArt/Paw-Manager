import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, X, Trash2, Contact as ContactIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clientsApi } from '../../lib/api';

export default function ClientsManager() {
  const { userData } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    sucursal: '',
  });

  const fetchClients = async () => {
    if (!userData?.clinicId) return;
    try {
      setLoading(true);
      const data = await clientsApi.getAll(userData.clinicId);
      setClients(data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const openNewClientModal = () => {
    setEditingClient(null);
    setNewClient({ name: '', phone: '', email: '', address: '', sucursal: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleEditClick = (client: any) => {
    setEditingClient(client);
    setNewClient({
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      sucursal: client.sucursal || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const activeClinicId = userData?.clinicId || 'clinica_por_defecto';

    try {
      setSaving(true);

      // Validación de duplicados (excluye al propio cliente si se está editando)
      const { phoneExists, emailExists } = await clientsApi.checkDuplicate(
        newClient.phone,
        newClient.email,
        activeClinicId
      );

      const isDuplicatePhone =
        phoneExists &&
        !(editingClient && editingClient.phone === newClient.phone);
      const isDuplicateEmail =
        emailExists &&
        !(editingClient && editingClient.email === newClient.email);

      if (isDuplicatePhone) {
        setFormError('Ya existe un cliente registrado con ese teléfono.');
        setSaving(false);
        return;
      }
      if (isDuplicateEmail) {
        setFormError('Ya existe un cliente registrado con ese correo electrónico.');
        setSaving(false);
        return;
      }

      if (editingClient) {
        await clientsApi.update(editingClient.id, { ...newClient });
      } else {
        await clientsApi.create({ ...newClient, clinicId: activeClinicId });
      }

      setShowModal(false);
      setEditingClient(null);
      setNewClient({ name: '', phone: '', email: '', address: '', sucursal: '' });
      await fetchClients();
    } catch (error: any) {
      console.error('Error saving client:', error);
      setFormError(`Error al guardar cliente: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar a este cliente?')) {
      try {
        await clientsApi.remove(id);
        await fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const filteredClients = clients.filter((c) =>
    [c.name, c.phone, c.email].some((field) =>
      (field || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Directorio de Clientes</h1>
        <button
          onClick={openNewClientModal}
          className="bg-[#1B4332] text-white px-4 py-2 rounded-xl flex items-center hover:bg-[#2a6b50] transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] sm:text-sm"
            placeholder="Buscar por nombre, teléfono o correo..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Cargando clientes...</p>
        ) : filteredClients.length === 0 ? (
          <p className="text-gray-500">No hay clientes registrados aún.</p>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative"
            >
              <button
                onClick={() => handleDeleteClient(client.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar cliente"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4 pr-8">
                <div className="h-10 w-10 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center">
                  <ContactIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                  {client.sucursal && (
                    <p className="text-xs text-gray-500">Sucursal: {client.sucursal}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-50 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="font-medium text-gray-900">{client.phone || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Correo:</span>
                  <span className="font-medium text-gray-900">{client.email || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dirección:</span>
                  <span className="font-medium text-gray-900 text-right">{client.address || '—'}</span>
                </div>
              </div>

              <button
                onClick={() => handleEditClick(client)}
                className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver / Editar Perfil
              </button>
            </div>
          ))
        )}
      </div>

      {/* Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
              <h2 className="text-xl font-bold">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">
                <X />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-4">
              <input
                required
                type="text"
                placeholder="Nombre completo"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <input
                required
                type="tel"
                placeholder="Teléfono"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <input
                type="text"
                placeholder="Dirección"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <input
                type="text"
                placeholder="Sucursal (opcional)"
                value={newClient.sucursal}
                onChange={(e) => setNewClient({ ...newClient, sucursal: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#1B4332] text-white p-3 rounded-xl font-bold mt-2 hover:bg-[#2a6b50] transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}