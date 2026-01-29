import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Product, Category, StockLog } from '../models/Schemas';

// --- Products ---
export const getProducts = async (req: any, res: any) => {
  try {
    const products = await Product.find({ tenantId: req.user.tenantId });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: any, res: any) => {
  try {
    const product = await Product.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: any, res: any) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: any, res: any) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Categories ---
export const getCategories = async (req: any, res: any) => {
  try {
    const categories = await Category.find({ tenantId: req.user.tenantId });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: any, res: any) => {
  try {
    const category = await Category.create({ ...req.body, tenantId: req.user.tenantId });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req: any, res: any) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: 'Category removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Stock Logs ---
export const getStockLogs = async (req: any, res: any) => {
  try {
    const logs = await StockLog.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};