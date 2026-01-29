import { Tenant, User, Product, Order, Role, SubscriptionTier, OrderStatus, TenantStatus, Transaction, Plan, Category, StockLog, StockMovementType, Supplier, PurchaseOrder, Expense, PurchaseOrderStatus, Settings, Customer, Notification, OrderItem, SubscriptionRequest, Permission, TenantDetails } from '../types';

/**
 * MOCK DATABASE INITIALIZATION
 */

const ALL_PERMISSIONS: Permission[] = [
  'VIEW_DASHBOARD', 'POS_ACCESS', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 
  'MANAGE_USERS', 'MANAGE_SETTINGS', 'VIEW_REPORTS', 'MANAGE_SUPPLIERS', 
  'MANAGE_EXPENSES', 'MANAGE_CUSTOMERS'
];

// Helper for dates
const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    name: 'Acme Corp',
    slug: 'acme',
    subscriptionTier: SubscriptionTier.PRO_YEARLY,
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 300).toISOString(),
    status: TenantStatus.ACTIVE,
    createdAt: getPastDate(365),
    updatedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    email: 'contact@acme.com',
    phone: '+1 (555) 0123-4567',
    address: '123 Innovation Dr, Tech City, TC 90210'
  },
  {
    id: 't2',
    name: 'Stark Industries',
    slug: 'stark',
    subscriptionTier: SubscriptionTier.PRO_MONTHLY,
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    status: TenantStatus.ACTIVE,
    createdAt: getPastDate(180),
    updatedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/1541/1541406.png',
    email: 'tony@stark.com',
    address: '10880 Malibu Point, Malibu, CA'
  }
];

const MOCK_SETTINGS: Settings[] = [
  {
    id: 's1',
    tenantId: 't1',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    theme: 'light',
    taxRate: 0.05,
    receiptHeader: 'Thank you for shopping with Acme!',
    receiptFooter: 'Visit us at www.acme.com \n No refunds after 30 days.',
    showLogoOnReceipt: true,
    showCashierOnReceipt: true,
    showCustomerOnReceipt: true,
    showTaxBreakdown: true,
    showBarcode: true,
    receiptWidth: '80mm',
    receiptTemplate: 'modern',
    receiptFontSize: 12,
    receiptMargin: 10
  }
];

// Extended User type for internal MockDB use
type MockUser = User & { password?: string };

