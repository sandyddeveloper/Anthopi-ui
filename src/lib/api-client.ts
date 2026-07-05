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

    let payload: any = null;
    try {
      payload = await response.json();
    } catch (e) {
      // Empty or non-JSON body response (e.g. status 500 HTML pages)
    }

    // Standardize envelope if backend responded with raw django-rest-framework details
    // or if the envelope structure is different
    const success = (payload && payload.success !== undefined) ? payload.success : response.ok;
    
    // Extract actual descriptive error message from errors object if it exists
    let extractedMessage = payload && payload.message;
    const errors = (payload && payload.errors !== undefined) ? payload.errors : (response.ok ? null : payload);

    if (!success && (!extractedMessage || extractedMessage === "Error occurred" || extractedMessage === "Request failed")) {
      const errPayload = errors || payload;
      if (errPayload) {
        if (typeof errPayload === 'string') {
          extractedMessage = errPayload;
        } else if (typeof errPayload === 'object') {
          if (errPayload.detail) {
            extractedMessage = String(errPayload.detail);
          } else if (errPayload.message) {
            extractedMessage = String(errPayload.message);
          } else if (errPayload.non_field_errors) {
            extractedMessage = Array.isArray(errPayload.non_field_errors)
              ? errPayload.non_field_errors.join(' ')
              : String(errPayload.non_field_errors);
          } else {
            // Check for field level validation errors (e.g. password: ["This field may not be blank."])
            const fieldErrors: string[] = [];
            for (const key in errPayload) {
              if (Array.isArray(errPayload[key])) {
                fieldErrors.push(`${key}: ${errPayload[key].join(' ')}`);
              } else if (typeof errPayload[key] === 'string') {
                fieldErrors.push(`${key}: ${errPayload[key]}`);
              }
            }
            if (fieldErrors.length > 0) {
              extractedMessage = fieldErrors.join(' | ');
            }
          }
        }
      }
    }

    const message = extractedMessage || (response.ok ? 'Success' : 'Request failed');
    const data = (payload && payload.data !== undefined) ? payload.data : payload;
    const meta = (payload && payload.meta) || {};

    const envelope: ApiEnvelope<T> = {
      success,
      message,
      data,
      errors,
      meta,
    };

    if (!success) {
      const apiError = new Error(message);
      (apiError as any).isApiError = true;
      throw apiError;
    }

    return envelope;
  } catch (error: any) {
    if (!error.isApiError) {
      console.error(`API Error [${options.method || 'GET'} ${path}]:`, error);
    }
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
    activateEmployee: (uuid: string) =>
      request(`/api/v1/employees/${uuid}/activate/`, { method: 'POST' }),
    deactivateEmployee: (uuid: string) =>
      request(`/api/v1/employees/${uuid}/deactivate/`, { method: 'POST' }),
    updateEmployee: (uuid: string, body: any) =>
      request(`/api/v1/employees/${uuid}/`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteEmployee: (uuid: string) =>
      request(`/api/v1/employees/${uuid}/`, { method: 'DELETE' }),
  },

  // 7. Projects
  projects: {
    listProjects: (params?: { priority?: string; status?: string; manager?: string; search?: string }) => {
      let query = '';
      if (params) {
        const parts = [];
        if (params.priority) parts.push(`priority=${encodeURIComponent(params.priority)}`);
        if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`);
        if (params.manager) parts.push(`manager=${encodeURIComponent(params.manager)}`);
        if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
        if (parts.length > 0) query = `?${parts.join('&')}`;
      }
      return request<any[]>(`/api/v1/projects/${query}`, { method: 'GET' });
    },
    createProject: (body: any) =>
      request('/api/v1/projects/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getProject: (uuid: string) =>
      request(`/api/v1/projects/${uuid}/`, { method: 'GET' }),
    updateProject: (uuid: string, body: any) =>
      request(`/api/v1/projects/${uuid}/`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    deleteProject: (uuid: string) =>
      request(`/api/v1/projects/${uuid}/`, { method: 'DELETE' }),
    archiveProject: (uuid: string) =>
      request(`/api/v1/projects/${uuid}/archive/`, { method: 'POST' }),
    restoreProject: (uuid: string) =>
      request(`/api/v1/projects/${uuid}/restore/`, { method: 'POST' }),
    listMembers: (projectId: string) =>
      request<any[]>(`/api/v1/projects/${projectId}/members/`, { method: 'GET' }),
    addMember: (projectId: string, body: any) =>
      request(`/api/v1/projects/${projectId}/members/`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteMember: (memberId: string) =>
      request(`/api/v1/projects/members/${memberId}/`, { method: 'DELETE' }),
  },

  // 8. Folders & Files
  knowledge: {
    getFolders: (parentFolder?: string) => {
      const query = parentFolder ? `?parent_folder=${encodeURIComponent(parentFolder)}` : '';
      return request<any[]>(`/api/v1/folders/${query}`, { method: 'GET' });
    },
    createFolder: (body: any) =>
      request('/api/v1/folders/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getFolder: (uuid: string) =>
      request(`/api/v1/folders/${uuid}/`, { method: 'GET' }),
    updateFolder: (uuid: string, body: any) =>
      request(`/api/v1/folders/${uuid}/`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    deleteFolder: (uuid: string) =>
      request(`/api/v1/folders/${uuid}/`, { method: 'DELETE' }),
    getFiles: (params?: { folder?: string; project?: string; search?: string }) => {
      let query = '';
      if (params) {
        const parts = [];
        if (params.folder) parts.push(`folder=${encodeURIComponent(params.folder)}`);
        if (params.project) parts.push(`project=${encodeURIComponent(params.project)}`);
        if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
        if (parts.length > 0) query = `?${parts.join('&')}`;
      }
      return request<any[]>(`/api/v1/files/${query}`, { method: 'GET' });
    },
    createFile: (formData: FormData) =>
      request('/api/v1/files/', {
        method: 'POST',
        body: formData,
      }),
    getFile: (uuid: string) =>
      request(`/api/v1/files/${uuid}/`, { method: 'GET' }),
    updateFile: (uuid: string, body: any) =>
      request(`/api/v1/files/${uuid}/`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    deleteFile: (uuid: string) =>
      request(`/api/v1/files/${uuid}/`, { method: 'DELETE' }),
    downloadFile: (uuid: string) =>
      request(`/api/v1/files/${uuid}/download/`, { method: 'GET' }),
  },

  // 9. Notifications
  notifications: {
    listNotifications: (params?: { unread_only?: boolean }) => {
      const query = params?.unread_only ? '?unread_only=true' : '';
      return request<any[]>(`/api/v1/notifications/${query}`, { method: 'GET' });
    },
    markRead: (notificationId?: string) =>
      request('/api/v1/notifications/mark-read/', {
        method: 'POST',
        body: JSON.stringify({ notification_id: notificationId || null }),
      }),
    clearAll: () =>
      request('/api/v1/notifications/', { method: 'DELETE' }),
    deleteNotification: (notificationId: string) =>
      request(`/api/v1/notifications/${notificationId}/`, { method: 'DELETE' }),
    getPreferences: () =>
      request<any>('/api/v1/notifications/preferences/', { method: 'GET' }),
    updatePreferences: (body: any) =>
      request('/api/v1/notifications/preferences/', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  // 10. Activities
  activities: {
    listActivities: (params?: { module?: string; action?: string }) => {
      let query = '';
      if (params) {
        const parts = [];
        if (params.module) parts.push(`module=${encodeURIComponent(params.module)}`);
        if (params.action) parts.push(`action=${encodeURIComponent(params.action)}`);
        if (parts.length > 0) query = `?${parts.join('&')}`;
      }
      return request<any[]>(`/api/v1/activities/${query}`, { method: 'GET' });
    },
  },

  // 11. Dashboard & Workspace
  dashboard: {
    getStats: () =>
      request('/api/v1/dashboard/', { method: 'GET' }),
    getWidgets: () =>
      request('/api/v1/dashboard/widgets/', { method: 'GET' }),
    search: (query: string) =>
      request(`/api/v1/search/?q=${encodeURIComponent(query)}`, { method: 'GET' }),
  },
};

