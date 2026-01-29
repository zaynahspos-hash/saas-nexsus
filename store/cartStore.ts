import { create } from 'zustand';
import { Product, OrderItem, Customer, OrderItemType } from '../types';

interface CartItem extends OrderItem {
  stock: number; // Keep track of available stock for validation
}

interface CartState {
  items: CartItem[];
  customerName: string;
  customerId?: string; // Linked customer ID
  taxRate: number;
  salespersonId?: string;
  salespersonName?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  globalReturnMode: boolean; // Acts as a default for new items
  
  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string, type: OrderItemType) => void;
  updateQuantity: (productId: string, type: OrderItemType, delta: number) => void;
  toggleItemType: (productId: string, currentType: OrderItemType) => void;
  setCustomer: (customer?: Customer) => void;
  setCustomerName: (name: string) => void;
  setSalesperson: (id: string, name: string) => void;
  setTaxRate: (rate: number) => void;
  setDiscount: (type: 'PERCENT' | 'FIXED', value: number) => void;
  toggleGlobalReturnMode: () => void;
  clearCart: () => void;
  
  // Getters
  subtotal: () => number;
  tax: () => number;
  discountAmount: () => number;
  total: () => number;
  getItemCount: (productId: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerName: 'Walk-in Customer',
  customerId: undefined,
  taxRate: 0.08, // 8% Default Tax
  salespersonId: undefined,
  salespersonName: undefined,
  discountType: 'FIXED',
  discountValue: 0,
  globalReturnMode: false,

  addItem: (product) => {
    const { items, globalReturnMode } = get();
    // Determine type based on global mode
    const typeToAdd: OrderItemType = globalReturnMode ? 'RETURN' : 'SALE';
    
    // Check if we already have this product with the SAME type
    const existing = items.find(i => i.productId === product.id && i.type === typeToAdd);

    if (existing) {
      if (typeToAdd === 'SALE' && existing.quantity >= product.stock) {
         // Stock limit reached for sale
         // Optional: Shake animation or toast
         return;
      }
      
      set({
        items: items.map(i => 
          (i.productId === product.id && i.type === typeToAdd)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      set({
        items: [...items, {
          id: `ci_${Date.now()}_${Math.random()}`,
          productId: product.id,
          productName: product.name,
          priceAtTime: product.price,
          costAtTime: product.costPrice || (product.price * 0.7), 
          quantity: 1,
          stock: product.stock,
          type: typeToAdd
        }]
      });
    }
  },

  removeItem: (productId, type) => {
    set({ items: get().items.filter(i => !(i.productId === productId && i.type === type)) });
  },

  updateQuantity: (productId, type, delta) => {
    const { items } = get();
    set({
      items: items.map(i => {
        if (i.productId === productId && i.type === type) {
          const newQty = i.quantity + delta;
          if (newQty > 0) {
             // Check stock only if it's a SALE
             if (i.type === 'SALE' && newQty > i.stock) return i;
             return { ...i, quantity: newQty };
          }
        }
        return i;
      })
    });
  },

  toggleItemType: (productId, currentType) => {
      const { items } = get();
      const targetType = currentType === 'SALE' ? 'RETURN' : 'SALE';
      
      // Check if we already have the target type in list, if so, merge them? 
      // For simplicity, just flip the type. If duplicate exists, we might have two rows of same type. 
      // Let's just flip.
      
      set({
          items: items.map(i => {
              if (i.productId === productId && i.type === currentType) {
                  return { ...i, type: targetType };
              }
              return i;
          })
      });
  },

  setCustomer: (customer) => {
    if (customer) {
      set({ customerId: customer.id, customerName: customer.name });
    } else {
      set({ customerId: undefined, customerName: 'Walk-in Customer' });
    }
  },

  setCustomerName: (name) => set({ customerName: name, customerId: undefined }),

  setSalesperson: (id, name) => set({ salespersonId: id, salespersonName: name }),
  
  setTaxRate: (rate) => set({ taxRate: rate }),

  setDiscount: (type, value) => set({ discountType: type, discountValue: value }),

  toggleGlobalReturnMode: () => set(state => ({ globalReturnMode: !state.globalReturnMode })),
  
  clearCart: () => set({ items: [], customerName: 'Walk-in Customer', customerId: undefined, salespersonId: undefined, salespersonName: undefined, discountValue: 0, globalReturnMode: false }),

  subtotal: () => {
    const { items } = get();
    // Return items subtract from total, Sale items add
    return items.reduce((s, item) => {
        const sign = item.type === 'RETURN' ? -1 : 1;
        return s + (item.priceAtTime * item.quantity * sign);
    }, 0);
  },

  discountAmount: () => {
    const { discountType, discountValue } = get();
    // Discount is calculated on the absolute subtotal magnitude of SALES usually, 
    // but simplified: apply to net subtotal. 
    // If net subtotal is negative (more returns than sales), discount might not make sense, 
    // but let's just apply it to the magnitude.
    
    const sub = get().subtotal();
    if (sub <= 0) return 0; // No discount on net negative return orders

    if (discountType === 'PERCENT') {
      return sub * (discountValue / 100);
    } else {
      return Math.min(sub, discountValue); // Can't discount more than total
    }
  },

  tax: () => {
    const { taxRate } = get();
    const sub = get().subtotal();
    const disc = get().discountAmount();
    
    // If net negative, tax refund is applicable
    const taxableAmount = sub - disc;
    return taxableAmount * taxRate;
  },

  total: () => {
    const sub = get().subtotal();
    const disc = get().discountAmount();
    const t = get().tax();
    return sub - disc + t;
  },

  getItemCount: (productId: string) => {
      const { items } = get();
      return items
        .filter(i => i.productId === productId)
        .reduce((sum, i) => sum + i.quantity, 0);
  }
}));