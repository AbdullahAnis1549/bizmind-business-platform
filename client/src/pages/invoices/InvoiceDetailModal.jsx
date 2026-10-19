import React, { useState, useEffect } from 'react';
import { Printer, Download, CheckCircle2, Clock, AlertCircle, Building2, Mail, Phone, Calendar } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { invoiceService } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const InvoiceDetailModal = ({ isOpen, onClose, invoiceId, onUpdated }) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const res = await invoiceService.getInvoiceById(invoiceId);
          if (res.success) {
            setData(res);
          }
        } catch (err) {
          toastError('Failed to load invoice details.');
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    } else {
      setData(null);
    }
  }, [isOpen, invoiceId, toastError]);

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await invoiceService.updateInvoiceStatus(invoiceId, { paymentStatus: newStatus });
      if (res.success) {
        toastSuccess('Invoice payment status updated.');
        setData((prev) => ({
          ...prev,
          invoice: res.invoice,
        }));
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      toastError(err.message || 'Failed to update payment status.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  const invoice = data?.invoice;
  const business = data?.business;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? `Invoice #${invoice.invoiceNumber}` : 'Invoice'}
      subtitle={invoice ? `Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}` : ''}
      maxWidth="max-w-3xl"
    >
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading invoice..." />
        </div>
      ) : invoice ? (
        <div className="space-y-6">
          {/* Action Bar (Not printed) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Payment Status:</span>
              <select
                disabled={updating}
                value={invoice.paymentStatus}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-2xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div className="printable-area p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-6 text-slate-900">
            {/* Header: Company & Invoice Info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {business?.name || 'BizMind AI Workspace'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{business?.address || 'Headquarters'}</p>
                <p className="text-xs text-slate-500">{business?.phone} • {business?.email}</p>
                {business?.taxNumber && (
                  <p className="text-[11px] text-slate-400 mt-0.5">Tax ID: {business.taxNumber}</p>
                )}
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-brand-600 mb-1">
                  Commercial Invoice
                </span>
                <h3 className="text-xl font-black font-mono text-slate-900">
                  {invoice.invoiceNumber}
                </h3>
                <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                  <p>Issue Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                      invoice.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : invoice.paymentStatus === 'Partial'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {invoice.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <h4 className="text-sm font-bold text-slate-900">{invoice.customerInfo?.name}</h4>
              {invoice.customerInfo?.company && (
                <p className="text-xs text-slate-600">{invoice.customerInfo.company}</p>
              )}
              {invoice.customerInfo?.address && (
                <p className="text-xs text-slate-500">{invoice.customerInfo.address}</p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">
                {invoice.customerInfo?.email} • {invoice.customerInfo?.phone}
              </p>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Description / Item</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{it.sku || '—'}</td>
                      <td className="py-3 px-3 text-center text-slate-700 font-medium">{it.quantity}</td>
                      <td className="py-3 px-3 text-right text-slate-600">${it.price.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">${it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Calculation */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500 max-w-sm">
                <span className="font-bold block mb-1 text-slate-700">Payment Instructions & Terms:</span>
                <p>{invoice.notes || 'Please pay within 14 days of receipt via ACH or Corporate Wire transfer.'}</p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-${invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold text-slate-900">${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-200">
                  <span>Total Amount:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default InvoiceDetailModal;
