import { Notification } from '../types';
import { mockDb } from './mockDb';

/**
 * EMAIL SERVICE SIMULATION (SMTP)
 * 
 * In a real application, this would connect to a backend API (NodeMailer/SendGrid).
 * Here, it simulates sending emails by:
 * 1. Logging to console (Dev mode)
 * 2. Creating in-app notifications so the user can "see" the email effect.
 */

export const emailService = {
  
  sendLoginAlert: async (userEmail: string, tenantId: string) => {
    console.log(`[SMTP] Sending Login Alert to ${userEmail}...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create a notification to simulate the email being received by the system admin/user
    const notification: Partial<Notification> = {
      tenantId,
      title: 'Security Alert: New Login',
      message: `A new login was detected for ${userEmail} from Chrome on Windows.`,
      type: 'WARNING',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    // In a real app, this notification logic might be triggered by the backend
    // Here we inject it directly into the mock DB so it appears in the UI
    const notifs = await mockDb.getTenantNotifications(tenantId);
    // Hacky push to mockDB for demo purposes
    (notifs as any).push({ ...notification, id: `n_alert_${Date.now()}` });
    
    console.log(`[SMTP] Email sent to ${userEmail}: "New Login Detected"`);
    return true;
  },

  sendPasswordReset: async (email: string) => {
    console.log(`[SMTP] Sending Password Reset Link to ${email}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`[SMTP] Reset Link: https://saasnexus.app/reset-password?token=${btoa(email)}`);
    return true;
  },

  sendWelcomeEmail: async (email: string, name: string) => {
    console.log(`[SMTP] Sending Welcome Email to ${email}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[SMTP] Welcome sent to ${name}`);
    return true;
  },

  sendOrderReceipt: async (email: string, orderId: string, amount: number) => {
    console.log(`[SMTP] Sending Receipt for Order #${orderId} to ${email}`);
    // Logic to generate PDF invoice attachment would go here
    return true;
  }
};