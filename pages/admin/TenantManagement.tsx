import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { TenantStatus, Tenant, TenantDetails, OrderStatus } from '../../types';
import { Check, X, Search, Eye, Ban, Building2, MapPin, Phone, Mail, Package, Users, DollarSign, Calendar, Image as ImageIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TenantManagement: React.FC = () => {
  const { allTenants, updateTenantStatus, fetchTenantDetails } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [details, setDetails] = useState<TenantDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Detail View Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTenants = allTenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = async (id: string) => {
      setSelectedTenantId(id);
      setIsLoadingDetails(true);
      const data = await fetchTenantDetails(id);
      setDetails(data);
      setIsLoadingDetails(false);
      
      // Reset dates
      setStartDate('');
      setEndDate('');
  };

  const handleCloseDetails = () => {
      setSelectedTenantId(null);
      setDetails(null);
  };

  // --- Derived Stats for Detail View ---
  const filteredRevenue = useMemo(() => {
      if (!details) return 0;
      let orders = details.recentOrders.filter(o => o.status !== OrderStatus.CANCELLED);
      
      if (startDate) {
          orders = orders.filter(o => new Date(o.createdAt) >= new Date(startDate));
      }
      if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59);
          orders = orders.filter(o => new Date(o.createdAt) <= end);
      }
      
      return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [details, startDate, endDate]);

  const revenueChartData = useMemo(() => {
      if (!details) return [];
      const data: Record<string, number> = {};
      let orders = details.recentOrders;

      // Filter for chart if dates selected, else show last 30 days default or all time
      if (startDate || endDate) {
          if (startDate) orders = orders.filter(o => new Date(o.createdAt) >= new Date(startDate));
          if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59);
              orders = orders.filter(o => new Date(o.createdAt) <= end);
          }
      }

      orders.forEach(o => {
          if (o.status === OrderStatus.CANCELLED) return;
          const date = new Date(o.createdAt).toLocaleDateString();
          data[date] = (data[date] || 0) + o.totalAmount;
      });

      return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [details, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tenant Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Approve, suspend, or manage customer instances.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold overflow-hidden">
                        {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-full h-full object-cover"/> : tenant.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{tenant.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                      {tenant.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetails(tenant.id)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        title="View Full Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {tenant.status === TenantStatus.PENDING && (
                        <>
                          <button 
                            onClick={() => updateTenantStatus(tenant.id, TenantStatus.ACTIVE)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => updateTenantStatus(tenant.id, TenantStatus.SUSPENDED)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {tenant.status === TenantStatus.ACTIVE && (
                         <button 
                            onClick={() => updateTenantStatus(tenant.id, TenantStatus.SUSPENDED)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Suspend"
                          >
                            <Ban size={18} />
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Full Screen Tenant Details Modal --- */}
      {selectedTenantId && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseDetails}></div>
              <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                  
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur z-10">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <Building2 size={24} className="text-indigo-600 dark:text-indigo-400"/> Shop Details
                      </h2>
                      <button onClick={handleCloseDetails} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {isLoadingDetails || !details ? (
                      <div className="flex-1 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      </div>
                  ) : (
                      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 dark:bg-slate-900">
                          
                          {/* Profile Card */}
                          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6">
                              <div className="w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                                  {details.tenant.logoUrl ? (
                                      <img src={details.tenant.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                                  ) : (
                                      <Building2 size={48} className="text-slate-300 dark:text-slate-500" />
                                  )}
                              </div>
                              <div className="flex-1 space-y-3">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{details.tenant.name}</h3>
                                          <p className="text-slate-500 dark:text-slate-400 text-sm">Member since {new Date(details.tenant.createdAt).toLocaleDateString()}</p>
                                      </div>
                                      <StatusBadge status={details.tenant.status} />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                                      <div className="flex items-center gap-2">
                                          <Mail size={16} className="text-indigo-500" />
                                          <a href={`mailto:${details.tenant.email}`} className="hover:underline">{details.tenant.email || 'N/A'}</a>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Phone size={16} className="text-indigo-500" />
                                          <span>{details.tenant.phone || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center gap-2 sm:col-span-2">
                                          <MapPin size={16} className="text-indigo-500" />
                                          <span className="truncate">{details.tenant.address || 'N/A'}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* KPI Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <StatBox title="Lifetime Revenue" value={`Rs ${details.stats.lifetimeRevenue.toLocaleString()}`} icon={DollarSign} color="emerald" />
                              <StatBox title="Inventory Value" value={`Rs ${details.stats.inventoryValue.toLocaleString()}`} icon={Package} color="blue" />
                              <StatBox title="Total Products" value={details.stats.totalProducts.toString()} icon={Package} color="indigo" />
                              <StatBox title="Customers" value={details.stats.totalCustomers.toString()} icon={Users} color="orange" />
                          </div>

                          {/* Revenue Analysis */}
                          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sales Performance</h3>
                                  <div className="flex items-center gap-2">
                                      <div className="relative">
                                          <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                          <input 
                                              type="date" 
                                              className="pl-8 pr-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                              value={startDate}
                                              onChange={(e) => setStartDate(e.target.value)}
                                          />
                                      </div>
                                      <span className="text-slate-400 text-xs">to</span>
                                      <div className="relative">
                                          <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                          <input 
                                              type="date" 
                                              className="pl-8 pr-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                              value={endDate}
                                              onChange={(e) => setEndDate(e.target.value)}
                                          />
                                      </div>
                                  </div>
                              </div>

                              <div className="mb-6 flex gap-6">
                                  <div>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Revenue (Selected Period)</p>
                                      <p className="text-2xl font-bold text-slate-900 dark:text-white">Rs {filteredRevenue.toLocaleString()}</p>
                                  </div>
                              </div>

                              <div className="h-[250px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={revenueChartData}>
                                          <defs>
                                              <linearGradient id="colorRevDetails" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} minTickGap={30} />
                                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                          <Tooltip 
                                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
                                              formatter={(value: number) => [`Rs ${value.toLocaleString()}`, 'Sales']}
                                          />
                                          <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevDetails)" />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                          </div>

                          {/* Brand & Products Gallery */}
                          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                  <ImageIcon size={20} className="text-indigo-600 dark:text-indigo-400"/> Shop Brand & Top Products
                              </h3>
                              {details.topProducts.length === 0 ? (
                                  <p className="text-slate-500 dark:text-slate-400 text-sm italic">No products uploaded yet.</p>
                              ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                      {details.topProducts.map(p => (
                                          <div key={p.id} className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-50 dark:bg-slate-700">
                                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                                  <p className="text-white text-xs font-medium truncate">{p.name}</p>
                                                  <p className="text-white/80 text-[10px]">Rs {p.price}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>

                          {/* Staff Overview */}
                          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                  <Users size={20} className="text-indigo-600 dark:text-indigo-400"/> Staff & Users ({details.stats.totalStaff})
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Users registered under this tenant account.</p>
                              <div className="flex flex-wrap gap-2">
                                  {/* Just a simple count or listing if needed, keeping it simple visual */}
                                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{details.stats.totalStaff} Active Users</span>
                                  </div>
                              </div>
                          </div>

                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: TenantStatus }> = ({ status }) => {
  const styles = {
    [TenantStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    [TenantStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    [TenantStatus.SUSPENDED]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

const StatBox: React.FC<{ title: string, value: string, icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => {
    const colorClasses: Record<string, string> = {
      indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
  
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{title}</p>
            <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
                <Icon size={16} />
            </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{value}</h3>
      </div>
    );
};