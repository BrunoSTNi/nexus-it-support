const API_URL = 'http://localhost:3333';

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao realizar login');
  return data;
}

export async function httpGet(endpoint: string) {
  const token = localStorage.getItem('@nexus_token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro na requisição');
  return data;
}

export async function httpPost(endpoint: string, body: any) {
  const token = localStorage.getItem('@nexus_token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro na requisição');
  return data;
}

export async function createTicket(description: string) {
  return httpPost('/api/tickets', { description });
}