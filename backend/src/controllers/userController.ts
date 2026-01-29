import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';
import { User, Role } from '../models/Schemas';

export const getUsers = async (req: any, res: any) => {
  // Return users for this tenant, excluding passwords
  const users = await User.find({ tenantId: req.user.tenantId }).select('-password');
  res.json(users);
};

export const inviteUser = async (req: any, res: any) => {
  const { name, email, password, role, permissions } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      tenantId: req.user.tenantId,
      name,
      email,
      password: hashedPassword,
      role: role || Role.CASHIER,
      permissions: permissions || [],
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: any, res: any) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: 'User removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req: any, res: any) => {
  try {
    const { role, permissions } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { role, permissions },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserPin = async (req: any, res: any) => {
  try {
    const { pin } = req.body;
    // In a real app, encrypt the PIN
    await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { pin },
      { new: true }
    );
    res.json({ message: 'PIN updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};