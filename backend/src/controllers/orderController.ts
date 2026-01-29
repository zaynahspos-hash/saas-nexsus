import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Order, Product, StockLog, Customer } from '../models/Schemas';

export const getOrders = async (req: any, res: any) => {
  try {
    const orders = await Order.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req: any, res: any) => {
  try {
    // 1. Create Order
    const order = await Order.create({ ...req.body, tenantId: req.user.tenantId });

    // 2. Handle Inventory & Stock Logs if Status determines stock movement
    // Usually stock is deducted immediately upon completion or valid creation
    if (order.status === 'COMPLETED' || order.status === 'PROCESSING') {
        for (const item of order.items) {
            const product = await Product.findOne({ _id: item.productId, tenantId: req.user.tenantId });
            
            if (product) {
                // Determine change direction
                const isReturn = item.type === 'RETURN';
                const quantityChange = isReturn ? item.quantity : -item.quantity;
                
                // Update Stock
                product.stock += quantityChange;
                await product.save();

                // Log Movement
                await StockLog.create({
                    tenantId: req.user.tenantId,
                    productId: product._id,
                    productName: product.name,
                    sku: product.sku,
                    changeAmount: quantityChange,
                    finalStock: product.stock,
                    type: isReturn ? 'RETURN' : 'SALE',
                    reason: `Order #${order._id.toString().slice(-6)}`,
                    performedBy: req.user.name
                });
            }
        }
    }

    // 3. Update Customer Spending
    if (order.customerId) {
        const customer = await Customer.findOne({ _id: order.customerId, tenantId: req.user.tenantId });
        if (customer) {
            customer.totalSpent += order.totalAmount;
            customer.lastOrderDate = new Date();
            await customer.save();
        }
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: 'Order creation failed', error: error.message });
  }
};

export const updateOrderStatus = async (req: any, res: any) => {
    try {
        const { status } = req.body;
        const order = await Order.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
        
        if (!order) return res.status(404).json({ message: "Order not found" });

        const previousStatus = order.status;
        order.status = status;
        await order.save();

        // Handle Stock Restoration if cancelling a previously valid order
        if ((previousStatus === 'COMPLETED' || previousStatus === 'PROCESSING') && (status === 'CANCELLED' || status === 'RETURNED')) {
             for (const item of order.items) {
                // Only restore stock if it was a SALE. If it was a RETURN order, cancelling means we gave money back but didn't get item, complex.. assuming SALE restoration here.
                if (item.type === 'SALE') {
                    const product = await Product.findOne({ _id: item.productId, tenantId: req.user.tenantId });
                    if (product) {
                        product.stock += item.quantity; // Add back
                        await product.save();
                        
                        await StockLog.create({
                            tenantId: req.user.tenantId,
                            productId: product._id,
                            productName: product.name,
                            sku: product.sku,
                            changeAmount: item.quantity,
                            finalStock: product.stock,
                            type: status === 'RETURNED' ? 'RETURN' : 'ADJUSTMENT',
                            reason: `Order ${status} #${order._id.toString().slice(-6)}`,
                            performedBy: req.user.name
                        });
                    }
                }
             }
        }

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};