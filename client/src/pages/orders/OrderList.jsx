import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { orderService } from '../../services/api';
import CreateOrderModal from './CreateOrderModal';
import OrderDetailModal from './OrderDetailModal';
import InvoiceDetailModal from '../invoices/InvoiceDetailModal';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const OrderList = () => {
  const { user } = useAuth();
  const { toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [invoiceDetailId, setInvoiceDetailId] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Check if ?action=new is set
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setCreateOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim(),
        status,
        paymentStatus,
        sort,
        page,
        limit: 10,
      };
      const res = await orderService.getOrders(params);
      if (res.success) {
        setOrders(res.orders);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, paymentStatus, sort, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetail = (id) => {
    setSelectedOrderId(id);
    setDetailOpen(true);
  };

  const handleOpenInvoiceFromOrder = (invId) => {
    setInvoiceDetailId(invId);
    setInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Orders & Sales
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track transactions, customer fulfillment, and automated invoice generations.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold transition shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Order</span>
        </button>
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
            placeholder="Search order number or customer name..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Order Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="-createdAt">Newest Order First</option>
            <option value="createdAt">Oldest Order First</option>
            <option value="-total">Total: High to Low</option>
            <option value="total">Total: Low to High</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading/Empty State */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={
            search || status !== 'all' || paymentStatus !== 'all'
              ? 'No orders match your filter criteria.'
              : 'You have not recorded any sales yet. Create your first order to kick off operations.'
          }
          actionLabel="Create Order"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Order</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/75 transition group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div
                        onClick={() => handleOpenDetail(o._id)}
                        className="font-bold text-slate-900 group-hover:text-brand-600 transition cursor-pointer"
                      >
                        #{o.orderNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()} at{' '}
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-sm">{o.customerId?.name || 'Walk-in'}</div>
                      <div className="text-xs text-slate-400">{o.customerId?.company}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-600">
                        {o.items?.reduce((a, b) => a + b.quantity, 0)} item(s)
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">${o.total.toFixed(2)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          o.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'Processing'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : o.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          o.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.paymentStatus === 'Partial'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(o._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {orders.length} of {pagination.total} orders
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

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchOrders}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        orderId={selectedOrderId}
        onUpdated={fetchOrders}
        onOpenInvoice={handleOpenInvoiceFromOrder}
      />

      {/* Invoice Detail Modal (if navigated from order) */}
      <InvoiceDetailModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoiceId={invoiceDetailId}
        onUpdated={fetchOrders}
      />
    </div>
  );
};

export default OrderList;
