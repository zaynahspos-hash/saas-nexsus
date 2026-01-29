import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import { ProductList } from './components/ProductList';
import { OrdersPage } from './pages/OrdersPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { FinancialReportsPage } from './pages/FinancialReportsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SuperDashboard } from './pages/admin/SuperDashboard';
import { TenantManagement } from './pages/admin/TenantManagement';
import { SubscriptionPlans } from './pages/admin/SubscriptionPlans';
import { PaymentApprovals } from './pages/admin/PaymentApprovals';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { POSPage } from './pages/POSPage';
import { LandingPage } from './pages/LandingPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { useStore } from './store/useStore';
import { NotificationsPanel } from './components/NotificationsPanel';
import { Bell, Search, Menu, LogOut, Wifi, WifiOff, Moon, Sun } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, onNotificationsClick }) => {
  const { logout, user, notifications, theme, toggleTheme } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300">
      {/* Mobile Menu Trigger */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg -ml-2 transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Global Search */}
      <div className="hidden md:flex items-center w-full max-w-sm lg:max-w-md relative mx-4">
        <Search className="absolute left-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Global search..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>

      {/* Mobile Title (visible when search is hidden) */}
      <div className="md:hidden font-semibold text-slate-700 dark:text-slate-200 flex-1 text-center truncate px-2">
        {user?.email ? user.email.split('@')[0] : 'SaaS Nexus'}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div title={isOnline ? "Online" : "Offline"} className={`p-2 rounded-full ${isOnline ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
           {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
        </div>

        <button 
          onClick={onNotificationsClick}
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
          )}
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-2">
           <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">{user?.name}</span>
           <button 
            onClick={logout}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
            title="Logout"
           >
             <LogOut size={18} />
           </button>
        </div>
      </div>
    </header>
  );
};

const DashboardLayout: React.FC = () => {
  const { loadInitialData, syncOfflineData, isLoading, theme } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Apply Theme Class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Initial Load
    loadInitialData();

    // Online/Offline Sync Listeners
    const handleOnline = () => {
      console.log('App is online. Syncing data...');
      syncOfflineData();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [loadInitialData, syncOfflineData]);

   if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ml-0 w-full">
        <TopBar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onNotificationsClick={() => setIsNotificationsOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-0 w-full">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Dashboard Routes - Namespaced under /app */}
        <Route path="/app" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Tenant Routes */}
          <Route index element={<DashboardStats />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="sales" element={<OrdersPage />} /> {/* Renamed route to sales, but using OrdersPage component */}
          <Route path="products" element={<ProductList />} />
          <Route path="orders" element={<Navigate to="sales" replace />} /> {/* Redirect old route if accessed directly */}
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="subscription" element={<SubscriptionPlans />} />
          
          {/* Phase 3 & 5 Routes */}
          <Route path="customers" element={<CustomersPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<FinancialReportsPage />} />

          {/* Super Admin Routes */}
          <Route path="admin" element={<SuperDashboard />} />
          <Route path="admin/tenants" element={<TenantManagement />} />
          <Route path="admin/plans" element={<SubscriptionPlans />} />
          <Route path="admin/payments" element={<PaymentApprovals />} />
          <Route path="admin/transactions" element={<div className="p-8 text-slate-500 dark:text-slate-400">Transactions Module Placeholder</div>} />
          <Route path="admin/settings" element={<div className="p-8 text-slate-500 dark:text-slate-400">Platform Settings Placeholder</div>} />
        </Route>

        {/* Catch all - Redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;