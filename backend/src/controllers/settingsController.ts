import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Settings, Tenant, Order, Product, Customer } from '../models/Schemas';

export const getSettings = async (req: AuthRequest, res: Response) => {
  let settings = await Settings.findOne({ tenantId: req.user.tenantId });
  if (!settings) {
    settings = await Settings.create({ tenantId: req.user.tenantId });
  }
  res.json(settings);
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  const settings = await Settings.findOneAndUpdate(
    { tenantId: req.user.tenantId },
    req.body,
    { new: true, upsert: true }
  );
  res.json(settings);
};

export const updateTenantProfile = async (req: AuthRequest, res: Response) => {
  const tenant = await Tenant.findByIdAndUpdate(
    req.user.tenantId,
    req.body,
    { new: true }
  );
  res.json(tenant);
};

// Dashboard Stats Aggregation
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user.tenantId;
        
        const [productCount, orderCount, customerCount, orders] = await Promise.all([
            Product.countDocuments({ tenantId }),
            Order.countDocuments({ tenantId }),
            Customer.countDocuments({ tenantId }),
            Order.find({ tenantId }).select('totalAmount status createdAt')
        ]);

        const totalRevenue = orders
            .filter(o => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        // Simple recent orders for charts
        const recentOrders = orders
            .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);

        res.json({
            productCount,
            orderCount,
            customerCount,
            totalRevenue,
            recentOrders
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
