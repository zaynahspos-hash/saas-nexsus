import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Tenant, Settings, Role, SubscriptionTier } from '../models/Schemas';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const registerTenant = async (req: Request, res: Response) => {
  const { companyName, adminName, email, password } = req.body;

  if (!companyName || !adminName || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    // 1. Create Tenant
    const tenant = await Tenant.create({
      name: companyName,
      slug: companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      subscriptionTier: SubscriptionTier.FREE,
      subscriptionStatus: 'ACTIVE'
    });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create Admin User
    const user = await User.create({
      tenantId: tenant._id,
      name: adminName,
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      permissions: ['VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_USERS', 'MANAGE_SETTINGS']
    });

    // 4. Create Default Settings
    await Settings.create({ tenantId: tenant._id });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: tenant._id,
      token: generateToken(user.id),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user: any = await User.findOne({ email });
  
  if (user && (await bcrypt.compare(password, user.password))) {
    // Update last activity
    await Tenant.findByIdAndUpdate(user.tenantId, { lastActivityAt: new Date() });

    const tenant = await Tenant.findById(user.tenantId);

    res.json({
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl
      },
      tenant: tenant,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

export const getMe = async (req: any, res: Response) => {
  res.status(200).json({ user: req.user, tenant: req.tenant });
};