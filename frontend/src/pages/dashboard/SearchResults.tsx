import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Phone, User, Dog as DogIcon, ChevronLeft, ChevronRight, RotateCcw, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { searchApi } from '../../lib/api';

type Tab = 'todos' | 'clientes' | 'mascotas' | 'telefonos';

const PAGE_SIZE = 5;

export default function SearchResults() {
  const { userData } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('todos');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function fetchResults() {
      if (!userData?.clinicId || q.trim().length < 2) {
        setClients([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await searchApi.search(userData.clinicId, q);
        if (active) setClients(data.clients || []);
      } catch (err: any) {
        console.error('Error al buscar:', err);
        if (active) setError(err.message || 'Error al buscar');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchResults();
    setTab('todos');
    setPage(1);
    return () => {
      active = false;
    };
  }, [q, userData]);

  const counts = useMemo(() => {
    let clientesCount = 0;
    let mascotasCount = 0;
    let telefonosCount = 0;
    clients.forEach((c: any) => {
      const matchedCliente = c.pets.some((p: any) => p.matchedBy?.includes('cliente'));
      const matchedTelefono = c.pets.some((p: any) => p.matchedBy?.includes('telefono'));
      if (matchedCliente) clientesCount += 1;
      if (matchedTelefono) telefonosCount += 1;
      mascotasCount += c.pets.filter((p: any) => p.matchedBy?.includes('mascota')).length;
    });
    return { clientesCount, mascotasCount, telefonosCount, todos: clients.length };
  }, [clients]);

  const totalPets = useMemo(
    () => clients.reduce((acc: number, c: any) => acc + c.pets.length, 0),
    [clients]
  );

  const filteredClients = useMemo(() => {
    if (tab === 'todos') return clients;
    if (tab === 'clientes') {
      return clients.filter((c: any) => c.pets.some((p: any) => p.matchedBy?.includes('cliente')));
    }
    if (tab === 'telefonos') {
      return clients.filter((c: any) => c.pets.some((p: any) => p.matchedBy?.includes('telefono')));
    }
    if (tab === 'mascotas') {
      return clients
        .map((c: any) => {
          const matchingPets = c.pets.filter((p: any) => p.matchedBy?.includes('mascota'));
          return matchingPets.length ? { ...c, pets: matchingPets } : null;
        })
        .filter(Boolean);
    }
    return clients;
  }, [clients, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const paginatedClients = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const speciesEmoji = (species: string) => {
    if (species === 'Perro') return '🐕';
    if (species === 'Gato') return '🐈';
    return '🐾';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Resultados de búsqueda para: <span className="text-[#1B4332] italic">"{q}"</span>
        </h1>
        <p className="text-gray-500 mt-1">
          {loading
            ? 'Buscando...'
            : `Se encontraron ${counts.todos} clientes y ${totalPets} mascotas vinculadas.`}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'todos', label: `Todos (${counts.todos})` },
            { key: 'clientes', label: `Clientes (${counts.clientesCount})` },
            { key: 'mascotas', label: `Mascotas (${counts.mascotasCount})` },
            { key: 'telefonos', label: `Teléfonos (${counts.telefonosCount})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key as Tab);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setTab('todos');
            setPage(1);
          }}
          className="flex items-center text-sm text-gray-500 hover:text-[#1B4332] transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Limpiar filtros
        </button>
      </div>

      {q.trim().length < 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          Escribe al menos 2 caracteres en la barra de búsqueda para empezar.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">{error}</div>
      )}

      {!loading && q.trim().length >= 2 && filteredClients.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          No se encontraron clientes ni mascotas para "{q}".
        </div>
      )}

      <div className="space-y-6">
        {paginatedClients.map((client: any, idx: number) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-[280px_1fr]"
          >
            {/* Columna del cliente */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
              <div className="h-14 w-14 rounded-xl bg-[#1B4332]/10 flex items-center justify-center mb-4">
                <User className="h-7 w-7 text-[#1B4332]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{client.owner}</h3>
              {client.ownerPhone ? (
                <a
                  href={`tel:${client.ownerPhone}`}
                  className="flex items-center text-sm text-gray-600 mt-2 hover:text-[#1B4332]"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {client.ownerPhone}
                </a>
              ) : (
                <span className="flex items-center text-sm text-gray-400 mt-2">
                  <Phone className="h-4 w-4 mr-2" />
                  Sin teléfono registrado
                </span>
              )}
              <button
                onClick={() => navigate('/dashboard/pets')}
                className="mt-6 w-full border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-[#1B4332] hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Ver perfil de cliente
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>

            {/* Columna de mascotas */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm font-semibold text-gray-700">
                  <DogIcon className="h-4 w-4 mr-2 text-[#1B4332]" />
                  Mascotas vinculadas ({client.pets.length})
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.pets.map((pet: any) => (
                  <div key={pet.id} className="border border-gray-100 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{speciesEmoji(pet.species)}</span>
                      <div>
                        <p className="font-bold text-gray-900">{pet.name}</p>
                        <p className="text-xs text-gray-500">
                          {pet.breed} · {pet.age}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/pets')}
                      className="mt-2 bg-[#1B4332] text-white text-sm font-semibold rounded-lg py-2 hover:bg-[#2a6b50] transition-colors"
                    >
                      Ver ficha
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
          <span>
            Mostrando {paginatedClients.length} de {filteredClients.length} clientes encontrados
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-[#1B4332] text-white font-semibold">{page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}