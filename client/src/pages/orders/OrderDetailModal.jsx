import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Calendar, DollarSign, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { orderService } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const OrderDetailModal = ({ isOpen, onClose, orderId, onUpdated, onOpenInvoice }) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await orderService.getOrderById(orderId);
          if (res.success) {
            setData(res);
          }
        } catch (err) {
          toastError('Failed to load order details.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setData(null);
    }
  }, [isOpen, orderId, toastError]);

  const handleStatusChange = async (newStatus, newPayment) => {
    try {
      setUpdating(true);
      const res = await orderService.updateOrderStatus(orderId, {
        status: newStatus,
        paymentStatus: newPayment,
      });
      if (res.success) {
        toastSuccess('Order updated.');
        setData((prev) => ({
          ...prev,
          order: res.order,
        }));
        onUpdated();
      }
    } catch (err) {
      toastError(err.message || 'Failed to update order.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  const order = data?.order;
  const invoice = data?.invoice;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Order #${order.orderNumber}` : 'Order Details'}
      subtitle={order ? `Placed on ${new Date(order.createdAt).toLocaleDateString()}` : ''}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading order..." />
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Fulfillment Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'Processing'
                    ? 'bg-indigo-100 text-indigo-800'
                    : order.status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.status}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Payment Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'Partial'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            {invoice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInvoice(invoice._id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-brand-600 hover:bg-brand-50 shadow-2xs transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Invoice #{invoice.invoiceNumber}</span>
              </button>
            )}
          </div>

          {/* Customer Summary */}
          <div className="p-4 rounded-xl border border-slate-100 bg-white space-y-1 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">Customer Info</span>
            <p className="text-sm font-bold text-slate-900">{order.customerId?.name}</p>
            <p className="text-slate-500">{order.customerId?.company}</p>
            <p className="text-slate-500">{order.customerId?.email} • {order.customerId?.phone}</p>
          </div>

          {/* Line items table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Order Items</h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-700">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">${it.price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">${it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total calculation breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount applied:</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Sales Tax:</span>
              <span className="font-semibold text-slate-900">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick status actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {order.status !== 'Completed' && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusChange('Completed', 'Paid')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                >
                  Mark as Completed & Paid
                </button>
              )}
              {order.status !== 'Cancelled' && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusChange('Cancelled', 'Unpaid')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                >
                  Cancel Order & Restore Stock
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default OrderDetailModal;
