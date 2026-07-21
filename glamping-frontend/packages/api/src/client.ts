const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('glamp-token');
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const deviceToken = localStorage.getItem('glamp-device-token');
    if (deviceToken) headers["X-Device-Token"] = deviceToken;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

export async function apiDelete(path: string): Promise<void> {
  let response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (response.status === 401) {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  }
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
}
