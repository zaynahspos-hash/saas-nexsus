import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useCartStore } from '../store/cartStore';
import { offlineService } from '../services/db';
import { printReceipt } from '../components/pos/Receipt';
import { BarcodeScanner } from '../components/pos/BarcodeScanner';
import { PinPadModal } from '../components/PinPadModal';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Scan, 
  WifiOff, 
  User,
  X, 
  ArrowLeft, 
  RotateCcw,
  UserPlus,
  UserCheck,
  ChevronDown,
  Tag,
  Repeat,
  Lock,
  Percent
} from 'lucide-react';
import { Order, OrderStatus, Role, Product } from '../types';

export const POSPage: React.FC = () => {
  const { products, currentTenant, settings, customers, users, addOrder, addCustomer, user: currentUser, verifyUserPin } = useStore();
  const cart = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ name: '', phone: '', email: '' });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'DISCOUNT' | 'RETURN_MODE' | null>(null);

  useEffect(() => {
    if (settings) {
       cart.setTaxRate(settings.taxRate);
    }
  }, [settings]);

  useEffect(() => {
    if (products.length > 0) {
      offlineService.syncProducts(products);
    }
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const filteredCustomers = customers.filter(c => 
     c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
     c.phone.includes(customerSearch)
  );

  const salesStaff = users.filter(u => u.role === Role.SALESMAN || u.role === Role.CASHIER || u.role === Role.MANAGER || u.role === Role.ADMIN);
  const categories: string[] = ['All', ...(Array.from(new Set(products.map((p) => p.category))) as string[])];

  const handleScan = (decodedText: string) => {
    const product = products.find((p: Product) => p.sku === decodedText || p.id === decodedText);
    if (product) {
      cart.addItem(product);
    } else {
      alert(`Product not found: ${decodedText}`);
    }
  };

  const initNewCustomer = () => {
    const isPhone = /^[0-9+\-\s()]*$/.test(customerSearch) && customerSearch.length > 3;
    setNewCustomerData({
        name: isPhone ? '' : customerSearch,
        phone: isPhone ? customerSearch : '',
        email: ''
    });
    setIsNewCustomerModalOpen(true);
    setShowCustomerDropdown(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.name || !newCustomerData.phone) {
        alert("Name and Phone are required");
        return;
    }
    try {
      const customer = await addCustomer({ 
        name: newCustomerData.name, 
        phone: newCustomerData.phone, 
        email: newCustomerData.email,
        address: ''
      });
      cart.setCustomer(customer);
      setCustomerSearch('');
      setIsNewCustomerModalOpen(false);
    } catch (error) {
      alert("Failed to create customer");
    }
  };

  const handleCheckout = async () => {
    if (!currentTenant) return;
    const allReturns = cart.items.every(i => i.type === 'RETURN');
    const orderStatus = allReturns ? OrderStatus.RETURNED : OrderStatus.COMPLETED;
    setIsProcessing(true);
    try {
      const newOrder: Partial<Order> = {
        userId: currentUser?.id || 'unknown',
        salespersonId: cart.salespersonId || currentUser?.id,
        salespersonName: cart.salespersonName || currentUser?.name,
        customerName: cart.customerName,
        customerId: cart.customerId,
        status: orderStatus,
        totalAmount: cart.total(),
        discountAmount: Math.abs(cart.discountAmount()),
        discountType: cart.discountType,
        items: cart.items,
        isReturn: allReturns,
        createdAt: new Date().toISOString()
      };
      const createdOrder = await addOrder(newOrder);
      if (createdOrder) {
          printReceipt(createdOrder, currentTenant, settings);
      }
      cart.clearCart();
      setIsMobileCartOpen(false);
      setCustomerSearch('');
    } catch (error) {
      alert('Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateProtectedAction = (action: 'DISCOUNT' | 'RETURN_MODE') => {
      setPendingAction(action);
      setIsPinModalOpen(true);
  };

  const handlePinSuccess = async (pin: string) => {
      const isValid = await verifyUserPin(pin);
      if (isValid) {
          setIsPinModalOpen(false);
          if (pendingAction === 'DISCOUNT') setIsDiscountModalOpen(true);
          else if (pendingAction === 'RETURN_MODE') cart.toggleGlobalReturnMode();
      } else {
          alert("Invalid PIN");
      }
      setPendingAction(null);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-100 dark:bg-slate-900 relative transition-colors duration-300">
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products or scan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 !bg-white !text-slate-900 dark:!bg-slate-700 dark:!text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-slate-800 dark:bg-slate-700 text-white p-2.5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              title="Scan Barcode"
            >
              <Scan size={20} />
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isOffline && (
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-md text-sm flex items-center gap-2">
              <WifiOff size={16} />
              <span>Offline Mode Active - Orders will sync later</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-100 dark:bg-slate-900">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-24 lg:pb-4">
            {filteredProducts.map(product => {
              const qtyInCart = cart.getItemCount(product.id);
              return (
                <div 
                  key={product.id}
                  onClick={() => cart.addItem(product)}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer active:scale-95 group relative"
                >
                  <div className="aspect-square bg-slate-50 dark:bg-slate-700 relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    {product.stock <= 0 && !cart.globalReturnMode && (
                       <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">OUT OF STOCK</span>
                       </div>
                    )}
                    {qtyInCart > 0 && (
                       <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                          {qtyInCart}
                       </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100 text-sm line-clamp-2 leading-tight h-10">{product.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">${product.price}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{product.stock} left</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Cart Toggle */}
        <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
          <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center"
          >
            <span className="font-semibold">View Cart ({cart.items.length})</span>
            <span className="font-bold text-lg">${cart.total().toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={`
        fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent lg:static lg:w-96 lg:flex flex-col lg:border-l lg:border-slate-200 dark:lg:border-slate-700 bg-white dark:bg-slate-800
        transition-all duration-300 ease-in-out
        ${isMobileCartOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 lg:translate-y-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto'}
      `}>
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 w-full lg:w-auto overflow-hidden relative">
           {cart.globalReturnMode && (
             <div className="bg-red-500 text-white text-center text-xs font-bold py-1 uppercase tracking-widest animate-pulse">
               Return Mode Active
             </div>
           )}

           <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden p-1 text-slate-500"><ArrowLeft size={20}/></button>
                <h2 className="font-bold text-slate-800 dark:text-white">Current Order</h2>
              </div>
           </div>

           <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 space-y-3">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600">
                    <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Cashier</label>
                    <div className="text-sm font-medium truncate">{currentUser?.name}</div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600 relative">
                    <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Sales Rep</label>
                    <select 
                        className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0"
                        value={cart.salespersonId || currentUser?.id}
                        onChange={(e) => {
                            const user = users.find(u => u.id === e.target.value);
                            if(user) cart.setSalesperson(user.id, user.name);
                        }}
                    >
                        {salesStaff.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
             </div>

             <div className="relative">
               {cart.customerId ? (
                 <div className="flex items-center justify-between bg-white dark:bg-slate-700 border border-indigo-200 dark:border-indigo-900 p-2 rounded-lg">
                    <span className="text-sm font-bold truncate">{cart.customerName}</span>
                    <button onClick={() => cart.setCustomer(undefined)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                 </div>
               ) : (
                 <div className="relative">
                   <input 
                     type="text" 
                     className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 bg-white dark:bg-slate-700"
                     placeholder="Search customer..."
                     value={customerSearch}
                     onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                   />
                   {showCustomerDropdown && customerSearch && (
                     <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                        {filteredCustomers.map(c => (
                             <button 
                               key={c.id} 
                               className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 border-b last:border-none"
                               onMouseDown={() => { cart.setCustomer(c); setCustomerSearch(''); setShowCustomerDropdown(false); }}
                             >
                               <div className="font-medium">{c.name}</div>
                               <div className="text-xs text-slate-500">{c.phone}</div>
                             </button>
                        ))}
                        <button onMouseDown={initNewCustomer} className="w-full p-2 text-indigo-600 text-xs font-bold hover:bg-indigo-50">+ Add New Customer</button>
                     </div>
                   )}
                 </div>
               )}
             </div>

             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => initiateProtectedAction('DISCOUNT')} className="flex flex-col items-center justify-center p-2 rounded-lg border bg-white dark:bg-slate-700"><Percent size={16}/><span className="text-[10px] font-bold">Discount</span></button>
                <button onClick={() => initiateProtectedAction('RETURN_MODE')} className="flex flex-col items-center justify-center p-2 rounded-lg border bg-white dark:bg-slate-700"><RotateCcw size={16}/><span className="text-[10px] font-bold">Return</span></button>
                <button onClick={cart.clearCart} className="flex flex-col items-center justify-center p-2 rounded-lg border bg-white dark:bg-slate-700"><Trash2 size={16}/><span className="text-[10px] font-bold">Clear</span></button>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <ShoppingCart size={32} />
                  <p className="mt-2">Cart is empty</p>
                </div>
              ) : (
                cart.items.map((item, idx) => (
                  <div key={idx} className={`flex gap-3 border-l-4 pl-2 ${item.type === 'RETURN' ? 'border-red-500' : 'border-transparent'}`}>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium truncate">{item.productName}</h5>
                      <p className="text-xs text-slate-500">${item.priceAtTime.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => cart.updateQuantity(item.productId, item.type, -1)} className="p-1 border rounded"><Minus size={12}/></button>
                       <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                       <button onClick={() => cart.updateQuantity(item.productId, item.type, 1)} className="p-1 border rounded" disabled={item.type === 'SALE' && item.quantity >= item.stock}><Plus size={12}/></button>
                       <button onClick={() => cart.removeItem(item.productId, item.type)} className="text-red-400 ml-2"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))
              )}
           </div>

           <div className="p-6 border-t bg-white dark:bg-slate-800">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>${cart.subtotal().toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-500"><span>Discount</span><span className="text-red-500">-${cart.discountAmount().toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-500"><span>Tax</span><span>${cart.tax().toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2"><span>Total</span><span>${cart.total().toFixed(2)}</span></div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.items.length === 0 || isProcessing}
                className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `CHARGE $${Math.abs(cart.total()).toFixed(2)}`}
              </button>
           </div>
        </div>
      </div>

      {isScannerOpen && <BarcodeScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />}
      <PinPadModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} onSuccess={handlePinSuccess} title="Staff Verification" description="Enter PIN to authorize action." />

      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-slate-900/60" onClick={() => setIsDiscountModalOpen(false)}></div>
           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 relative z-10 w-full max-w-sm">
              <h3 className="font-bold mb-4">Apply Discount</h3>
              <div className="flex gap-2 mb-4">
                 <button onClick={() => cart.setDiscount('PERCENT', cart.discountValue)} className={`flex-1 py-2 rounded border ${cart.discountType === 'PERCENT' ? 'bg-indigo-600 text-white' : ''}`}>%</button>
                 <button onClick={() => cart.setDiscount('FIXED', cart.discountValue)} className={`flex-1 py-2 rounded border ${cart.discountType === 'FIXED' ? 'bg-indigo-600 text-white' : ''}`}>$</button>
              </div>
              <input type="number" className="w-full p-2 border rounded mb-4 text-center text-2xl font-bold" value={cart.discountValue || ''} onChange={e => cart.setDiscount(cart.discountType, parseFloat(e.target.value) || 0)} autoFocus />
              <button onClick={() => setIsDiscountModalOpen(false)} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">Apply</button>
           </div>
        </div>
      )}

      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-slate-900/60" onClick={() => setIsNewCustomerModalOpen(false)}></div>
           <div className="bg-white dark:bg-slate-800 rounded-xl p-6 relative z-10 w-full max-w-md">
              <h3 className="font-bold mb-4">Quick Add Customer</h3>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                 <input type="text" required className="w-full p-2 border rounded" placeholder="Name" value={newCustomerData.name} onChange={e => setNewCustomerData({...newCustomerData, name: e.target.value})} />
                 <input type="tel" required className="w-full p-2 border rounded" placeholder="Phone" value={newCustomerData.phone} onChange={e => setNewCustomerData({...newCustomerData, phone: e.target.value})} />
                 <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">Save Customer</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
