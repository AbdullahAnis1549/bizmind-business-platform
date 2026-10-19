import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { customerService } from '../../services/api';
import CustomerFormModal from './CustomerFormModal';
import CustomerDetailModal from './CustomerDetailModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const CustomerList = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCustomerId, setDetailCustomerId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim(),
        status,
        sort,
        page,
        limit: 10,
      };
      const res = await customerService.getCustomers(params);
      if (res.success) {
        setCustomers(res.customers);
        setPagination(res.pagination);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page, toastError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenEdit = (c) => {
    setSelectedCustomer(c);
    setFormOpen(true);
  };

  const handleOpenDetail = (id) => {
    setDetailCustomerId(id);
    setDetailOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      setActionLoading(true);
      await customerService.deleteCustomer(customerToDelete._id);
      toastSuccess('Customer deleted successfully.');
      setDeleteOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      toastError(err.message || 'Could not delete customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const canManage = user?.role === 'owner' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your clients, leads, and customer purchasing history.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold transition shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
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
            placeholder="Search by name, email, company, or phone..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'active', 'lead', 'inactive'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatus(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  status === st
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="-createdAt">Newest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="-totalSpent">Highest Spend</option>
            <option value="-ordersCount">Most Orders</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading/Empty State */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description={
            search || status !== 'all'
              ? 'No customer records match your current search and filter criteria.'
              : 'You haven’t added any customers yet. Add your first customer or seed demo records.'
          }
          actionLabel={canManage ? 'Add Customer' : undefined}
          onAction={canManage ? () => setFormOpen(true) : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Total Spend</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/75 transition group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div
                        onClick={() => handleOpenDetail(c._id)}
                        className="font-semibold text-slate-900 group-hover:text-brand-600 transition cursor-pointer"
                      >
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Added {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{c.company || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs text-slate-500">
                        {c.email && (
                          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.email}</span>
                          </div>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          c.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'lead'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {c.ordersCount || 0}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${c.totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetail(c._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                          title="View customer details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Edit customer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setCustomerToDelete(c);
                                setDeleteOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {customers.length} of {pagination.total} customer records
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

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        customerId={detailCustomerId}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
        title="Delete Customer Profile?"
        message={`Are you sure you want to delete ${customerToDelete?.name}? Customers with existing order history cannot be deleted.`}
        confirmText="Delete Customer"
      />
    </div>
  );
};

export default CustomerList;
