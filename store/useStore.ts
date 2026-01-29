import { create } from 'zustand';
import { AppState, Tenant, User, Product, Order, Role, TenantStatus, Category, StockLog, OrderStatus, Supplier, PurchaseOrder, Expense, PurchaseOrderStatus, Settings, Customer, Notification, SubscriptionRequest, Permission, TenantDetails } from '../types';
import { mockDb } from '../services/mockDb';
import { authService } from '../services/authService';
import { offlineService } from '../services/db';

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
  addOrder: (order: Partial<Order>) => Promise<Order>; // Updated return type
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
              await mockDb.createOrder(order); // Server updates its DB
              await offlineService.clearPendingOrder(order.id); // Clear local pending flag
           }
           
           // Fetch fresh state to ensure consistency (Server -> Client)
           // This handles updating stock counts from server's perspective, 
           // overwriting our local optimistic updates with the 'official' state.
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
        // Only set loading false if we have data, otherwise wait for network
        isLoading: localData.products.length === 0 
      });

      // If Online, fetch fresh data from "Server" and update Cache
      if (navigator.onLine) {
        // console.log('🌐 Online: Fetching fresh data...');
        const tenants = await mockDb.getTenants(); 
        const [products, orders, users, categories, stockLogs, suppliers, purchaseOrders, expenses, settings, customers, notifications, plans] = await Promise.all([
          mockDb.getTenantProducts(currentTenant.id),
          mockDb.getTenantOrders(currentTenant.id),
          mockDb.getTenantUsers(currentTenant.id),
          mockDb.getTenantCategories(currentTenant.id),
          mockDb.getTenantStockLogs(currentTenant.id),
          mockDb.getTenantSuppliers(currentTenant.id),
          mockDb.getTenantPurchaseOrders(currentTenant.id),
          mockDb.getTenantExpenses(currentTenant.id),
          mockDb.getTenantSettings(currentTenant.id),
          mockDb.getTenantCustomers(currentTenant.id),
          mockDb.getTenantNotifications(currentTenant.id),
          mockDb.getPlans()
        ]);

        // Update Store
        set({
          tenants, products, orders, users, categories, stockLogs, suppliers,
          purchaseOrders, expenses, settings, customers, notifications, plans,
          isLoading: false
        });

        // Update Local Cache with fresh server data
        await offlineService.cacheAllData({
          tenants, products, orders, users, categories, stockLogs, suppliers,
          purchaseOrders, expenses, settings, customers, notifications
        });

        // Check for pending items to sync
        await get().syncOfflineData();

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
    if (!navigator.onLine) return; // Admin data typically live only
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
      // Don't set global loading state to avoid flickering main dashboard
      return await mockDb.getTenantDetails(tenantId);
  },

  updateTenantStatus: async (id, status) => {
     await mockDb.updateTenantStatus(id, status);
     await get().loadAdminData(); 
  },

  // Subscription Request Handling
  submitSubscriptionProof: async (planId, planName, amount, proofFile) => {
    const { currentTenant } = get();
    if (!currentTenant) return;

    // Simulate Cloudinary Upload
    const fakeUpload = () => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(proofFile);
    });

    const proofUrl = await fakeUpload();

    await mockDb.createSubscriptionRequest({
        tenantId: currentTenant.id,
        tenantName: currentTenant.name,
        planId,
        planName,
        amount,
        paymentMethod: 'Manual Transfer',
        proofUrl
    });

    // Update local state to pending
    set({ currentTenant: { ...currentTenant, subscriptionStatus: 'PENDING_APPROVAL' }});
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
      await get().loadAdminData(); // Refresh list to see deleted tenants gone
      set({ isLoading: false });
      return result;
  },

  // Inventory Implementation
  refreshProducts: async () => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    
    if(navigator.onLine) {
        const products = await mockDb.getTenantProducts(currentTenant.id);
        set({ products });
        offlineService.syncProducts(products);
    } else {
        // Reload from local cache to ensure consistency
        const { products } = await offlineService.loadLocalState(currentTenant.id);
        set({ products });
    }
  },

  addProduct: async (newProduct) => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    
    // Optimistic update
    const product = { ...newProduct, id: `p_${Date.now()}`, tenantId: currentTenant.id, createdAt: new Date().toISOString() } as Product;
    set(state => ({ products: [...state.products, product] }));

    if(navigator.onLine) {
       await mockDb.createProduct({ ...newProduct, tenantId: currentTenant.id });
       await get().refreshProducts();
       await get().refreshStockLogs(); 
    }
  },

  updateProduct: async (id, updates) => {
    set(state => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    
    if(navigator.onLine) {
        await mockDb.updateProduct(id, updates);
        if (updates.stock !== undefined) {
          await get().refreshStockLogs();
        }
    }
  },

  deleteProduct: async (id) => {
    set(state => ({ products: state.products.filter(p => p.id !== id) }));
    if(navigator.onLine) await mockDb.deleteProduct(id);
  },

  refreshCategories: async () => {
    const { currentTenant } = get();
    if (!currentTenant || !navigator.onLine) return;
    const categories = await mockDb.getTenantCategories(currentTenant.id);
    set({ categories });
  },

  addCategory: async (category) => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    // Optimistic
    const newCat = { ...category, id: `c_${Date.now()}`, tenantId: currentTenant.id } as Category;
    set(state => ({ categories: [...state.categories, newCat] }));
    
    if(navigator.onLine) await mockDb.createCategory({ ...category, tenantId: currentTenant.id });
  },

  deleteCategory: async (id) => {
    set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
    if(navigator.onLine) await mockDb.deleteCategory(id);
  },

  refreshStockLogs: async () => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    
    if (navigator.onLine) {
       const stockLogs = await mockDb.getTenantStockLogs(currentTenant.id);
       set({ stockLogs });
    } else {
       const { stockLogs } = await offlineService.loadLocalState(currentTenant.id);
       set({ stockLogs });
    }
  },

  // Order Implementation
  refreshOrders: async () => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    
    if(navigator.onLine) {
        const serverOrders = await mockDb.getTenantOrders(currentTenant.id);
        const pending = await offlineService.getPendingOrders();
        // Merge pending if they aren't already in server list (simple dedupe)
        const combined = [...pending, ...serverOrders.filter(so => !pending.find(p => p.id === so.id))];
        set({ orders: combined.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
    } else {
        // Offline: load from cache
        const { orders } = await offlineService.loadLocalState(currentTenant.id);
        set({ orders });
    }
  },

  addOrder: async (order) => {
    const { currentTenant } = get();
    if (!currentTenant) throw new Error("No Tenant");
    
    const newOrder = { 
        ...order, 
        id: `ord_${Date.now()}`, 
        tenantId: currentTenant.id, 
        createdAt: new Date().toISOString() 
    } as Order;

    // 1. Update UI Immediately (Optimistic)
    set(state => ({ orders: [newOrder, ...state.orders] }));

    // 2. Handle Data Persistence
    if (navigator.onLine) {
        await mockDb.createOrder(order);
        await get().refreshProducts(); // Stock update from server
        await get().refreshStockLogs();
    } else {
        // Offline Mode: Atomic Local Transaction
        await offlineService.processOfflineOrder(newOrder);
        
        // Manually update local product stock in Store State to match IndexedDB
        set(state => ({
            products: state.products.map(p => {
                const item = newOrder.items.find(i => i.productId === p.id);
                if (item) {
                    const change = item.type === 'SALE' ? -item.quantity : item.quantity;
                    return { ...p, stock: p.stock + change };
                }
                return p;
            })
        }));
        
        // Refresh logs from local DB to show the new offline transaction log
        await get().refreshStockLogs();
    }
    
    return newOrder;
  },

  updateOrderStatus: async (id, status) => {
    set(state => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
    }));
    if(navigator.onLine) {
        await mockDb.updateOrderStatus(id, status);
    }
  },

  // User Implementation
  refreshUsers: async () => {
     const { currentTenant } = get();
     if (!currentTenant || !navigator.onLine) return;
     const users = await mockDb.getTenantUsers(currentTenant.id);
     set({ users });
  },

  inviteUser: async (user) => {
      const { currentTenant } = get();
      if (!currentTenant) return;
      if(navigator.onLine) {
          await mockDb.addTenantUser({...user, tenantId: currentTenant.id});
          await get().refreshUsers();
      }
  },

  removeUser: async (id) => {
      set(state => ({ users: state.users.filter(u => u.id !== id) }));
      if(navigator.onLine) await mockDb.removeTenantUser(id);
  },

  updateUserRole: async (id, role, permissions) => {
      set(state => ({ users: state.users.map(u => u.id === id ? { ...u, role, permissions } : u) }));
      if(navigator.onLine) await mockDb.updateUser(id, { role, permissions });
  },

  updateUserPin: async (targetUserId, newPin) => {
      const { user } = get();
      if (!user) return;
      await mockDb.updateUserPin(user.id, targetUserId, newPin);
      // Optimistic update
      set(state => ({
          users: state.users.map(u => u.id === targetUserId ? { ...u, pin: newPin } : u)
      }));
  },

  updateUserPassword: async (targetUserId, newPass) => {
      const { user } = get();
      if (!user) return;
      if(navigator.onLine) {
          await mockDb.updateUserPassword(user.id, targetUserId, newPass);
      }
  },

  verifyUserPin: async (pin) => {
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
          await mockDb.removeTenantUser(user.id);
          logout();
      } else {
          alert("You must be online to unlink your account.");
      }
  },

  // Settings Implementation
  updateTenantProfile: async (id, updates) => {
     if(navigator.onLine) {
         const updatedTenant = await mockDb.updateTenant(id, updates);
         set({ currentTenant: updatedTenant });
     } else {
         set(state => ({ currentTenant: state.currentTenant ? { ...state.currentTenant, ...updates } : null }));
     }
  },

  updateSettings: async (updates) => {
     const { currentTenant } = get();
     if (!currentTenant) return;
     
     // Optimistic
     set(state => ({ settings: state.settings ? { ...state.settings, ...updates } : null }));
     
     if(navigator.onLine) {
         const updatedSettings = await mockDb.updateTenantSettings(currentTenant.id, updates);
         set({ settings: updatedSettings });
     }
  },

  // Supplier Implementation
  refreshSuppliers: async () => {
    const { currentTenant } = get();
    if (!currentTenant || !navigator.onLine) return;
    const suppliers = await mockDb.getTenantSuppliers(currentTenant.id);
    set({ suppliers });
  },
  
  addSupplier: async (supplier) => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    // Optimistic
    const newSup = { ...supplier, id: `sup_${Date.now()}`, tenantId: currentTenant.id } as Supplier;
    set(state => ({ suppliers: [...state.suppliers, newSup] }));
    
    if(navigator.onLine) await mockDb.createSupplier({ ...supplier, tenantId: currentTenant.id });
  },

  deleteSupplier: async (id) => {
    set(state => ({ suppliers: state.suppliers.filter(s => s.id !== id) }));
    if(navigator.onLine) await mockDb.deleteSupplier(id);
  },

  // Customer Actions
  refreshCustomers: async () => {
    const { currentTenant } = get();
    if (!currentTenant || !navigator.onLine) return;
    const customers = await mockDb.getTenantCustomers(currentTenant.id);
    set({ customers });
  },

  addCustomer: async (customer) => {
    const { currentTenant } = get();
    if (!currentTenant) throw new Error("No Tenant");
    
    const newCustomer = { 
        ...customer, 
        id: `cus_${Date.now()}`, 
        tenantId: currentTenant.id, 
        createdAt: new Date().toISOString(),
        totalSpent: 0
    } as Customer;
    
    set(state => ({ customers: [...state.customers, newCustomer] }));

    if(navigator.onLine) {
       await mockDb.createCustomer({ ...customer, tenantId: currentTenant.id });
       await get().refreshCustomers(); // Get real ID
    }
    return newCustomer;
  },

  updateCustomer: async (id, updates) => {
    set(state => ({ customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c) }));
    if(navigator.onLine) await mockDb.updateCustomer(id, updates);
  },

  deleteCustomer: async (id) => {
    set(state => ({ customers: state.customers.filter(c => c.id !== id) }));
    if(navigator.onLine) await mockDb.deleteCustomer(id);
  },

  // Notification Actions
  refreshNotifications: async () => {
    const { currentTenant } = get();
    if (!currentTenant || !navigator.onLine) return;
    const notifications = await mockDb.getTenantNotifications(currentTenant.id);
    set({ notifications });
  },

  markNotificationRead: async (id) => {
    set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
    if(navigator.onLine) await mockDb.markNotificationRead(id);
  },

  markAllNotificationsRead: async () => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) }));
    if(navigator.onLine) await mockDb.markAllNotificationsRead(currentTenant.id);
  },

  // Purchase Order Implementation
  refreshPurchaseOrders: async () => {
    const { currentTenant } = get();
    if (!currentTenant || !navigator.onLine) return;
    const purchaseOrders = await mockDb.getTenantPurchaseOrders(currentTenant.id);
    set({ purchaseOrders });
  },

  addPurchaseOrder: async (po) => {
    const { currentTenant } = get();
    if (!currentTenant) return;
    // Optimistic
    const newPO = { ...po, id: `po_${Date.now()}`, tenantId: currentTenant.id, createdAt: new Date().toISOString() } as PurchaseOrder;
    set(state => ({ purchaseOrders: [newPO, ...state.purchaseOrders] }));

    if(navigator.onLine) {
        await mockDb.createPurchaseOrder({ ...po, tenantId: currentTenant.id });
        if (po.status === PurchaseOrderStatus.RECEIVED) {
          await get().refreshProducts();
        }
    }
  },

  updatePurchaseOrderStatus: async (id, status) => {
    set(state => ({ purchaseOrders: state.purchaseOrders.map(p => p.id === id ? { ...p, status } : p) }));
    if(navigator.onLine) {
        await mockDb.updatePurchaseOrderStatus(id, status);
        if (status === PurchaseOrderStatus.RECEIVED) {
          await get().refreshProducts();
        }
    }
  },

  // Expense Implementation
  refreshExpenses: async () => {
    const { currentTenant } = get();
    if (!currentTenant || !navigator.onLine) return;
    const expenses = await mockDb.getTenantExpenses(currentTenant.id);
    set({ expenses });
  },

  addExpense: async (expense) => {
    const { currentTenant, user } = get();
    if (!currentTenant) return;
    const newEx = { ...expense, id: `ex_${Date.now()}`, tenantId: currentTenant.id, recordedBy: user?.name } as Expense;
    set(state => ({ expenses: [newEx, ...state.expenses] }));

    if(navigator.onLine) await mockDb.createExpense({ ...expense, tenantId: currentTenant.id, recordedBy: user?.name || 'User' });
  },

  deleteExpense: async (id) => {
    set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
    if(navigator.onLine) await mockDb.deleteExpense(id);
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
      allTenants: [],
      transactions: [],
      suppliers: [],
      purchaseOrders: [],
      expenses: [],
      settings: null,
      customers: [],
      notifications: [],
      subscriptionRequests: []
    });
  }
}));