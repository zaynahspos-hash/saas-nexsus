import mongoose, { Schema, Document } from 'mongoose';

// --- Enums ---
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  SALESMAN = 'SALESMAN',
  USER = 'USER'
}

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

// --- Tenant Schema ---
const TenantSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: { type: String },
  subscriptionTier: { type: String, enum: Object.values(SubscriptionTier), default: SubscriptionTier.FREE },
  subscriptionStatus: { type: String, enum: ['ACTIVE', 'EXPIRED', 'PENDING_APPROVAL'], default: 'ACTIVE' },
  subscriptionExpiry: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'PENDING', 'SUSPENDED'], default: 'ACTIVE' },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Tenant = mongoose.model('Tenant', TenantSchema);

// --- User Schema ---
const UserSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Index unique globally
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: Object.values(Role), default: Role.USER },
  permissions: [{ type: String }],
  avatarUrl: { type: String },
  pin: { type: String }, // Encrypted ideally, simple string for MVP
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

// --- Settings Schema ---
const SettingsSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'UTC' },
  theme: { type: String, default: 'light' },
  taxRate: { type: Number, default: 0 },
  receiptHeader: String,
  receiptFooter: String,
  showLogoOnReceipt: { type: Boolean, default: true },
  showCashierOnReceipt: { type: Boolean, default: true },
  showCustomerOnReceipt: { type: Boolean, default: true },
  showTaxBreakdown: { type: Boolean, default: true },
  showBarcode: { type: Boolean, default: true },
  receiptWidth: { type: String, default: '80mm' },
  receiptTemplate: { type: String, default: 'modern' },
  
  // Barcode Settings
  barcodeFormat: { type: String, default: 'CODE128' },
  barcodeGenerationStrategy: { type: String, default: 'SEQUENTIAL' },
  barcodePrefixType: { type: String, default: 'NONE' },
  barcodeCustomPrefix: String,
  barcodeNextSequence: { type: Number, default: 1000 },
  barcodeLabelFormat: { type: String, default: 'A4_30' },
  barcodeShowPrice: { type: Boolean, default: true },
  barcodeShowName: { type: Boolean, default: true }
}, { timestamps: true });

export const Settings = mongoose.model('Settings', SettingsSchema);

// --- Product Schema ---
const ProductSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  costPrice: { type: Number },
  stock: { type: Number, default: 0 },
  category: { type: String },
  categoryId: { type: String },
  supplierId: { type: String },
  imageUrl: { type: String },
  lowStockThreshold: { type: Number, default: 5 }
}, { timestamps: true });

ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

export const Product = mongoose.model('Product', ProductSchema);

// --- Category Schema ---
const CategorySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

export const Category = mongoose.model('Category', CategorySchema);

// --- Stock Log Schema ---
const StockLogSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  productId: { type: String, required: true },
  productName: String,
  sku: String,
  changeAmount: { type: Number, required: true },
  finalStock: { type: Number, required: true },
  type: { type: String, required: true }, // SALE, RETURN, IN, OUT, ADJUSTMENT
  reason: String,
  performedBy: String
}, { timestamps: true });

export const StockLog = mongoose.model('StockLog', StockLogSchema);

// --- Order Schema ---
const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  priceAtTime: { type: Number, required: true },
  costAtTime: { type: Number },
  type: { type: String, enum: ['SALE', 'RETURN'], default: 'SALE' }
});

const OrderSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: String, required: true },
  salespersonId: String,
  salespersonName: String,
  customerName: String,
  customerId: String,
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['PERCENT', 'FIXED'] },
  items: [OrderItemSchema],
  isReturn: { type: Boolean, default: false }
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);

// --- Customer Schema ---
const CustomerSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  address: String,
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: Date
}, { timestamps: true });

export const Customer = mongoose.model('Customer', CustomerSchema);

// --- Supplier Schema ---
const SupplierSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  contactPerson: String,
  email: String,
  phone: String,
  address: String
}, { timestamps: true });

export const Supplier = mongoose.model('Supplier', SupplierSchema);

// --- Expense Schema ---
const ExpenseSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  category: String,
  description: String,
  amount: Number,
  date: Date,
  recordedBy: String
}, { timestamps: true });

export const Expense = mongoose.model('Expense', ExpenseSchema);

// --- Purchase Order Schema ---
const PurchaseOrderItemSchema = new Schema({
  productId: String,
  productName: String,
  quantity: Number,
  unitCost: Number,
  totalCost: Number
});

const PurchaseOrderSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  supplierId: String,
  supplierName: String,
  status: { type: String, enum: ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'], default: 'DRAFT' },
  items: [PurchaseOrderItemSchema],
  totalAmount: Number,
  expectedDate: Date
}, { timestamps: true });

export const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);

// --- Notification Schema ---
const NotificationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: String,
  message: String,
  type: { type: String, enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'], default: 'INFO' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', NotificationSchema);
