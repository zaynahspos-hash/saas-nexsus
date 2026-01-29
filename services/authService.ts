import { User, Tenant } from '../types';
import { mockDb } from './mockDb';
import { emailService } from './emailService';

/**
 * Simulates NextAuth.js backend logic on the client.
 */
export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; tenant: Tenant }> => {
    // In a real app, we would verify password hash here.
    const result = await mockDb.authenticate(email, password);
    
    if (!result) {
      throw new Error('Invalid credentials');
    }
    
    // Trigger Security Alert Email (Async)
    emailService.sendLoginAlert(email, result.tenant.id);

    // Simulate setting a session token
    localStorage.setItem('saas_nexus_token', 'mock_token_' + result.user.id);
    return result;
  },

  signup: async (name: string, email: string, password: string, companyName: string): Promise<{ user: User; tenant: Tenant }> => {
    const result = await mockDb.registerTenant(companyName, name, email);
    
    // Trigger Welcome Email
    emailService.sendWelcomeEmail(email, name);

    localStorage.setItem('saas_nexus_token', 'mock_token_' + result.user.id);
    return result;
  },

  logout: async () => {
    localStorage.removeItem('saas_nexus_token');
    return Promise.resolve();
  },

  checkSession: async (): Promise<{ user: User; tenant: Tenant } | null> => {
    const token = localStorage.getItem('saas_nexus_token');
    if (!token) return null;
    // Simple mock validation
    return null; 
  }
};