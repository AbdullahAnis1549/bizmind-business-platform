import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, MapPin, Calendar, ShoppingCart, DollarSign, ExternalLink } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { customerService } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CustomerDetailModal = ({ isOpen, onClose, customerId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const res = await customerService.getCustomerById(customerId);
          if (res.success) {
            setData(res);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const customer = data?.customer;
  const recentOrders = data?.recentOrders || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? customer.name : 'Customer Details'}
      subtitle={customer?.company || 'CRM Profile & Lifetime Metrics'}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading customer details..." />
        </div>
      ) : customer ? (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Spent</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                ${customer.totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Orders Placed</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{customer.ordersCount || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <div className="mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    customer.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : customer.status === 'lead'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{customer.email || 'No email registered'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{customer.phone || 'No phone registered'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{customer.company || 'Individual Account'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {customer.address?.street
                  ? `${customer.address.street}, ${customer.address.city || ''} ${customer.address.state || ''}`
                  : 'No address provided'}
              </span>
            </div>
          </div>

          {customer.notes && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900">
              <span className="font-semibold block mb-0.5">Notes:</span>
              {customer.notes}
            </div>
          )}

          {/* Recent Orders Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-brand-600" /> Recent Order History
              </h4>
              <span className="text-xs text-slate-400">{recentOrders.length} records</span>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl">
                No orders placed yet.
              </div>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <div key={ord._id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                    <div>
                      <div className="font-bold text-slate-900">#{ord.orderNumber}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} item(s)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        ${ord.total.toFixed(2)}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold mt-0.5 ${
                          ord.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ord.status === 'Processing'
                            ? 'bg-indigo-50 text-indigo-700'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default CustomerDetailModal;