const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    tenantId: 't1',
    name: 'Alice Admin',
    email: 'alice@acme.com',
    password: 'password', 
    role: Role.ADMIN,
    permissions: ALL_PERMISSIONS,
    pin: '1234',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Admin&background=6366f1&color=fff',
    createdAt: getPastDate(300)
  },
  {
    id: 'u2',
    tenantId: 't1',
    name: 'Bob Manager',
    email: 'bob@acme.com',
    password: 'password',
    role: Role.MANAGER,
    permissions: ['VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'VIEW_REPORTS', 'MANAGE_SUPPLIERS', 'MANAGE_EXPENSES'],
    pin: '0000',
    avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Manager&background=10b981&color=fff',
    createdAt: getPastDate(200)
  },
  {
    id: 'u3',
    tenantId: 't2',
    name: 'Tony S.',
    email: 'tony@stark.com',
    password: 'password',
    role: Role.SUPER_ADMIN,
    permissions: ALL_PERMISSIONS,
    pin: '9999',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tony+S&background=f59e0b&color=fff',
    createdAt: getPastDate(150)
  },
  {
    id: 'u4',
    tenantId: 't1',
    name: 'Sarah Sales',
    email: 'sarah@acme.com',
    password: 'password',
    role: Role.SALESMAN,
    permissions: ['POS_ACCESS', 'MANAGE_CUSTOMERS'],
    pin: '1111',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Sales&background=ec4899&color=fff',
    createdAt: getPastDate(100)
  }
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', tenantId: 't1', name: 'Electronics', productCount: 5, description: 'Gadgets and devices' },
  { id: 'c2', tenantId: 't1', name: 'Accessories', productCount: 3, description: 'Chargers, cases, etc.' },
  { id: 'c3', tenantId: 't1', name: 'Wearables', productCount: 2, description: 'Watches and bands' }
];

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup1', tenantId: 't1', name: 'TechMaster Dist', contactPerson: 'John Doe', email: 'orders@techmaster.com', phone: '0300-1234567', address: 'Lahore, PK' },
  { id: 'sup2', tenantId: 't1', name: 'Global Imports', contactPerson: 'Jane Smith', email: 'sales@global.com', phone: '0300-7654321', address: 'Karachi, PK' }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1', tenantId: 't1', name: 'iPhone 15 Pro', description: 'Latest Apple Flagship', sku: 'IP15P-BLK', 
    price: 350000, costPrice: 310000, stock: 12, category: 'Electronics', supplierId: 'sup1', 
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400', lowStockThreshold: 5, createdAt: getPastDate(60)
  },
  {
    id: 'p2', tenantId: 't1', name: 'Samsung S24 Ultra', description: 'AI Phone', sku: 'S24U-GRY', 
    price: 320000, costPrice: 280000, stock: 8, category: 'Electronics', supplierId: 'sup1', 
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', lowStockThreshold: 5, createdAt: getPastDate(55)
  },
  {
    id: 'p3', tenantId: 't1', name: 'AirPods Pro 2', description: 'Noise cancelling', sku: 'APP2', 
    price: 65000, costPrice: 50000, stock: 25, category: 'Accessories', supplierId: 'sup2', 
    imageUrl: 'https://images.unsplash.com/photo-1603351154351-5cf9972f27ce?w=400', lowStockThreshold: 10, createdAt: getPastDate(50)
  },
  {
    id: 'p4', tenantId: 't1', name: 'USB-C Cable (2m)', description: 'Braided Fast Charge', sku: 'CABLE-C-2M', 
    price: 1500, costPrice: 500, stock: 100, category: 'Accessories', supplierId: 'sup2', 
    imageUrl: 'https://images.unsplash.com/photo-1632514106673-3c99052b649d?w=400', lowStockThreshold: 20, createdAt: getPastDate(45)
  },
  {
    id: 'p5', tenantId: 't1', name: 'Smart Watch Series 9', description: 'Midnight Aluminum', sku: 'WATCH-S9', 
    price: 120000, costPrice: 95000, stock: 3, category: 'Wearables', supplierId: 'sup1', 
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', lowStockThreshold: 5, createdAt: getPastDate(40)
  }
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust1', tenantId: 't1', name: 'Hamza Khan', phone: '03001112222', email: 'hamza@gmail.com', address: 'DHA Phase 6', totalSpent: 0, createdAt: getPastDate(100) },
  { id: 'cust2', tenantId: 't1', name: 'Ayesha Bibi', phone: '03213334444', email: 'ayesha@yahoo.com', address: 'Gulberg III', totalSpent: 0, createdAt: getPastDate(80) },
  { id: 'cust3', tenantId: 't1', name: 'Ali Raza', phone: '03335556666', address: 'Model Town', totalSpent: 0, createdAt: getPastDate(60) }
];

// Generate Orders for the last 30 days to populate charts
const generateOrders = (): Order[] => {
  const orders: Order[] = [];
  const now = new Date();
  
  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Random User
    const user = MOCK_USERS[Math.floor(Math.random() * 2)]; // Alice or Bob
    // Random Customer
    const cust = Math.random() > 0.3 ? MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)] : null;
    
    // Random Product
    const p1 = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
    const p2 = Math.random() > 0.5 ? MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)] : null;
    
    const items: OrderItem[] = [
        { id: `oi_${i}_1`, productId: p1.id, productName: p1.name, priceAtTime: p1.price, costAtTime: p1.costPrice, quantity: 1, type: 'SALE' }
    ];
    if (p2) {
        items.push({ id: `oi_${i}_2`, productId: p2.id, productName: p2.name, priceAtTime: p2.price, costAtTime: p2.costPrice, quantity: 1, type: 'SALE' });
    }

    const total = items.reduce((s, item) => s + (item.priceAtTime * item.quantity), 0);

    orders.push({
      id: `ORD-${1000 + i}`,
      tenantId: 't1',
      userId: user.id,
      salespersonName: user.name,
      customerName: cust ? cust.name : 'Walk-in Customer',
      customerId: cust ? cust.id : undefined,
      status: OrderStatus.COMPLETED,
      totalAmount: total,
      discountAmount: 0,
      items,
      createdAt: date.toISOString(),
      isReturn: false
    });

    // Update customer spent
    if (cust) {
        cust.totalSpent += total;
        cust.lastOrderDate = date.toISOString();
    }
  }
  return orders;
};

