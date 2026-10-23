import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { productService } from '../../services/api';
import ProductFormModal from './ProductFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const ProductList = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await productService.getCategories();
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim(),
        category: selectedCategory,
        lowStockOnly: lowStockOnly ? 'true' : undefined,
        sort,
        page,
        limit: 10,
      };
      const res = await productService.getProducts(params);
      if (res.success) {
        setProducts(res.products);
        setPagination(res.pagination);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, lowStockOnly, sort, page, toastError]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenEdit = (p) => {
    setSelectedProduct(p);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setActionLoading(true);
      await productService.deleteProduct(productToDelete._id);
      toastSuccess('Product removed from catalog.');
      setDeleteOpen(false);
      setProductToDelete(null);
      fetchProducts();
      fetchCategories();
    } catch (err) {
      toastError(err.message || 'Could not delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  const canManage = user?.role === 'owner' || user?.role === 'manager' || user?.role === 'superadmin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock quantities, safety thresholds, and inventory cost tracking.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedProduct(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold transition shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle Pill */}
          <button
            type="button"
            onClick={() => {
              setLowStockOnly((prev) => !prev);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              lowStockOnly
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockOnly ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Low Stock Only</span>
          </button>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="-createdAt">Newest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="-price">Price: High to Low</option>
            <option value="price">Price: Low to High</option>
            <option value="stock">Stock: Low to High</option>
            <option value="-stock">Stock: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading/Empty State */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products in catalog"
          description={
            search || selectedCategory !== 'all' || lowStockOnly
              ? 'No products match your current filters.'
              : 'Add your first product to begin accepting customer orders.'
          }
          actionLabel={canManage ? 'Add Product' : undefined}
          onAction={canManage ? () => setFormOpen(true) : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Product</th>
                  <th className="py-3.5 px-4">SKU / Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold && p.stock > 0;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/75 transition group">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/80 shrink-0 bg-slate-50 flex items-center justify-center">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover object-center"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex flex-col items-center justify-center text-slate-400"
                              style={{ display: p.image ? 'none' : 'flex' }}
                              title="No image"
                            >
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>

                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                              {p.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {p.sku}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-600 font-medium">
                          {p.category || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">${p.price.toFixed(2)}</div>
                        {p.cost > 0 && (
                          <div className="text-[11px] text-slate-400">
                            Cost: ${p.cost.toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-base">{p.stock}</div>
                        <div className="text-[10px] text-slate-400">Min safety: {p.lowStockThreshold}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isOut
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isOut ? (
                            'Out of Stock'
                          ) : isLow ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> Low Stock
                            </>
                          ) : (
                            'In Stock'
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {canManage && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setProductToDelete(p);
                                setDeleteOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {products.length} of {pagination.total} catalog items
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        product={selectedProduct}
        onSuccess={() => {
          fetchProducts();
          fetchCategories();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
        title="Delete Product?"
        message={`Are you sure you want to remove "${productToDelete?.name}" from your catalog?`}
        confirmText="Delete Product"
      />
    </div>
  );
};

export default ProductList;
