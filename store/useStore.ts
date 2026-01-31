import { create } from 'zustand';
import { AppState, Tenant, User, Product, Order, Role, TenantStatus, Category, StockLog, OrderStatus, Supplier, PurchaseOrder, Expense, PurchaseOrderStatus, Settings, Customer, Notification, SubscriptionRequest, Permission, TenantDetails } from '../types';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { offlineService } from '../services/db';
import { mockDb } from '../services/mockDb'; // Keep mock for Admin features not yet backed

interface StoreActions {
  setTenant: (tenant: Tenant) => void;
  loadInitialData: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
  
  // Inventory Actions
  refreshProducts: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  refreshCategories: () => Promise<void>;
  addCategory: (category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  refreshStockLogs: () => Promise<void>;
  
  // Order Actions
  refreshOrders: () => Promise<void>;
  addOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;

  // User Actions
  refreshUsers: () => Promise<void>;
  inviteUser: (user: Partial<User> & { password?: string }) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  updateUserRole: (id: string, role: Role, permissions: Permission[]) => Promise<void>;
  updateUserPin: (targetUserId: string, newPin: string) => Promise<void>;
  updateUserPassword: (targetUserId: string, newPass: string) => Promise<void>;
  verifyUserPin: (pin: string) => Promise<boolean>;
  leaveCurrentTenant: () => Promise<void>;

  // Settings Actions
  updateTenantProfile: (id: string, updates: Partial<Tenant>) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;

  // Supplier Actions
  refreshSuppliers: () => Promise<void>;
  addSupplier: (supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Customer Actions (CRM)
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Notification Actions
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Purchase Order Actions
  refreshPurchaseOrders: () => Promise<void>;
  addPurchaseOrder: (po: Partial<PurchaseOrder>) => Promise<void>;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus) => Promise<void>;

  // Expense Actions
  refreshExpenses: () => Promise<void>;
  addExpense: (expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Admin & Subscription Actions
  loadAdminData: () => Promise<void>;
  fetchTenantDetails: (tenantId: string) => Promise<TenantDetails | null>;
  updateTenantStatus: (id: string, status: TenantStatus) => Promise<void>;
  submitSubscriptionProof: (planId: string, planName: string, amount: number, proofFile: File) => Promise<void>;
  approveSubscription: (requestId: string) => Promise<void>;
  rejectSubscription: (requestId: string) => Promise<void>;
  runRetentionPolicy: () => Promise<{ deleted: string[], warned: string[] }>;

  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, companyName: string) => Promise<void>;
  logout: () => void;
  
  // Theme
  toggleTheme: () => void;
}

type Store = AppState & StoreActions & { isAuthenticated: boolean; isOnline: boolean };

export const useStore = create<Store>((set, get) => ({
  // Initial State
  isAuthenticated: false,
  isOnline: navigator.onLine,
  currentTenant: null,
  settings: null,
  user: null,
  tenants: [],
  users: [],
  products: [],
  categories: [],
  stockLogs: [],
  orders: [],
  suppliers: [],
  purchaseOrders: [],
  expenses: [],
  customers: [],
  notifications: [],
  
  // Super Admin Data
  allTenants: [],
  transactions: [],
  plans: [],
  subscriptionRequests: [],

  isLoading: false, 
  searchQuery: '',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',

  // Actions
  setTenant: (tenant: Tenant) => {
    set({ currentTenant: tenant, isLoading: true });
    get().loadInitialData(); // Re-load data for new tenant
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);
  },

  syncOfflineData: async () => {
    const { currentTenant } = get();
    if (!currentTenant || !navigator.onLine) return;

    try {
        const pending = await offlineService.getPendingOrders();
        if (pending.length > 0) {
           console.log(`Syncing ${pending.length} offline orders...`);
           
           // Push all pending orders to server
           for (const order of pending) {
              await api.post('/orders', order); // Server updates its DB
              await offlineService.clearPendingOrder(order.id); // Clear local pending flag
           }
           
           // Fetch fresh state to ensure consistency
           await get().loadInitialData();
           console.log('✅ Sync Complete');
        }
    } catch (e) {
        console.error("Sync failed:", e);
    }
  },

  loadInitialData: async () => {
    const { currentTenant, user } = get();
    if (!currentTenant) return;

    set({ isLoading: true });

    // STRATEGY: Load from Local Dexie Cache FIRST (Fast & Offline)
    try {
      const localData = await offlineService.loadLocalState(currentTenant.id);
      
      // Populate store with local data immediately
      set({
        ...localData,
        isLoading: localData.products.length === 0 
      });

      // If Online, fetch fresh data from Backend API
      if (navigator.onLine) {
        try {
            // Parallel data fetching from Real API
            const [
                productsRes, ordersRes, usersRes, categoriesRes, stockLogsRes, 
                suppliersRes, purchaseOrdersRes, expensesRes, settingsRes, customersRes
            ] = await Promise.all([
              api.get('/products'),
              api.get('/orders'),
              api.get('/users'),
              api.get('/categories'),
              api.get('/stock-logs'),
              api.get('/suppliers'),
              api.get('/purchase-orders'),
              api.get('/expenses'),
              api.get('/settings'),
              api.get('/customers')
            ]);

            const products = productsRes.data;
            const orders = ordersRes.data;
            const users = usersRes.data;
            const categories = categoriesRes.data;
            const stockLogs = stockLogsRes.data;
            const suppliers = suppliersRes.data;
            const purchaseOrders = purchaseOrdersRes.data;
            const expenses = expensesRes.data;
            const settings = settingsRes.data;
            const customers = customersRes.data;
            
            // Mock data for things not yet on backend
            const notifications = await mockDb.getTenantNotifications(currentTenant.id);
            const plans = await mockDb.getPlans();

            // Update Store
            set({
              products, orders, users, categories, stockLogs, suppliers,
              purchaseOrders, expenses, settings, customers, notifications, plans,
              tenants: [currentTenant], // For now, single tenant view
              isLoading: false
            });

            // Update Local Cache with fresh server data
            await offlineService.cacheAllData({
              products, orders, users, categories, stockLogs, suppliers,
              purchaseOrders, expenses, settings, customers, notifications
            });

            // Check for pending items to sync
            await get().syncOfflineData();
        } catch (apiError) {
            console.warn("API Fetch failed, using local/mock data:", apiError);
            // If API fails, we rely on what we loaded from Dexie or MockDB
            // If Local Dexie was empty, let's load default MockDB data to prevent empty state
            if (get().products.length === 0) {
               const mockProducts = await mockDb.getTenantProducts(currentTenant.id);
               const mockOrders = await mockDb.getTenantOrders(currentTenant.id);
               set({ 
                   products: mockProducts, 
                   orders: mockOrders,
                   isLoading: false 
               });
            } else {
               set({ isLoading: false });
            }
        }

      } else {
        set({ isLoading: false }); // Ensure loading stops if offline
      }

      if (user?.role === Role.SUPER_ADMIN) {
        await get().loadAdminData();
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  loadAdminData: async () => {
    // Admin data typically live only, but use mockDb if offline/error
    set({ isLoading: true });
    try {
      const [allTenants, transactions, plans, subscriptionRequests] = await Promise.all([
        mockDb.getAllTenants(),
        mockDb.getTransactions(),
        mockDb.getPlans(),
        mockDb.getSubscriptionRequests()
      ]);
      set({ allTenants, transactions, plans, subscriptionRequests, isLoading: false });
    } catch (error) {
      console.error('Failed to load admin data:', error);
      set({ isLoading: false });
    }
  },

  fetchTenantDetails: async (tenantId: string) => {
      return await mockDb.getTenantDetails(tenantId);
  },

  updateTenantStatus: async (id, status) => {
     await mockDb.updateTenantStatus(id, status);
     await get().loadAdminData(); 
  },

  // Subscription Request Handling
  submitSubscriptionProof: async (planId, planName, amount, proofFile) => {
    // Still mock for now
    await mockDb.createSubscriptionRequest({
        tenantId: get().currentTenant!.id,
        tenantName: get().currentTenant!.name,
        planId,
        planName,
        amount,
        paymentMethod: 'Manual Transfer',
        proofUrl: URL.createObjectURL(proofFile)
    });
  },

  approveSubscription: async (requestId) => {
      await mockDb.approveSubscription(requestId);
      await get().loadAdminData();
  },

  rejectSubscription: async (requestId) => {
      await mockDb.rejectSubscription(requestId);
      await get().loadAdminData();
  },

  runRetentionPolicy: async () => {
      set({ isLoading: true });
      const result = await mockDb.runRetentionPolicy();
      await get().loadAdminData(); 
      set({ isLoading: false });
      return result;
  },

  // Inventory Implementation
  refreshProducts: async () => {
    if(navigator.onLine) {
        const res = await api.get('/products');
        set({ products: res.data });
        offlineService.syncProducts(res.data);
    }
  },

  addProduct: async (newProduct) => {
    if(navigator.onLine) {
       await api.post('/products', newProduct);
       await get().refreshProducts();
       await get().refreshStockLogs(); 
    }
  },

  updateProduct: async (id, updates) => {
    set(state => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    if(navigator.onLine) {
        await api.put(`/products/${id}`, updates);
        if (updates.stock !== undefined) await get().refreshStockLogs();
    }
  },

  deleteProduct: async (id) => {
    set(state => ({ products: state.products.filter(p => p.id !== id) }));
    if(navigator.onLine) await api.delete(`/products/${id}`);
  },

  refreshCategories: async () => {
    if (!navigator.onLine) return;
    const res = await api.get('/categories');
    set({ categories: res.data });
  },

  addCategory: async (category) => {
    if(navigator.onLine) {
        const res = await api.post('/categories', category);
        set(state => ({ categories: [...state.categories, res.data] }));
    }
  },

  deleteCategory: async (id) => {
    set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
    if(navigator.onLine) await api.delete(`/categories/${id}`);
  },

  refreshStockLogs: async () => {
    if (navigator.onLine) {
       const res = await api.get('/stock-logs');
       set({ stockLogs: res.data });
    }
  },

  // Order Implementation
  refreshOrders: async () => {
    if(navigator.onLine) {
        const res = await api.get('/orders');
        set({ orders: res.data });
    }
  },

  addOrder: async (order) => {
    const { currentTenant } = get();
    if (!currentTenant) throw new Error("No Tenant");
    
    // Optimistic Update
    const optimisticOrder = { 
        ...order, 
        id: `ord_temp_${Date.now()}`, 
        tenantId: currentTenant.id, 
        createdAt: new Date().toISOString() 
    } as Order;
    set(state => ({ orders: [optimisticOrder, ...state.orders] }));

    if (navigator.onLine) {
        try {
            const res = await api.post('/orders', order);
            // Replace optimistic order with real one
            set(state => ({ 
                orders: state.orders.map(o => o.id === optimisticOrder.id ? res.data : o) 
            }));
            await get().refreshProducts(); // Stock update from server
            await get().refreshStockLogs();
            return res.data;
        } catch (e) {
            console.error("Order sync failed, saving offline", e);
            // Fallback to offline logic below if API fails
        }
    } 
    
    // Offline Mode or Fallback
    await offlineService.processOfflineOrder(optimisticOrder);
    // Manually update local product stock in Store State
    set(state => ({
        products: state.products.map(p => {
            const item = optimisticOrder.items.find(i => i.productId === p.id);
            if (item) {
                const change = item.type === 'SALE' ? -item.quantity : item.quantity;
                return { ...p, stock: p.stock + change };
            }
            return p;
        })
    }));
    return optimisticOrder;
  },

  updateOrderStatus: async (id, status) => {
    set(state => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
    }));
    if(navigator.onLine) {
        await api.put(`/orders/${id}/status`, { status });
    }
  },

  // User Implementation
  refreshUsers: async () => {
     if (!navigator.onLine) return;
     const res = await api.get('/users');
     set({ users: res.data });
  },

  inviteUser: async (user) => {
      if(navigator.onLine) {
          await api.post('/users/invite', user);
          await get().refreshUsers();
      }
  },

  removeUser: async (id) => {
      set(state => ({ users: state.users.filter(u => u.id !== id) }));
      if(navigator.onLine) await api.delete(`/users/${id}`);
  },

  updateUserRole: async (id, role, permissions) => {
      set(state => ({ users: state.users.map(u => u.id === id ? { ...u, role, permissions } : u) }));
      if(navigator.onLine) await api.put(`/users/${id}/role`, { role, permissions });
  },

  updateUserPin: async (targetUserId, newPin) => {
      await api.put(`/users/${targetUserId}/pin`, { pin: newPin });
      set(state => ({
          users: state.users.map(u => u.id === targetUserId ? { ...u, pin: newPin } : u)
      }));
  },

  updateUserPassword: async (targetUserId, newPass) => {
      // Not implemented in API yet, skipping for now or use mock logic if needed
      // await api.put(`/users/${targetUserId}/password`, { password: newPass });
  },

  verifyUserPin: async (pin) => {
      // Local verification only for speed/security
      const { user } = get();
      if (!user) return false;
      if (user.pin === pin) return true;
      if (!user.pin && pin === '1234') return true;
      return false;
  },

  leaveCurrentTenant: async () => {
      const { user, logout } = get();
      if (!user) return;
      if(navigator.onLine) {
          await api.delete(`/users/${user.id}`);
          logout();
      }
  },

  // Settings Implementation
  updateTenantProfile: async (id, updates) => {
     if(navigator.onLine) {
         const res = await api.put('/tenant', updates);
         set({ currentTenant: res.data });
     }
  },

  updateSettings: async (updates) => {
     // Optimistic
     set(state => ({ settings: state.settings ? { ...state.settings, ...updates } : null }));
     if(navigator.onLine) {
         const res = await api.put('/settings', updates);
         set({ settings: res.data });
     }
  },

  // Supplier Implementation
  refreshSuppliers: async () => {
    if (!navigator.onLine) return;
    const res = await api.get('/suppliers');
    set({ suppliers: res.data });
  },
  
  addSupplier: async (supplier) => {
    if(navigator.onLine) {
        const res = await api.post('/suppliers', supplier);
        set(state => ({ suppliers: [...state.suppliers, res.data] }));
    }
  },

  deleteSupplier: async (id) => {
    set(state => ({ suppliers: state.suppliers.filter(s => s.id !== id) }));
    if(navigator.onLine) await api.delete(`/suppliers/${id}`);
  },

  // Customer Actions
  refreshCustomers: async () => {
    if (!navigator.onLine) return;
    const res = await api.get('/customers');
    set({ customers: res.data });
  },

  addCustomer: async (customer) => {
    if(navigator.onLine) {
       const res = await api.post('/customers', customer);
       set(state => ({ customers: [...state.customers, res.data] }));
       return res.data;
    }
    throw new Error("Offline customer creation not supported yet");
  },

  updateCustomer: async (id, updates) => {
    set(state => ({ customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c) }));
    if(navigator.onLine) await api.put(`/customers/${id}`, updates);
  },

  deleteCustomer: async (id) => {
    set(state => ({ customers: state.customers.filter(c => c.id !== id) }));
    if(navigator.onLine) await api.delete(`/customers/${id}`);
  },

  // Notification Actions
  refreshNotifications: async () => {
    const { currentTenant } = get();
    // Still utilizing mockDb for notifications as API endpoint wasn't requested/created in Phase 2
    if (!currentTenant) return;
    const notifications = await mockDb.getTenantNotifications(currentTenant.id);
    set({ notifications });
  },

  markNotificationRead: async (id) => {
    set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
    await mockDb.markNotificationRead(id);
  },

  markAllNotificationsRead: async () => {
    set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) }));
    if (get().currentTenant) await mockDb.markAllNotificationsRead(get().currentTenant!.id);
  },

  // Purchase Order Implementation
  refreshPurchaseOrders: async () => {
    if (!navigator.onLine) return;
    const res = await api.get('/purchase-orders');
    set({ purchaseOrders: res.data });
  },

  addPurchaseOrder: async (po) => {
    if(navigator.onLine) {
        const res = await api.post('/purchase-orders', po);
        set(state => ({ purchaseOrders: [res.data, ...state.purchaseOrders] }));
        if (po.status === PurchaseOrderStatus.RECEIVED) {
          await get().refreshProducts();
        }
    }
  },

  updatePurchaseOrderStatus: async (id, status) => {
    set(state => ({ purchaseOrders: state.purchaseOrders.map(p => p.id === id ? { ...p, status } : p) }));
    if(navigator.onLine) {
        await api.put(`/purchase-orders/${id}/status`, { status });
        if (status === PurchaseOrderStatus.RECEIVED) {
          await get().refreshProducts();
        }
    }
  },

  // Expense Implementation
  refreshExpenses: async () => {
    if (!navigator.onLine) return;
    const res = await api.get('/expenses');
    set({ expenses: res.data });
  },

  addExpense: async (expense) => {
    if(navigator.onLine) {
        const res = await api.post('/expenses', expense);
        set(state => ({ expenses: [res.data, ...state.expenses] }));
    }
  },

  deleteExpense: async (id) => {
    set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
    if(navigator.onLine) await api.delete(`/expenses/${id}`);
  },

  // Auth Implementation
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, tenant } = await authService.login(email, password);
      set({ 
        isAuthenticated: true, 
        user, 
        currentTenant: tenant,
        tenants: [tenant] 
      });
      await get().loadInitialData();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (name, email, password, companyName) => {
    set({ isLoading: true });
    try {
      const { user, tenant } = await authService.signup(name, email, password, companyName);
      set({ 
        isAuthenticated: true, 
        user, 
        currentTenant: tenant,
        tenants: [tenant]
      });
      await get().loadInitialData();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ 
      isAuthenticated: false, 
      user: null, 
      currentTenant: null, 
      products: [], 
      orders: [], 
      suppliers: [], 
      purchaseOrders: [], 
      expenses: [], 
      settings: null, 
      customers: [], 
      notifications: [] 
    });
  }
}));