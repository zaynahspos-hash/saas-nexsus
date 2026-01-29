import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Expense, Supplier, Customer, PurchaseOrder, Product, StockLog } from '../models/Schemas';

// --- Expenses ---
export const getExpenses = async (req: any, res: any) => {
  const expenses = await Expense.find({ tenantId: req.user.tenantId }).sort({ date: -1 });
  res.json(expenses);
};

export const createExpense = async (req: any, res: any) => {
  const expense = await Expense.create({ ...req.body, tenantId: req.user.tenantId });
  res.status(201).json(expense);
};

export const deleteExpense = async (req: any, res: any) => {
  await Expense.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
  res.json({ message: 'Expense deleted' });
};

// --- Suppliers ---
export const getSuppliers = async (req: any, res: any) => {
  const suppliers = await Supplier.find({ tenantId: req.user.tenantId });
  res.json(suppliers);
};

export const createSupplier = async (req: any, res: any) => {
  const supplier = await Supplier.create({ ...req.body, tenantId: req.user.tenantId });
  res.status(201).json(supplier);
};

export const deleteSupplier = async (req: any, res: any) => {
  await Supplier.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
  res.json({ message: 'Supplier deleted' });
};

// --- Customers ---
export const getCustomers = async (req: any, res: any) => {
  const customers = await Customer.find({ tenantId: req.user.tenantId });
  res.json(customers);
};

export const createCustomer = async (req: any, res: any) => {
  const customer = await Customer.create({ ...req.body, tenantId: req.user.tenantId });
  res.status(201).json(customer);
};

export const updateCustomer = async (req: any, res: any) => {
  const customer = await Customer.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, req.body, { new: true });
  res.json(customer);
};

export const deleteCustomer = async (req: any, res: any) => {
  await Customer.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
  res.json({ message: 'Customer deleted' });
};

// --- Purchase Orders ---
export const getPurchaseOrders = async (req: any, res: any) => {
  const pos = await PurchaseOrder.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  res.json(pos);
};

export const createPurchaseOrder = async (req: any, res: any) => {
  const po = await PurchaseOrder.create({ ...req.body, tenantId: req.user.tenantId });
  res.status(201).json(po);
};

export const updatePurchaseOrderStatus = async (req: any, res: any) => {
  const { status } = req.body;
  const po = await PurchaseOrder.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  
  if (!po) return res.status(404).json({ message: 'PO not found' });

  // If receiving, add stock
  if (po.status !== 'RECEIVED' && status === 'RECEIVED') {
      for (const item of po.items) {
          if (item.productId) {
              const product = await Product.findOne({ _id: item.productId, tenantId: req.user.tenantId });
              if (product) {
                  product.stock += item.quantity || 0;
                  await product.save();

                  await StockLog.create({
                      tenantId: req.user.tenantId,
                      productId: product._id,
                      productName: product.name,
                      sku: product.sku,
                      changeAmount: item.quantity,
                      finalStock: product.stock,
                      type: 'IN',
                      reason: `PO Received #${po._id.toString().slice(-6)}`,
                      performedBy: req.user.name
                  });
              }
          }
      }
  }

  po.status = status;
  await po.save();
  res.json(po);
};