const MOCK_ORDERS: Order[] = generateOrders();

const MOCK_EXPENSES: Expense[] = [
    { id: 'ex1', tenantId: 't1', category: 'Rent', description: 'Shop Rent Oct', amount: 50000, date: getPastDate(20), recordedBy: 'Alice Admin' },
    { id: 'ex2', tenantId: 't1', category: 'Utilities', description: 'Electricity Bill', amount: 15000, date: getPastDate(15), recordedBy: 'Bob Manager' },
    { id: 'ex3', tenantId: 't1', category: 'Marketing', description: 'Facebook Ads', amount: 5000, date: getPastDate(5), recordedBy: 'Alice Admin' }
];

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', tenantId: 't1', title: 'Welcome to SaaS Nexus!', message: 'Your store has been set up successfully.', type: 'SUCCESS', read: false, createdAt: new Date().toISOString() },
    { id: 'n2', tenantId: 't1', title: 'Low Stock Alert', message: 'Smart Watch Series 9 is running low (3 units left).', type: 'WARNING', read: false, createdAt: getPastDate(1) }
];

const MOCK_STOCK_LOGS: StockLog[] = [];
const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];
const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'tx1', tenantId: 't1', tenantName: 'Acme Corp', amount: 17599, status: 'SUCCESS', date: getPastDate(365), method: 'Credit Card' }
];
const MOCK_SUBSCRIPTION_REQUESTS: SubscriptionRequest[] = [];

