import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, // Changed from ShoppingCart
  Users, 
  Settings, 
  ChevronDown,
  Hexagon,
  Scan,
  X,
  Shield,
  CreditCard,
  BarChart,
  Server,
  Building,
  Truck,
  Receipt,
  PieChart,
  ClipboardList,
  Contact,
  ClipboardCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Permission, Role } from '../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  end?: boolean;
  permission?: Permission; // Optional permission check
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { currentTenant, tenants, setTenant, user } = useStore();
  const [isTenantMenuOpen, setIsTenantMenuOpen] = React.useState(false);

  const hasPermission = (permission?: Permission) => {
    if (!user) return false;
    // Super Admins have god-mode
    if (user.role === Role.SUPER_ADMIN) return true;
    // Admins (Owners) generally see everything *within* their tenant except specific platform tools
    if (user.role === Role.ADMIN) return true; 
    
    if (!permission) return true; // No specific permission required for this item
    return user.permissions?.includes(permission);
  };

  const mainNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app', end: true, permission: 'VIEW_DASHBOARD' },
    { icon: Scan, label: 'POS Terminal', path: '/app/pos', permission: 'POS_ACCESS' },
    { icon: History, label: 'Sales History', path: '/app/sales', permission: 'MANAGE_ORDERS' },
    { icon: Package, label: 'Products', path: '/app/products', permission: 'MANAGE_PRODUCTS' },
  ];

  const crmNavItems: NavItem[] = [
    { icon: Contact, label: 'Customers', path: '/app/customers', permission: 'MANAGE_CUSTOMERS' },
  ];

  const purchaseNavItems: NavItem[] = [
    { icon: Truck, label: 'Suppliers', path: '/app/suppliers', permission: 'MANAGE_SUPPLIERS' },
    { icon: ClipboardList, label: 'Purchase Orders', path: '/app/purchase-orders', permission: 'MANAGE_PRODUCTS' },
  ];

  const financialNavItems: NavItem[] = [
    { icon: Receipt, label: 'Expenses', path: '/app/expenses', permission: 'MANAGE_EXPENSES' },
    { icon: PieChart, label: 'Reports', path: '/app/reports', permission: 'VIEW_REPORTS' },
  ];

  const settingNavItems: NavItem[] = [
    { icon: Users, label: 'Store Staff', path: '/app/users', permission: 'MANAGE_USERS' },
    { icon: Settings, label: 'Store Settings', path: '/app/settings', permission: 'MANAGE_SETTINGS' },
    { icon: CreditCard, label: 'Billing & Plan', path: '/app/subscription', permission: 'MANAGE_SETTINGS' },
  ];

  // Restrict Admin items STRICTLY to Super Admin Role
  const adminNavItems: NavItem[] = [
    { icon: Shield, label: 'Platform Overview', path: '/app/admin', end: true },
    { icon: ClipboardCheck, label: 'Payment Approvals', path: '/app/admin/payments' },
    { icon: Building, label: 'Tenant Management', path: '/app/admin/tenants' },
    { icon: CreditCard, label: 'Subscription Plans', path: '/app/admin/plans' },
    { icon: BarChart, label: 'Platform Transactions', path: '/app/admin/transactions' },
    { icon: Server, label: 'System Settings', path: '/app/admin/settings' },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => {
    const visibleItems = items.filter(item => hasPermission(item.permission));
    if (visibleItems.length === 0) return null;

    return (
      <div className="mb-6">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => {
              if (window.innerWidth < 1024 && onClose) onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mb-1 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside className={`
        w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>

        {/* Tenant Switcher / Logo */}
        <div className="p-4 border-b border-slate-800 mt-8 lg:mt-0">
          <div className="relative">
            <button 
              onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
              className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                {currentTenant?.name.substring(0, 1) || 'T'}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <h3 className="text-sm font-semibold text-white truncate">{currentTenant?.name || 'Select Tenant'}</h3>
                <p className="text-xs text-slate-500 truncate">{currentTenant?.subscriptionTier} Plan</p>
              </div>
              <ChevronDown size={16} className={`transition-transform ${isTenantMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Tenant Dropdown */}
            {isTenantMenuOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
                {tenants.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => {
                      setTenant(tenant);
                      setIsTenantMenuOpen(false);
                      if (onClose) onClose(); // Close sidebar on mobile selection
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 ${currentTenant?.id === tenant.id ? 'text-indigo-400 bg-slate-700/50' : 'text-slate-300'}`}
                  >
                     <Hexagon size={14} className={currentTenant?.id === tenant.id ? 'fill-indigo-400' : ''}/>
                     {tenant.name}
                  </button>
                ))}
                <div className="border-t border-slate-700 p-2">
                   <button className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 py-1">
                      + Create Tenant
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
           {renderNavGroup('Operations', mainNavItems)}
           {renderNavGroup('CRM', crmNavItems)}
           {renderNavGroup('Purchasing', purchaseNavItems)}
           {renderNavGroup('Financials', financialNavItems)}
           {renderNavGroup('Administration', settingNavItems)}

           {/* Super Admin Nav - Strictly for SUPER_ADMIN role */}
           {user?.role === Role.SUPER_ADMIN && (
             <div className="mt-4 pt-4 border-t border-slate-800">
                {renderNavGroup('Platform Admin', adminNavItems)}
             </div>
           )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
             <img 
               src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
               alt="User" 
               className="w-9 h-9 rounded-full border-2 border-slate-700" 
              />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest'}</p>
                <div className="flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                   <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.replace('_', ' ').toLowerCase() || 'User'}</p>
                </div>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
};