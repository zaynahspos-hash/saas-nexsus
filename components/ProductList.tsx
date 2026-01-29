import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Filter, Edit2, Trash2, Tag, History, Package, AlertTriangle, ArrowUp, ArrowDown, ScanLine } from 'lucide-react';
import { Product } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { BarcodePrintModal } from './BarcodePrintModal';

type Tab = 'products' | 'categories' | 'logs';

export const ProductList: React.FC = () => {
  const { products, categories, stockLogs, settings, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [barcodeProducts, setBarcodeProducts] = useState<Product[]>([]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = stockLogs.filter(l => 
    l.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleAddCategory = async () => {
    const name = prompt('Enter category name:');
    if (name) {
      const description = prompt('Enter description (optional):') || '';
      await addCategory({ name, description });
    }
  };

  const handlePrintAll = () => {
      setBarcodeProducts(filteredProducts);
      setIsBarcodeModalOpen(true);
  };

  const handlePrintSingle = (product: Product) => {
      setBarcodeProducts([product]);
      setIsBarcodeModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Inventory Management</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Track products, organize categories, and audit stock.</p>
        </div>
        
        {activeTab === 'products' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handlePrintAll}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
            >
              <ScanLine size={18} />
              <span className="hidden sm:inline">Print Barcodes</span>
              <span className="sm:hidden">Barcodes</span>
            </button>
            <button 
              onClick={handleAddProduct}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>
        )}
        
        {activeTab === 'categories' && (
          <button 
            onClick={handleAddCategory}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Scrollable Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar -mx-3 sm:mx-0 px-3 sm:px-0">
        <nav className="-mb-px flex space-x-6 min-w-max">
          <TabButton 
            isActive={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
            icon={Package} 
            label="Products" 
          />
          <TabButton 
            isActive={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')} 
            icon={Tag} 
            label="Categories" 
          />
          <TabButton 
            isActive={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')} 
            icon={History} 
            label="Stock History" 
          />
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Toolbar (Common for Products & Logs) */}
        {activeTab !== 'categories' && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={activeTab === 'products' ? "Search products..." : "Search logs..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        )}

        {/* --- PRODUCTS TABLE --- */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Product</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap">SKU</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Stock</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Price</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell whitespace-nowrap">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 max-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={product.imageUrl} alt="" className="h-full w-full object-cover"/>
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.category}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 sm:hidden mt-0.5">{product.stock} in stock</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono hidden lg:table-cell">{product.sku}</td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        {product.stock <= (product.lowStockThreshold || 5) && product.stock > 0 && (
                          <AlertTriangle size={14} className="text-orange-500" />
                        )}
                        <span className={`text-sm ${product.stock === 0 ? 'text-red-500 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                          {product.stock} units
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">${product.price.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-4 hidden xl:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {product.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handlePrintSingle(product)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="Print Barcode"
                        >
                          <ScanLine size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- CATEGORIES TABLE --- */}
        {activeTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Category Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell whitespace-nowrap">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Products</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-indigo-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{cat.description || '-'}</td>
                    <td className="px-6 py-4">
                       <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-600 whitespace-nowrap">
                         {products.filter(p => p.category === cat.name).length} products
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- STOCK LOGS TABLE --- */}
        {activeTab === 'logs' && (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
               <thead>
                 <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Date</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Product</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Change</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Type</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell whitespace-nowrap">Reason</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap">User</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                 {filteredLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                     <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                       {new Date(log.createdAt).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4">
                       <div className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{log.productName}</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">{log.sku}</div>
                     </td>
                     <td className="px-6 py-4">
                       <div className={`flex items-center gap-1 font-medium ${log.changeAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                         {log.changeAmount > 0 ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                         {Math.abs(log.changeAmount)}
                       </div>
                       <div className="text-xs text-slate-400 whitespace-nowrap">Bal: {log.finalStock}</div>
                     </td>
                     <td className="px-6 py-4 hidden sm:table-cell">
                       <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 uppercase">
                         {log.type}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{log.reason || '-'}</td>
                     <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">{log.performedBy}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
           if (editingProduct) {
             await updateProduct(editingProduct.id, data);
           } else {
             await addProduct(data);
           }
        }}
        initialData={editingProduct}
        categories={categories}
      />

      <BarcodePrintModal 
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        products={barcodeProducts}
        settings={settings}
      />
    </div>
  );
};

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, icon: React.ElementType, label: string }> = ({ isActive, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
      ${isActive 
        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
      }
    `}
  >
    <Icon size={18} className={`mr-2 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`} />
    {label}
  </button>
);