const MOCK_PLANS: Plan[] = [
  { 
    id: 'pl_mo', 
    name: 'Standard Monthly', 
    tier: SubscriptionTier.PRO_MONTHLY, 
    price: 2199, 
    period: 'Monthly',
    features: ['Up to 150 Products', 'Advanced Analytics', '2 Users', 'Standard Support'], 
    maxUsers: 2, 
    maxProducts: 150,
    description: 'Perfect for small businesses starting out.'
  },
  { 
    id: 'pl_qt', 
    name: 'Quarterly Saver', 
    tier: SubscriptionTier.PRO_QUARTERLY, 
    price: 5499, 
    period: 'Quarterly',
    features: ['Up to 300 Products', 'Save ~16%', '5 Users', 'Priority Support'], 
    maxUsers: 5, 
    maxProducts: 300,
    description: 'Best value for growing businesses.',
    highlight: true
  },
  { 
    id: 'pl_yr', 
    name: 'Yearly Power', 
    tier: SubscriptionTier.PRO_YEARLY, 
    price: 17599, 
    period: 'Yearly',
    features: ['Up to 1000 Products', '10 Users', 'Dedicated Account Manager', '20% Extra Discount'], 
    maxUsers: 10, 
    maxProducts: 1000,
    description: 'Maximum savings for established enterprises.'
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDb = {
  getTenants: async (): Promise<Tenant[]> => {
    await delay(300);
    return MOCK_TENANTS.filter(t => t.status !== TenantStatus.SUSPENDED);
  },
  
  getAllTenants: async (): Promise<Tenant[]> => {
    await delay(300);
    return MOCK_TENANTS;
  },

  getTenantDetails: async (tenantId: string): Promise<TenantDetails | null> => {
    await delay(500);
    
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
    if (!tenant) return null;

    const products = MOCK_PRODUCTS.filter(p => p.tenantId === tenantId);
    const orders = MOCK_ORDERS.filter(o => o.tenantId === tenantId);
    const customers = MOCK_CUSTOMERS.filter(c => c.tenantId === tenantId);
    const users = MOCK_USERS.filter(u => u.tenantId === tenantId);

    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    const lifetimeRevenue = orders
        .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED)
        .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
        tenant,
        stats: {
            totalProducts: products.length,
            inventoryValue,
            totalOrders: orders.length,
            lifetimeRevenue,
            totalCustomers: customers.length,
            totalStaff: users.length
        },
        recentOrders: orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
        topProducts: products.slice(0, 10) 
    };
  },

  updateTenantStatus: async (id: string, status: TenantStatus): Promise<void> => {
    await delay(300);
    const tenant = MOCK_TENANTS.find(t => t.id === id);
    if (tenant) tenant.status = status;
  },

  getTenantProducts: async (tenantId: string): Promise<Product[]> => {
    await delay(200);
    return MOCK_PRODUCTS.filter(p => p.tenantId === tenantId);
  },

  getTenantCategories: async (tenantId: string): Promise<Category[]> => {
    await delay(200);
    return MOCK_CATEGORIES.filter(c => c.tenantId === tenantId);
  },

  getTenantStockLogs: async (tenantId: string): Promise<StockLog[]> => {
    await delay(200);
    return MOCK_STOCK_LOGS.filter(l => l.tenantId === tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getTenantOrders: async (tenantId: string): Promise<Order[]> => {
    await delay(200);
    return MOCK_ORDERS.filter(o => o.tenantId === tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createOrder: async (order: Partial<Order>): Promise<Order> => {
    await delay(300);
    const newOrder = { 
      ...order, 
      id: `ord_${Date.now()}`, 
      createdAt: new Date().toISOString() 
    } as Order;
    MOCK_ORDERS.push(newOrder);
    return newOrder;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    await delay(300);
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    if (order) order.status = status;
  },

  getTenantUsers: async (tenantId: string): Promise<User[]> => {
    await delay(200);
    return MOCK_USERS.filter(u => u.tenantId === tenantId);
  },

  addTenantUser: async (user: Partial<User> & { password?: string }): Promise<User> => {
    await delay(400);
    const newUser: MockUser = {
        id: `u${Date.now()}`,
        tenantId: user.tenantId!,
        name: user.name || 'New User',
        email: user.email!,
        password: user.password || 'password123', 
        role: user.role || Role.USER,
        permissions: user.permissions || [],
        pin: '1234', 
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`,
        createdAt: new Date().toISOString()
    };
    MOCK_USERS.push(newUser);
    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<void> => {
      await delay(300);
      const user = MOCK_USERS.find(u => u.id === id);
      if (user) {
          Object.assign(user, updates);
      }
  },

  updateUserPassword: async (adminId: string, targetUserId: string, newPass: string): Promise<void> => {
      await delay(400);
      const admin = MOCK_USERS.find(u => u.id === adminId);
      if(!admin || (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)) {
          throw new Error("Unauthorized: Only Admins can change passwords");
      }
      
      const targetUser = MOCK_USERS.find(u => u.id === targetUserId);
      if(targetUser) {
          targetUser.password = newPass;
      } else {
          throw new Error("User not found");
      }
  },

  updateUserPin: async (adminId: string, targetUserId: string, newPin: string): Promise<void> => {
      await delay(400);
      const admin = MOCK_USERS.find(u => u.id === adminId);
      if(!admin || (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)) {
          throw new Error("Unauthorized: Only Admins can reset PINs");
      }
      
      const targetUser = MOCK_USERS.find(u => u.id === targetUserId);
      if(targetUser) {
          targetUser.pin = newPin;
      }
  },

  removeTenantUser: async (userId: string): Promise<void> => {
      await delay(300);
      const idx = MOCK_USERS.findIndex(u => u.id === userId);
      if(idx !== -1) MOCK_USERS.splice(idx, 1);
  },

  updateTenant: async (id: string, updates: Partial<Tenant>): Promise<Tenant> => {
      await delay(300);
      const tenant = MOCK_TENANTS.find(t => t.id === id);
      if(!tenant) throw new Error("Tenant not found");
      Object.assign(tenant, updates);
      return tenant;
  },

  getTenantSettings: async (tenantId: string): Promise<Settings> => {
     await delay(200);
     const settings = MOCK_SETTINGS.find(s => s.tenantId === tenantId);
     if (settings) return settings;
     return {
         id: `s_${Date.now()}`,
         tenantId,
         currency: 'PKR',
         timezone: 'Asia/Karachi',
         theme: 'light',
         taxRate: 0,
         showLogoOnReceipt: true,
         showCashierOnReceipt: true,
         showCustomerOnReceipt: true,
         showTaxBreakdown: true,
         showBarcode: true,
         receiptWidth: '80mm',
         receiptTemplate: 'modern',
         receiptFontSize: 12,
         receiptMargin: 10
     };
  },

  updateTenantSettings: async (tenantId: string, updates: Partial<Settings>): Promise<Settings> => {
      await delay(300);
      let settings = MOCK_SETTINGS.find(s => s.tenantId === tenantId);
      if (!settings) {
          settings = {
              id: `s_${Date.now()}`,
              tenantId,
              currency: 'PKR',
              timezone: 'Asia/Karachi',
              theme: 'light',
              taxRate: 0,
              showLogoOnReceipt: true,
              showCashierOnReceipt: true,
              showCustomerOnReceipt: true,
              showTaxBreakdown: true,
              showBarcode: true,
              receiptWidth: '80mm',
              receiptTemplate: 'modern',
              receiptFontSize: 12,
              receiptMargin: 10,
              ...updates
          } as Settings;
          MOCK_SETTINGS.push(settings);
      } else {
          Object.assign(settings, updates);
      }
      return settings;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    await delay(300);
    return MOCK_TRANSACTIONS;
  },

  getPlans: async (): Promise<Plan[]> => {
    return MOCK_PLANS;
  },

  createSubscriptionRequest: async (req: Partial<SubscriptionRequest>): Promise<void> => {
    await delay(500);
    MOCK_SUBSCRIPTION_REQUESTS.push({
      id: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      tenantId: req.tenantId!,
      tenantName: req.tenantName!,
      planId: req.planId!,
      planName: req.planName!,
      amount: req.amount!,
      paymentMethod: req.paymentMethod || 'Manual Transfer',
      proofUrl: req.proofUrl || ''
    });
    
    const tenant = MOCK_TENANTS.find(t => t.id === req.tenantId);
    if(tenant) tenant.subscriptionStatus = 'PENDING_APPROVAL';
  },

  getSubscriptionRequests: async (): Promise<SubscriptionRequest[]> => {
    await delay(300);
    return MOCK_SUBSCRIPTION_REQUESTS.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  approveSubscription: async (requestId: string): Promise<void> => {
    await delay(500);
    const req = MOCK_SUBSCRIPTION_REQUESTS.find(r => r.id === requestId);
    if (!req) return;
    
    req.status = 'APPROVED';
    
    const tenant = MOCK_TENANTS.find(t => t.id === req.tenantId);
    if (tenant) {
      tenant.subscriptionStatus = 'ACTIVE';
      const plan = MOCK_PLANS.find(p => p.id === req.planId);
      tenant.subscriptionTier = plan ? plan.tier : SubscriptionTier.PRO_MONTHLY;
      
      const now = new Date();
      if (req.planName.includes('Monthly')) now.setMonth(now.getMonth() + 1);
      else if (req.planName.includes('Quarterly')) now.setMonth(now.getMonth() + 3);
      else if (req.planName.includes('Yearly')) now.setFullYear(now.getFullYear() + 1);
      
      tenant.subscriptionExpiry = now.toISOString();
      tenant.status = TenantStatus.ACTIVE;
    }

    MOCK_TRANSACTIONS.push({
      id: `tx_${Date.now()}`,
      tenantId: req.tenantId,
      tenantName: req.tenantName,
      amount: req.amount,
      status: 'SUCCESS',
      date: new Date().toISOString(),
      method: req.paymentMethod
    });
  },

  rejectSubscription: async (requestId: string): Promise<void> => {
    await delay(300);
    const req = MOCK_SUBSCRIPTION_REQUESTS.find(r => r.id === requestId);
    if(req) req.status = 'REJECTED';
    
    const tenant = MOCK_TENANTS.find(t => t.id === req?.tenantId);
    if (tenant && tenant.subscriptionStatus === 'PENDING_APPROVAL') {
       tenant.subscriptionStatus = 'EXPIRED';
    }
  },

  getTenantSuppliers: async (tenantId: string): Promise<Supplier[]> => {
    await delay(200);
    return MOCK_SUPPLIERS.filter(s => s.tenantId === tenantId);
  },
  
  createSupplier: async (supplier: Partial<Supplier>): Promise<Supplier> => {
    await delay(300);
    const newSupplier = { ...supplier, id: `sup${Date.now()}` } as Supplier;
    MOCK_SUPPLIERS.push(newSupplier);
    return newSupplier;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await delay(300);
    const idx = MOCK_SUPPLIERS.findIndex(s => s.id === id);
    if (idx !== -1) MOCK_SUPPLIERS.splice(idx, 1);
  },

  getTenantCustomers: async (tenantId: string): Promise<Customer[]> => {
    await delay(200);
    return MOCK_CUSTOMERS.filter(c => c.tenantId === tenantId);
  },

  createCustomer: async (customer: Partial<Customer>): Promise<Customer> => {
    await delay(300);
    const newCustomer = { 
      ...customer, 
      id: `cus${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalSpent: 0
    } as Customer;
    MOCK_CUSTOMERS.push(newCustomer);
    return newCustomer;
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    await delay(300);
    const customer = MOCK_CUSTOMERS.find(c => c.id === id);
    if (!customer) throw new Error("Customer not found");
    Object.assign(customer, updates);
    return customer;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await delay(300);
    const idx = MOCK_CUSTOMERS.findIndex(c => c.id === id);
    if (idx !== -1) MOCK_CUSTOMERS.splice(idx, 1);
  },

  getTenantNotifications: async (tenantId: string): Promise<Notification[]> => {
    await delay(200);
    return MOCK_NOTIFICATIONS.filter(n => n.tenantId === tenantId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await delay(100);
    const note = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (note) note.read = true;
  },

  markAllNotificationsRead: async (tenantId: string): Promise<void> => {
     await delay(200);
     MOCK_NOTIFICATIONS.forEach(n => {
       if (n.tenantId === tenantId) n.read = true;
     });
  },

  getTenantPurchaseOrders: async (tenantId: string): Promise<PurchaseOrder[]> => {
    await delay(200);
    return MOCK_PURCHASE_ORDERS.filter(po => po.tenantId === tenantId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createPurchaseOrder: async (po: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    await delay(400);
    const newPO = { ...po, id: `po${Date.now()}`, createdAt: new Date().toISOString() } as PurchaseOrder;
    MOCK_PURCHASE_ORDERS.push(newPO);
    return newPO;
  },

  updatePurchaseOrderStatus: async (id: string, status: PurchaseOrderStatus): Promise<void> => {
    await delay(300);
    const po = MOCK_PURCHASE_ORDERS.find(p => p.id === id);
    if (!po) return;
    po.status = status;
  },

  getTenantExpenses: async (tenantId: string): Promise<Expense[]> => {
    await delay(200);
    return MOCK_EXPENSES.filter(e => e.tenantId === tenantId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createExpense: async (expense: Partial<Expense>): Promise<Expense> => {
    await delay(300);
    const newExpense = { ...expense, id: `ex${Date.now()}`, date: expense.date || new Date().toISOString() } as Expense;
    MOCK_EXPENSES.push(newExpense);
    return newExpense;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await delay(300);
    const idx = MOCK_EXPENSES.findIndex(e => e.id === id);
    if (idx !== -1) MOCK_EXPENSES.splice(idx, 1);
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    await delay(400);
    const newProduct: Product = {
      id: `p${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      tenantId: product.tenantId || 't1',
      name: product.name || 'New Product',
      description: product.description || '',
      sku: product.sku || `SKU-${Date.now()}`,
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || 'General',
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      imageUrl: product.imageUrl || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/300/200`,
      lowStockThreshold: product.lowStockThreshold || 10
    };
    MOCK_PRODUCTS.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    await delay(300);
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    const newProduct = { ...MOCK_PRODUCTS[index], ...updates };
    MOCK_PRODUCTS[index] = newProduct;
    return newProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(300);
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index !== -1) MOCK_PRODUCTS.splice(index, 1);
  },

  createCategory: async (category: Partial<Category>): Promise<Category> => {
    await delay(300);
    const newCategory: Category = {
       id: `c${Date.now()}`,
       tenantId: category.tenantId || 't1',
       name: category.name || 'New Category',
       description: category.description || '',
       productCount: 0
    };
    MOCK_CATEGORIES.push(newCategory);
    return newCategory;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await delay(300);
    const index = MOCK_CATEGORIES.findIndex(c => c.id === id);
    if (index !== -1) MOCK_CATEGORIES.splice(index, 1);
  },

  authenticate: async (email: string, password?: string): Promise<{ user: User; tenant: Tenant } | null> => {
    await delay(600);
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    
    if (password && user.password !== password) return null;

    const tenant = MOCK_TENANTS.find(t => t.id === user.tenantId);
    if (!tenant) return null;

    tenant.lastActivityAt = new Date().toISOString();

    const { password: _, ...safeUser } = user;
    return { user: safeUser, tenant };
  },

  registerTenant: async (
    companyName: string, 
    adminName: string, 
    adminEmail: string
  ): Promise<{ user: User; tenant: Tenant }> => {
    await delay(800);
    
    const newTenant: Tenant = {
      id: `t${Date.now()}`,
      name: companyName,
      slug: companyName.toLowerCase().replace(/\s+/g, '-'),
      subscriptionTier: SubscriptionTier.FREE,
      subscriptionStatus: 'ACTIVE',
      status: TenantStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };
    MOCK_TENANTS.push(newTenant);
    MOCK_SETTINGS.push({
       id: `s_${Date.now()}`,
       tenantId: newTenant.id,
       currency: 'PKR',
       timezone: 'Asia/Karachi',
       theme: 'light',
       taxRate: 0,
       showLogoOnReceipt: true,
       showCashierOnReceipt: true,
       showCustomerOnReceipt: true,
       showTaxBreakdown: true,
       showBarcode: true,
       receiptWidth: '80mm',
       receiptTemplate: 'modern',
       receiptFontSize: 12,
       receiptMargin: 10
    });

    const newUser: MockUser = {
      id: `u${Date.now()}`,
      tenantId: newTenant.id,
      name: adminName,
      email: adminEmail,
      password: 'password', 
      role: Role.ADMIN,
      permissions: ALL_PERMISSIONS,
      pin: '1234',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=random`,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);

    const { password, ...safeUser } = newUser;
    return { user: safeUser, tenant: newTenant };
  },

  runRetentionPolicy: async (): Promise<{ deleted: string[], warned: string[] }> => {
    const NOW = new Date().getTime();
    const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    const WARNING_THRESHOLD = 5 * MONTH_MS; 
    const DELETION_THRESHOLD = 6 * MONTH_MS; 

    const deletedTenants: string[] = [];
    const warnedTenants: string[] = [];

    for (let i = MOCK_TENANTS.length - 1; i >= 0; i--) {
        const tenant = MOCK_TENANTS[i];
        
        const lastActive = new Date(tenant.lastActivityAt || tenant.createdAt).getTime();
        const inactiveDuration = NOW - lastActive;

        const isTrial = tenant.subscriptionTier === SubscriptionTier.FREE;
        const isTrialExpired = isTrial && tenant.subscriptionExpiry && new Date(tenant.subscriptionExpiry).getTime() < NOW;
        
        if (inactiveDuration > DELETION_THRESHOLD || (isTrialExpired && inactiveDuration > MONTH_MS)) {
            console.log(`[RETENTION] Deleting Tenant: ${tenant.name} (${tenant.id}) due to inactivity.`);
            await mockDb.hardDeleteTenant(tenant.id);
            deletedTenants.push(tenant.name);
        } 
        else if (inactiveDuration > WARNING_THRESHOLD && !tenant.retentionWarningSent) {
            console.log(`[RETENTION] Sending Warning to: ${tenant.name} (${tenant.email})`);
            tenant.retentionWarningSent = true;
            warnedTenants.push(tenant.name);
        }
    }

    return { deleted: deletedTenants, warned: warnedTenants };
  },

  hardDeleteTenant: async (tenantId: string): Promise<void> => {
      const tenantProducts = MOCK_PRODUCTS.filter(p => p.tenantId === tenantId);
      tenantProducts.forEach(p => {
          if (p.imageUrl && p.imageUrl.includes('cloudinary')) {
              console.log(`[CLOUDINARY] Destroying image asset for product: ${p.id}`);
          }
      });

      const remove = <T extends { tenantId: string }>(arr: T[]) => {
          for (let i = arr.length - 1; i >= 0; i--) {
              if (arr[i].tenantId === tenantId) arr.splice(i, 1);
          }
      };

      remove(MOCK_PRODUCTS);
      remove(MOCK_ORDERS);
      remove(MOCK_USERS);
      remove(MOCK_CUSTOMERS);
      remove(MOCK_SUPPLIERS);
      remove(MOCK_STOCK_LOGS);
      remove(MOCK_EXPENSES);
      remove(MOCK_NOTIFICATIONS);
      
      const sIdx = MOCK_SETTINGS.findIndex(s => s.tenantId === tenantId);
      if (sIdx !== -1) MOCK_SETTINGS.splice(sIdx, 1);

      const tIdx = MOCK_TENANTS.findIndex(t => t.id === tenantId);
      if (tIdx !== -1) MOCK_TENANTS.splice(tIdx, 1);
  }
};