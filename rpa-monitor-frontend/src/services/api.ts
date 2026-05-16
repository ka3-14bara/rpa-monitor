// api.ts
import type {
  RpaError,
  JenkinsError,
  LastErrorDto,
  PageResponse,
  UserDto,
} from "../types/index";
import type { DashboardDataDto } from "../types";

const API_BASE = "";

/**
 * Базовый метод API с поддержкой автоматического обновления сессии при 401.
 * @param endpoint - путь относительно API_BASE
 * @param options - стандартные fetch-опции
 * @returns Promise с ответом (JSON или null)
 */
async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = (): Promise<Response> =>
    fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include", // ← отправлять и принимать cookies
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    });

  let response = await makeRequest();

  // Если сессия истекла (401), пробуем обновить токены через /auth/refresh
  if (response.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Выполняем повторный запрос
      const retryResponse = await makeRequest();

      // ВАЖНО: Мы должны проверить и вернуть результат ЭТОГО повторного запроса,
      // а не проваливаться в логику обработки старого ответа 401!
      if (!retryResponse.ok) {
        const errorText = await retryResponse.text();
        throw new Error(errorText || retryResponse.statusText);
      }
      if (retryResponse.status === 204) return null as T;

      const contentType = retryResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return null as T;
      }
      return retryResponse.json(); // Возвращаем данные повторного успешного запроса /me
    } else {
      // Не удалось обновить – выбрасываем ошибку
      throw new Error("Unauthorized");
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  if (response.status === 204) return null as T;

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null as T;
  }

  return response.json();
}

// ==================== Аутентификация ====================

export const auth = {
  login: (username: string, password: string) =>
    api<void>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    api<void>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    api<void>("/auth/logout", { method: "POST" }).catch(console.error),
};

/** Получение текущего пользователя по cookie (access_token) */
export async function getCurrentUser(): Promise<{ username: string } | null> {
  try {
    return await api<{ username: string }>("/auth/me");
  } catch {
    return null;
  }
}

// ==================== Ошибки (RPA / Jenkins) ====================

export const errorsApi = {
  getProjects: () => api<string[]>("/api/errors/projects"),
  getUserProjects: () => api<string[]>("/api/errors/user/projects"),
  saveUserProjects: (projects: string[]) =>
    api("/api/errors/user/projects", {
      method: "POST",
      body: JSON.stringify(projects),
    }),
  getLastErrors: () => api<LastErrorDto[]>("/api/errors/user/last-errors"),

  getRpaErrors: (params: {
    project?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => {
    const search = new URLSearchParams();
    if (params.project) search.append("project", params.project);
    if (params.from) search.append("from", params.from);
    if (params.to) search.append("to", params.to);
    if (params.page !== undefined) search.append("page", String(params.page));
    if (params.size !== undefined) search.append("size", String(params.size));
    search.append("sort", "createdAt,desc");
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
    if (params.project) search.append("project", params.project);
    if (params.from) search.append("from", params.from);
    if (params.to) search.append("to", params.to);
    if (params.page !== undefined) search.append("page", String(params.page));
    if (params.size !== undefined) search.append("size", String(params.size));
    search.append("sort", "createdAt,desc");
    return api<PageResponse<JenkinsError>>(`/api/errors/jenkins?${search}`);
  },

  markRpaRead: (id: number) =>
    api(`/api/errors/rpa/${id}/read`, { method: "POST" }),
  markJenkinsRead: (id: number) =>
    api(`/api/errors/jenkins/${id}/read`, { method: "POST" }),
  markAllRpaByProject: (project: string) =>
    api(`/api/errors/rpa/project/${project}/read-all`, { method: "POST" }),
  markAllJenkinsByProject: (project: string) =>
    api(`/api/errors/jenkins/project/${project}/read-all`, { method: "POST" }),
};

// ==================== Администрирование ====================

export const adminApi = {
  getUsers: () => api<UserDto[]>("/admin/users"),

  createUser: (data: { username: string; password: string; role: string }) =>
    api<{ message: string }>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateUserRole: (id: number, role: string) =>
    api<{ message: string }>(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id: number) =>
    api<{ message: string }>(`/admin/users/${id}`, {
      method: "DELETE",
    }),
};

// ==================== Дашборд и экспорт Excel ====================

export const dashboardApi = {
  getData: (params: { projects: string[]; from: string; to: string }) => {
    const search = new URLSearchParams();
    params.projects.forEach((p) => search.append("projects", p));
    search.append("from", params.from);
    search.append("to", params.to);
    return api<DashboardDataDto>(`/api/dashboard/data?${search}`);
  },

  exportExcel: async (params: {
    projects: string[];
    from: string;
    to: string;
  }) => {
    const search = new URLSearchParams();
    params.projects.forEach((p) => search.append("projects", p));
    search.append("from", params.from);
    search.append("to", params.to);

    const res = await fetch(`${API_BASE}/api/dashboard/export?${search}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Ошибка формирования отчета");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
