// src/lib/api-client.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface ApiEnvelope<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  meta: any;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (err: Error | null, token: string | null = null) => {
  refreshQueue.forEach((cb) => cb(token || ''));
  refreshQueue = [];
};

// Generic fetch wrapper with interceptors
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  const url = `${BASE_URL}${path}`;

  // Read current access token
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Prepare headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized for token refresh
    if (response.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');

      // If we have a refresh token and aren't already hitting refresh endpoint
      if (refreshToken && !path.includes('/auth/refresh/') && !path.includes('/auth/login/')) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            refreshQueue.push((newToken) => {
              headers.set('Authorization', `Bearer ${newToken}`);
              resolve(request<T>(path, options));
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newAccess = refreshData.data?.access || refreshData.access;
            if (newAccess) {
              localStorage.setItem('access_token', newAccess);
              isRefreshing = false;
              processQueue(null, newAccess);

              // Retry request
              headers.set('Authorization', `Bearer ${newAccess}`);
              return request<T>(path, options);
            }
          }
        } catch (refreshErr) {
          console.error('Failed to auto-refresh token:', refreshErr);
        }

        // If refresh fails, log out
        isRefreshing = false;
        processQueue(new Error('Refresh failed'), null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please log in again.');
      }
    }

    // Handle empty response (like 204 No Content)
    if (response.status === 204) {
      return {
        success: true,
        message: 'No content',
        data: null as any,
        errors: null,
        meta: {},
      };
    }

    const payload = await response.json();

    // Standardize envelope if backend responded with raw django-rest-framework details
    // or if the envelope structure is different
    const success = payload.success !== undefined ? payload.success : response.ok;
    const message = payload.message || (response.ok ? 'Success' : 'Request failed');
    const data = payload.data !== undefined ? payload.data : payload;
    const errors = payload.errors !== undefined ? payload.errors : (response.ok ? null : payload);
    const meta = payload.meta || {};

    const envelope: ApiEnvelope<T> = {
      success,
      message,
      data,
      errors,
      meta,
    };

    if (!success) {
      throw new Error(message || 'An error occurred during request.');
    }

    return envelope;
  } catch (error: any) {
    console.error(`API Error [${options.method || 'GET'} ${path}]:`, error);
    throw error;
  }
}

// Expose API client operations
export const apiClient = {
  // 1. System
  health: {
    check: () => request('/api/v1/health/', { method: 'GET' }),
  },

  // 2. Authentication
  auth: {
    register: (body: any) =>
      request('/api/v1/auth/register/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: any) =>
      request('/api/v1/auth/login/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    refresh: (refresh: string) =>
      request('/api/v1/auth/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      }),
    logout: (refresh: string) =>
      request('/api/v1/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      }),
    logoutAll: () =>
      request('/api/v1/auth/logout-all/', {
        method: 'POST',
      }),
    getSessions: () =>
      request<any[]>('/api/v1/auth/sessions/', {
        method: 'GET',
      }),
    revokeSession: (uuid: string) =>
      request(`/api/v1/auth/sessions/${uuid}/`, {
        method: 'DELETE',
      }),
    getPermissions: () =>
      request<any[]>('/api/v1/auth/permissions/', {
        method: 'GET',
      }),
    getRoles: () =>
      request<any[]>('/api/v1/auth/roles/', {
        method: 'GET',
      }),
    createRole: (body: any) =>
      request('/api/v1/auth/roles/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getRole: (uuid: string) =>
      request(`/api/v1/auth/roles/${uuid}/`, {
        method: 'GET',
      }),
    updateRole: (uuid: string, body: any) =>
      request(`/api/v1/auth/roles/${uuid}/`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    deleteRole: (uuid: string) =>
      request(`/api/v1/auth/roles/${uuid}/`, {
        method: 'DELETE',
      }),
  },

  // 3. Organization & Structure
  orgs: {
    getOrganizations: () =>
      request<any[]>('/api/v1/organizations/', {
        method: 'GET',
      }),
    createOrganization: (body: any) =>
      request('/api/v1/organizations/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateOrganization: (uuid: string, body: any) =>
      request(`/api/v1/organizations/${uuid}/`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    getDepartments: () =>
      request<any[]>('/api/v1/departments/', {
        method: 'GET',
      }),
    createDepartment: (name: string) =>
      request('/api/v1/departments/', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    getTeams: () =>
      request<any[]>('/api/v1/teams/', {
        method: 'GET',
      }),
    createTeam: (name: string, department: string) =>
      request('/api/v1/teams/', {
        method: 'POST',
        body: JSON.stringify({ name, department }),
      }),
    getDesignations: () =>
      request<any[]>('/api/v1/designations/', {
        method: 'GET',
      }),
    createDesignation: (name: string) =>
      request('/api/v1/designations/', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
  },

  // 4. Invitation
  invitations: {
    invite: (body: any) =>
      request('/api/v1/invitations/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    accept: (body: any) =>
      request('/api/v1/invitations/accept/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  // 5. Audit Log
  auditLogs: {
    getAuditLogs: () =>
      request<any[]>('/api/v1/audit-logs/', {
        method: 'GET',
      }),
  },

  // 6. Users Profile
  users: {
    getProfile: () =>
      request('/api/v1/users/profile/', {
        method: 'GET',
      }),
    updateProfile: (body: any) =>
      request('/api/v1/users/profile/', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    listUsers: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request(`/api/v1/users/${query}`, {
        method: 'GET',
      });
    },
  },
};
