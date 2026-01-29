import express from 'express';
import { registerTenant, loginUser, getMe } from '../controllers/authController';
import * as inventory from '../controllers/inventoryController';
import * as orders from '../controllers/orderController';
import * as finance from '../controllers/financeController';
import * as users from '../controllers/userController';
import * as settings from '../controllers/settingsController';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/signup', registerTenant);
router.post('/auth/login', loginUser);
router.get('/auth/me', protect, getMe);

// --- Inventory Routes ---
router.get('/products', protect, inventory.getProducts);
router.post('/products', protect, inventory.createProduct);
router.put('/products/:id', protect, inventory.updateProduct);
router.delete('/products/:id', protect, inventory.deleteProduct);

router.get('/categories', protect, inventory.getCategories);
router.post('/categories', protect, inventory.createCategory);
router.delete('/categories/:id', protect, inventory.deleteCategory);

router.get('/stock-logs', protect, inventory.getStockLogs);

// --- Order Routes ---
router.get('/orders', protect, orders.getOrders);
router.post('/orders', protect, orders.createOrder);
router.put('/orders/:id/status', protect, orders.updateOrderStatus);

// --- Finance & CRM Routes ---
router.get('/customers', protect, finance.getCustomers);
router.post('/customers', protect, finance.createCustomer);
router.put('/customers/:id', protect, finance.updateCustomer);
router.delete('/customers/:id', protect, finance.deleteCustomer);

router.get('/suppliers', protect, finance.getSuppliers);
router.post('/suppliers', protect, finance.createSupplier);
router.delete('/suppliers/:id', protect, finance.deleteSupplier);

router.get('/expenses', protect, finance.getExpenses);
router.post('/expenses', protect, finance.createExpense);
router.delete('/expenses/:id', protect, finance.deleteExpense);

router.get('/purchase-orders', protect, finance.getPurchaseOrders);
router.post('/purchase-orders', protect, finance.createPurchaseOrder);
router.put('/purchase-orders/:id/status', protect, finance.updatePurchaseOrderStatus);

// --- User Management Routes ---
router.get('/users', protect, users.getUsers);
router.post('/users/invite', protect, users.inviteUser);
router.delete('/users/:id', protect, users.deleteUser);
router.put('/users/:id/role', protect, users.updateUserRole);
router.put('/users/:id/pin', protect, users.updateUserPin);

// --- Settings & Dashboard Routes ---
router.get('/settings', protect, settings.getSettings);
router.put('/settings', protect, settings.updateSettings);
router.put('/tenant', protect, settings.updateTenantProfile);
router.get('/stats', protect, settings.getDashboardStats);

export default router;