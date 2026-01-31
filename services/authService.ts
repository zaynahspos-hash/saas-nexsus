import { User, Tenant } from '../types';
import { api } from './api';
import { mockDb } from './mockDb';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; tenant: Tenant }> => {
    try {
      // 1. Try Real Backend
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('shopgenius_token', response.data.token);
      }
      
      return {
          user: response.data.user,
          tenant: response.data.tenant
      };
    } catch (error: any) {
      // 2. Fallback to Mock DB if Network Error or 500
      if (error.message === 'Network Error' || !error.response || error.response.status >= 500) {
        console.warn("[Auth] Backend unreachable. Attempting Mock Login...");
        const mockResult = await mockDb.authenticate(email, password);
        if (mockResult) {
          return mockResult;
        }
      }
      // If mock also fails (wrong credentials) or it was a 400 error from backend, throw
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string, companyName: string): Promise<{ user: User; tenant: Tenant }> => {
    try {
      // 1. Try Real Backend
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
    } catch (error: any) {
      // 2. Fallback to Mock DB
      if (error.message === 'Network Error' || !error.response || error.response.status >= 500) {
         console.warn("[Auth] Backend unreachable. Creating Mock Account...");
         return await mockDb.registerTenant(companyName, name, email);
      }
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('shopgenius_token');
    return Promise.resolve();
  },

  // Verify token
  checkSession: async (): Promise<{ user: User; tenant: Tenant } | null> => {
    const token = localStorage.getItem('shopgenius_token');
    // If no token, maybe we are in mock mode from previous session? 
    // For now, simple token check for API. 
    if (!token) return null;
    
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (e) {
        return null;
    }
  }
};