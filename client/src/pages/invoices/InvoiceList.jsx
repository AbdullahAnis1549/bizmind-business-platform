import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { invoiceService } from '../../services/api';
import InvoiceDetailModal from './InvoiceDetailModal';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const InvoiceList = () => {
  const { toastError } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [sort, setSort] = useState('-invoiceDate');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Modal
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim(),
        paymentStatus,
        sort,
        page,
        limit: 10,
      };
      const res = await invoiceService.getInvoices(params);
      if (res.success) {
        setInvoices(res.invoices);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, paymentStatus, sort, page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenDetail = (id) => {
    setSelectedInvoiceId(id);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Billing & Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commercial invoices, payment receipts, and printable PDF statements.
          </p>
        </div>
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
            placeholder="Search invoice number or customer name..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'Paid', 'Partial', 'Unpaid'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setPaymentStatus(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  paymentStatus === st
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
            <option value="-invoiceDate">Newest Invoice Date</option>
            <option value="invoiceDate">Oldest Invoice Date</option>
            <option value="-total">Amount: High to Low</option>
            <option value="dueDate">Due Date (Earliest)</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading/Empty State */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description={
            search || paymentStatus !== 'all'
              ? 'No invoices match your search filters.'
              : 'Invoices are automatically created whenever you place customer orders.'
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Invoice Number</th>
                  <th className="py-3.5 px-4">Billed To</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4 text-right">View / Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/75 transition group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div
                        onClick={() => handleOpenDetail(inv._id)}
                        className="font-mono font-bold text-slate-900 group-hover:text-brand-600 transition cursor-pointer"
                      >
                        {inv.invoiceNumber}
                      </div>
                      {inv.orderId && (
                        <div className="text-[11px] text-slate-400">
                          Ref: #{inv.orderId.orderNumber || 'Order'}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{inv.customerInfo?.name}</div>
                      <div className="text-xs text-slate-400">{inv.customerInfo?.company || inv.customerInfo?.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">${inv.total.toFixed(2)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.paymentStatus === 'Partial'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(inv._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                        title="View / Print Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {invoices.length} of {pagination.total} invoices
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

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        invoiceId={selectedInvoiceId}
        onUpdated={fetchInvoices}
      />
    </div>
  );
};

export default InvoiceList;
