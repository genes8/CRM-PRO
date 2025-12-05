import axios from 'axios';
import type { 
  User, 
  Contact, 
  ContactCreate, 
  Deal, 
  DealCreate, 
  Task, 
  TaskCreate, 
  Analytics,
  AuthCheck 
} from './types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const authApi = {
  check: () => api.get<AuthCheck>('/auth/check'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get<User>('/auth/me'),
};

// Contacts
export const contactsApi = {
  getAll: (params?: { status?: string; search?: string }) => 
    api.get<Contact[]>('/contacts', { params }),
  getById: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: ContactCreate) => api.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<ContactCreate>) => 
    api.put<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

// Deals
export const dealsApi = {
  getAll: (params?: { stage?: string; search?: string }) => 
    api.get<Deal[]>('/deals', { params }),
  getById: (id: string) => api.get<Deal>(`/deals/${id}`),
  create: (data: DealCreate) => api.post<Deal>('/deals', data),
  update: (id: string, data: Partial<DealCreate>) => 
    api.put<Deal>(`/deals/${id}`, data),
  delete: (id: string) => api.delete(`/deals/${id}`),
};

// Tasks
export const tasksApi = {
  getAll: (params?: { status?: string; priority?: string; search?: string }) => 
    api.get<Task[]>('/tasks', { params }),
  getById: (id: string) => api.get<Task>(`/tasks/${id}`),
  create: (data: TaskCreate) => api.post<Task>('/tasks', data),
  update: (id: string, data: Partial<TaskCreate & { is_completed?: boolean }>) => 
    api.put<Task>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  complete: (id: string) => api.post<Task>(`/tasks/${id}/complete`),
};

// Analytics
export const analyticsApi = {
  get: () => api.get<Analytics>('/analytics'),
};

// Seed data
export const seedApi = {
  seed: () => api.post('/seed'),
};

export default api;
