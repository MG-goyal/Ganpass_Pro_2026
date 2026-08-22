/**
 * GanPass 2026 Unified API Client
 * Direct connection to FastAPI Backend on port 8000
 */

// If your FastAPI routes are prefixed with /api/v1 in backend/app/main.py, ensure this matches:
const API_BASE_URL = 'https://ganpass-backend1.onrender.com/api/v1';
const TOKEN_STORAGE_KEY = 'ganpass_jwt_token';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errData: any = {};
    try {
      errData = await response.json();
    } catch {
      errData = { message: `Request failed with status ${response.status}` };
    }

    const errorObj = errData.error || errData.detail || {
      code: `HTTP_${response.status}`,
      message: errData.message || response.statusText,
    };

    throw errorObj;
  }

  return await response.json();
}

/**
 * Convenience helper matching Axios syntax ({ data: T }) for service callers
 */
export const apiClient = {
  get: async <T = any>(endpoint: string, config?: { params?: Record<string, any> }) => {
    let url = endpoint;
    if (config?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const query = searchParams.toString();
      if (query) {
        url += (url.includes('?') ? '&' : '?') + query;
      }
    }
    const data = await apiRequest<T>(url, { method: 'GET' });
    return { data };
  },

  post: async <T = any>(endpoint: string, body?: any) => {
    const data = await apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },

  put: async <T = any>(endpoint: string, body?: any) => {
    const data = await apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },

  delete: async <T = any>(endpoint: string) => {
    const data = await apiRequest<T>(endpoint, { method: 'DELETE' });
    return { data };
  },
};