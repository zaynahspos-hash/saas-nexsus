import { User, Tenant } from '../types';
import { api } from './api';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; tenant: Tenant }> => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('shopgenius_token', response.data.token);
    }
    
    return {
        user: response.data.user,
        tenant: response.data.tenant
    };
  },

  signup: async (name: string, email: string, password: string, companyName: string): Promise<{ user: User; tenant: Tenant }> => {
    const response = await api.post('/auth/signup', { 
        name, 
        email, 
        password, 
        companyName,
        adminName: name
    });

    if (response.data.token) {
      localStorage.setItem('shopgenius_token', response.data.token);
    }

    return {
        user: response.data.user,
        tenant: response.data.tenant
    };
  },

  logout: async () => {
    localStorage.removeItem('shopgenius_token');
    return Promise.resolve();
  },

  // Verify token
  checkSession: async (): Promise<{ user: User; tenant: Tenant } | null> => {
    const token = localStorage.getItem('shopgenius_token');
    if (!token) return null;
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (e) {
        return null;
    }
  }
};
