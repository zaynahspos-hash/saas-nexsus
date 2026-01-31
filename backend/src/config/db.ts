import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Tenant, Settings, Product, Role, SubscriptionTier } from '../models/Schemas';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.warn('⚠️ MONGO_URI is not defined. Database connection skipped.');
        return;
    }
    
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Run Seeder if DB is empty
    await seedDatabaseIfNeeded();

  } catch (error: any) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Do not exit process on Render, allows checking logs
  }
};

const seedDatabaseIfNeeded = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('🌱 Database is empty. Seeding demo data...');

    // 1. Create Demo Tenant
    const tenant = await Tenant.create({
      name: 'Acme Corp',
      slug: 'acme-corp',
      subscriptionTier: SubscriptionTier.PRO_YEARLY,
      subscriptionStatus: 'ACTIVE',
      status: 'ACTIVE',
      email: 'contact@acme.com',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    });

    // 2. Create Demo Settings
    await Settings.create({
      tenantId: tenant._id,
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      taxRate: 0.05
    });

    // 3. Create Demo Admin (Alice)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt); // Demo password

    await User.create({
      tenantId: tenant._id,
      name: 'Alice Admin',
      email: 'alice@acme.com',
      password: hashedPassword,
      role: Role.ADMIN,
      permissions: ['VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_USERS', 'MANAGE_SETTINGS'],
      avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Admin&background=6366f1&color=fff'
    });

    // 4. Create Demo Super Admin (Tony)
    const superUserHash = await bcrypt.hash('password', salt);
    const superTenant = await Tenant.create({
        name: 'Stark Industries',
        slug: 'stark',
        subscriptionTier: SubscriptionTier.ENTERPRISE,
        status: 'ACTIVE'
    });

    await User.create({
        tenantId: superTenant._id,
        name: 'Tony Stark',
        email: 'tony@stark.com',
        password: superUserHash,
        role: Role.SUPER_ADMIN,
        permissions: [],
        avatarUrl: 'https://ui-avatars.com/api/?name=Tony+Stark&background=f59e0b&color=fff'
    });

    // 5. Create Sample Products
    const products = [
      { name: 'iPhone 15 Pro', sku: 'IP15P', price: 350000, stock: 15, category: 'Electronics' },
      { name: 'AirPods Pro 2', sku: 'APP2', price: 65000, stock: 50, category: 'Accessories' },
      { name: 'Samsung S24', sku: 'S24', price: 320000, stock: 10, category: 'Electronics' }
    ];

    await Product.insertMany(products.map(p => ({ ...p, tenantId: tenant._id })));

    console.log('✅ Database seeded successfully with Demo Credentials: alice@acme.com / password');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};