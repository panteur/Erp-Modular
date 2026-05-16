const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  body?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    if (options.body) {
      config.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body.error || (body.errors && body.errors.map((e: any) => e.msg).join(', ')) || `Error ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

export const authAPI = {
  login: (email: string, password: string) => 
    api.post<{ access_token: string; refresh_token: string; user: any }>('/auth/login', { email, password }),
  logout: (refresh_token: string) => api.post('/auth/logout', { refresh_token }),
  refresh: (refresh_token: string) => 
    api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', { refresh_token }),
  me: () => api.get<{ user: any }>('/auth/me'),
  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) => 
    api.post<{ message: string }>('/auth/reset-password', { token, new_password }),
};

export const usersAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ users: any[]; pagination: any }>(`/users${query}`);
  },
  getById: (id: number) => api.get<{ user: any }>(`/users/${id}`),
  create: (data: any) => api.post<{ user: any }>('/users', data),
  update: (id: number, data: any) => api.put<{ user: any }>(`/users/${id}`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/users/${id}`),
  changePassword: (id: number, data: { current_password: string; new_password: string }) => 
    api.put(`/users/${id}/password`, data),
  sendResetPassword: (id: number) => api.post<{ message: string }>(`/users/${id}/send-reset-password`),
};

export const rolesAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ roles: any[]; pagination: any }>(`/roles${query}`);
  },
  getById: (id: number) => api.get<{ role: any }>(`/roles/${id}`),
  create: (data: any) => api.post<{ role: any }>('/roles', data),
  update: (id: number, data: any) => api.put<{ role: any }>(`/roles/${id}`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/roles/${id}`),
};

export const modulesAPI = {
  getAll: () => api.get<{ modules: any[] }>('/modules'),
  getById: (id: number) => api.get<{ module: any }>(`/modules/${id}`),
  toggle: (id: number, is_active?: boolean, company_id?: number) => 
    api.put(`/modules/${id}/toggle`, { is_active, company_id }),
  getByCompany: (companyId: number) => api.get<{ modules: any[] }>(`/modules/company/${companyId}`),
};

export const branchesAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ branches: any[]; pagination: any }>(`/branches${query}`);
  },
  getById: (id: number) => api.get<{ branch: any }>(`/branches/${id}`),
  create: (data: any) => api.post<{ branch: any }>('/branches', data),
  update: (id: number, data: any) => api.put<{ branch: any }>(`/branches/${id}`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/branches/${id}`),
};

export const companyAPI = {
  getById: (id: number) => api.get<{ company: any }>(`/companies/${id}`),
  update: (id: number, data: any) => api.put<{ company: any }>(`/companies/${id}`, data),
  getAll: () => api.get<{ companies: any[] }>('/companies'),
};

export default api;