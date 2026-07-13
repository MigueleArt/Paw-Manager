import React, { useEffect, useRef, useState } from 'react';
import { Search, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { clientsApi } from '../lib/api';

export interface SelectedClient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface ClientPickerProps {
  clinicId: string;
  value: SelectedClient | null;
  onChange: (client: SelectedClient) => void;
}

export default function ClientPicker({ clinicId, value, onChange }: ClientPickerProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState<SelectedClient[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' });
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value?.name || '');
  }, [value?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!clinicId || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      clientsApi
        .search(clinicId, query.trim())
        .then((data) => {
          if (active) setResults(data);
        })
        .catch((err) => console.error('Error buscando clientes:', err))
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, clinicId]);

  const handleSelect = (client: SelectedClient) => {
    onChange(client);
    setQuery(client.name);
    setOpen(false);
  };

  const openCreateForm = () => {
    setNewClient({ name: query.trim(), phone: '', email: '', address: '' });
    setShowCreateForm(true);
    setOpen(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    setCreating(true);
    try {
      const created = await clientsApi.create({ ...newClient, clinicId });
      onChange({ id: created.id, name: created.name, phone: created.phone, email: created.email, address: created.address });
      setQuery(created.name);
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Error creando cliente:', err);
      alert(`No se pudo crear el cliente: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (dueño)</label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {value?.id ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value?.id) onChange({ id: '', name: e.target.value }); // se deselecciona hasta volver a elegir
          }}
          onFocus={() => setOpen(true)}
          placeholder="Busca por nombre, teléfono o email..."
          className="w-full border p-3 pl-9 rounded-xl bg-gray-50"
        />
        {loading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {value?.id && (
        <p className="text-xs text-green-700 mt-1 flex items-center">
          <Check className="h-3 w-3 mr-1" />
          Cliente vinculado{value.phone ? ` · ${value.phone}` : ''}
        </p>
      )}

      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {results.length > 0 ? (
            results.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelect(client)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <p className="font-semibold text-sm text-gray-900">{client.name}</p>
                <p className="text-xs text-gray-500">
                  {client.phone || 'Sin teléfono'} {client.email ? `· ${client.email}` : ''}
                </p>
              </button>
            ))
          ) : !loading ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500 mb-2">No se encontró ningún cliente con "{query}".</p>
              <button
                type="button"
                onClick={openCreateForm}
                className="flex items-center text-sm font-semibold text-[#1B4332] hover:text-[#2a6b50]"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Crear cliente nuevo
              </button>
            </div>
          ) : null}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Nuevo cliente</h3>
              <button type="button" onClick={() => setShowCreateForm(false)} className="text-gray-500 hover:text-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <input
                required
                type="text"
                placeholder="Nombre completo"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <input
                type="text"
                placeholder="Dirección (opcional)"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full border p-3 rounded-xl bg-gray-50"
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-[#1B4332] text-white p-3 rounded-xl font-bold hover:bg-[#2a6b50] transition-colors disabled:opacity-60"
              >
                {creating ? 'Guardando...' : 'Guardar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}