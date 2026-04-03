import type { RpaError, JenkinsError, LastErrorDto, PageResponse, UserDto } from '../types/index';

const API_BASE = 'http://localhost:8080';

let accessToken: string | null = localStorage.getItem('token');
let refreshToken: string | null = localStorage.getItem('refreshToken');

function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('token', access);
  localStorage.setItem('refreshToken', refresh);
}

function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

async function refreshAccessToken(): Promise<void> {
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${API_BASE}/auth/refresh?refreshToken=${refreshToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    clearTokens();
    throw new Error('Refresh failed');
  }
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
}

async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(options.headers as Record<string, string>),
};
if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const makeRequest = async (): Promise<Response> => {
    return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  };

  let response = await makeRequest();
  if (response.status === 401) {
    await refreshAccessToken();
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    response = await makeRequest();
  }
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  if (response.status === 204) return null as T;

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null as T; // Возвращаем null, если это не JSON (пустой ответ с кодом 200)
  }

  return response.json();
}

export const auth = {
  login: (username: string, password: string) =>
    api<{ accessToken: string; refreshToken: string; username: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }).then(data => {
      setTokens(data.accessToken, data.refreshToken);
      return data;
    }),
  register: (username: string, password: string) =>
    api<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => {
    if (accessToken) {
      api('/auth/logout', { method: 'POST' }).catch(console.error);
    }
    clearTokens();
  },
};

export const errorsApi = {
  getProjects: () => api<string[]>('/api/errors/projects'),
  getUserProjects: () => api<string[]>('/api/errors/user/projects'),
  saveUserProjects: (projects: string[]) =>
    api('/api/errors/user/projects', {
      method: 'POST',
      body: JSON.stringify(projects),
    }),
  getLastErrors: () => api<LastErrorDto[]>('/api/errors/user/last-errors'),

  getRpaErrors: (params: {
    project?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => {
    const search = new URLSearchParams();
    if (params.project) search.append('project', params.project);
    if (params.from) search.append('from', params.from);
    if (params.to) search.append('to', params.to);
    if (params.page !== undefined) search.append('page', String(params.page));
    if (params.size !== undefined) search.append('size', String(params.size));
    search.append('sort', 'createdAt,desc');
    return api<PageResponse<RpaError>>(`/api/errors/rpa?${search}`);
  },

  getJenkinsErrors: (params: {
    project?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => {
    const search = new URLSearchParams();
    if (params.project) search.append('project', params.project);
    if (params.from) search.append('from', params.from);
    if (params.to) search.append('to', params.to);
    if (params.page !== undefined) search.append('page', String(params.page));
    if (params.size !== undefined) search.append('size', String(params.size));
    search.append('sort', 'createdAt,desc');
    return api<PageResponse<JenkinsError>>(`/api/errors/jenkins?${search}`);
  },

  markRpaRead: (id: number) =>
    api(`/api/errors/rpa/${id}/read`, { method: 'POST' }),
  markJenkinsRead: (id: number) =>
    api(`/api/errors/jenkins/${id}/read`, { method: 'POST' }),
  markAllRpaByProject: (project: string) =>
    api(`/api/errors/rpa/project/${project}/read-all`, { method: 'POST' }),
  markAllJenkinsByProject: (project: string) =>
    api(`/api/errors/jenkins/project/${project}/read-all`, { method: 'POST' }),
};

export const adminApi = {
  getUsers: () => api<UserDto[]>('/admin/users'),
  
  createUser: (data: { username: string; password: string; role: string }) =>
    api<{ message: string }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateUserRole: (id: number, role: string) =>
    api<{ message: string }>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
    
  deleteUser: (id: number) =>
    api<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};

export const getAccessToken = () => accessToken;