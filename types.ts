/**
 * This file mirrors the requested schema.prisma models as TypeScript interfaces
 * for the frontend application.
 */

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  SALESMAN = 'SALESMAN',
  USER = 'USER'
}

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'POS_ACCESS'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_ORDERS'
  | 'MANAGE_USERS'
  | 'MANAGE_SETTINGS'
  | 'VIEW_REPORTS'
  | 'MANAGE_SUPPLIERS'
  | 'MANAGE_EXPENSES'
  | 'MANAGE_CUSTOMERS';

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO_MONTHLY = 'PRO_MONTHLY',
  PRO_QUARTERLY = 'PRO_QUARTERLY',
  PRO_YEARLY = 'PRO_YEARLY',
  ENTERPRISE = 'ENTERPRISE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'PENDING_APPROVAL';
  subscriptionExpiry?: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  // Data Retention Fields
  lastActivityAt: string; // Tracks the last time a user from this tenant logged in
  retentionWarningSent?: boolean; // Has the 6-month warning email been sent?
  // Store Profile
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

// Aggregated Data for Super Admin View
export interface TenantDetails {
  tenant: Tenant;
  stats: {
    totalProducts: number;
    inventoryValue: number;
    totalOrders: number;
    lifetimeRevenue: number;
    totalCustomers: number;
    totalStaff: number;
  };
  recentOrders: Order[];
  topProducts: Product[]; // For image gallery
}

export interface SubscriptionRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  amount: number;
  paymentMethod: string; // 'JazzCash' | 'EasyPaisa' | 'Nayapay'
  proofUrl: string; // Screenshot URL
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[]; // Granular access control
  avatarUrl?: string;
  pin?: string; // 4-Digit Security PIN for POS actions
  createdAt: string;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  productCount: number;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email?: string; // Optional
  phone: string;
  address: string;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  costPrice?: number; // Added for profit calculation
  stock: number;
  category: string; 
  categoryId?: string;
  supplierId?: string; 
  imageUrl?: string;
  lowStockThreshold?: number;
  createdAt: string;
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  SALE = 'SALE',
  RETURN = 'RETURN'
}

export interface StockLog {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  sku: string;
  changeAmount: number;
  finalStock: number;
  type: StockMovementType;
  reason?: string;
  performedBy: string;
  createdAt: string;
}

export type OrderItemType = 'SALE' | 'RETURN';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
  costAtTime?: number; // To track historical profit
  productName: string;
  type: OrderItemType; // Added for mixed cart support
}

export interface Order {
  id: string;
  tenantId: string;
  userId: string; // The system user who created the record
  salespersonId?: string; // Specific attribution (Salesman/Cashier)
  salespersonName?: string;
  customerName: string;
  customerId?: string; 
  status: OrderStatus;
  totalAmount: number;
  discountAmount?: number;
  discountType?: 'PERCENT' | 'FIXED';
  items: OrderItem[];
  createdAt: string;
  isReturn?: boolean;
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  ORDERED = 'ORDERED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdAt: string;
  expectedDate?: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recordedBy: string;
}

export type ReceiptTemplate = 'classic' | 'modern' | 'minimal' | 'bold';
export type ReceiptWidth = '58mm' | '80mm' | 'A4';

export type BarcodeFormat = 'CODE128' | 'CODE39';
export type BarcodeGenerationType = 'SEQUENTIAL' | 'RANDOM' | 'COMPOSITE';
export type BarcodePrefixType = 'NONE' | 'CATEGORY' | 'NAME' | 'CUSTOM';
export type LabelFormat = 'A4_30' | 'THERMAL_50x30' | 'THERMAL_40x20';

export interface Settings {
  id: string;
  tenantId: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark';
  taxRate: number; 
  
  // Receipt Content
  receiptHeader?: string;
  receiptFooter?: string;
  showLogoOnReceipt: boolean;
  showCashierOnReceipt?: boolean;
  showCustomerOnReceipt?: boolean;
  showTaxBreakdown?: boolean;
  showBarcode?: boolean;

  // Receipt Styling
  receiptWidth?: ReceiptWidth;
  receiptTemplate?: ReceiptTemplate;
  receiptFontSize?: number; // Base font size (pt)
  receiptMargin?: number; // Padding (mm)

  // Barcode Settings
  barcodeFormat?: BarcodeFormat;
  barcodeGenerationStrategy?: BarcodeGenerationType;
  barcodePrefixType?: BarcodePrefixType;
  barcodeCustomPrefix?: string;
  barcodeNextSequence?: number; // For sequential generation
  barcodeLabelFormat?: LabelFormat;
  barcodeShowPrice?: boolean;
  barcodeShowName?: boolean;
}

export interface Transaction {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  date: string;
  method: string;
}

export interface Plan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  period: 'Monthly' | 'Quarterly' | 'Yearly';
  features: string[];
  maxUsers: number;
  maxProducts: number;
  description: string;
  highlight?: boolean;
}

// Global Application State Interface
export interface AppState {
  currentTenant: Tenant | null;
  settings: Settings | null;
  user: User | null;
  tenants: Tenant[];
  users: User[];
  products: Product[];
  categories: Category[];
  stockLogs: StockLog[];
  orders: Order[];
  
  // Phase 3 Additions
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];

  // Phase 5 Additions
  customers: Customer[];
  notifications: Notification[];

  // Super Admin Data
  allTenants: Tenant[];
  transactions: Transaction[];
  plans: Plan[];
  subscriptionRequests: SubscriptionRequest[]; // New
  
  isLoading: boolean;
  searchQuery: string;
  theme: 'light' | 'dark';
}