const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Error ${res.status}`);
  }
  return res.json();
}

export const petsApi = {
  getAll: (clinicId?: string) => {
    const url = clinicId
      ? `${API_URL}/pets?clinicId=${encodeURIComponent(clinicId)}`
      : `${API_URL}/pets`;
    return fetch(url).then(handleResponse);
  },

  create: (pet: Record<string, any>) =>
    fetch(`${API_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet),
    }).then(handleResponse),

  update: (id: string, pet: Record<string, any>) =>
    fetch(`${API_URL}/pets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet),
    }).then(handleResponse),

  remove: (id: string) =>
    fetch(`${API_URL}/pets/${id}`, { method: 'DELETE' }).then(handleResponse),

  getNotes: (petId: string) =>
    fetch(`${API_URL}/pets/${petId}/notes`).then(handleResponse),

  addNote: (petId: string, note: Record<string, any>) =>
    fetch(`${API_URL}/pets/${petId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    }).then(handleResponse),
};