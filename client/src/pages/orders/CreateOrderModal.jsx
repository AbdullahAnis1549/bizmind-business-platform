import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, AlertCircle, AlertTriangle, Check } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { orderService, customerService, productService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CreateOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1, price: 0, stock: 0, name: '' },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(8.25);
  const [status, setStatus] = useState('Completed');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notes, setNotes] = useState('');
  const [generateInvoice, setGenerateInvoice] = useState(true);

  // Fetch active customers and in-stock products
  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        try {
          setLoadingInitial(true);
          const [cRes, pRes] = await Promise.all([
            customerService.getCustomers({ limit: 100 }),
            productService.getProducts({ limit: 100 }),
          ]);
          if (cRes.success) setCustomers(cRes.customers);
          if (pRes.success) {
            setProducts(pRes.products);
            if (pRes.products.length > 0) {
              setOrderItems([
                {
                  productId: pRes.products[0]._id,
                  quantity: 1,
                  price: pRes.products[0].price,
                  stock: pRes.products[0].stock,
                  name: pRes.products[0].name,
                },
              ]);
            }
          }
          if (cRes.customers?.length > 0) {
            setCustomerId(cRes.customers[0]._id);
          }
        } catch (err) {
          toastError('Failed to load customers or products.');
        } finally {
          setLoadingInitial(false);
        }
      };
      loadOptions();
    }
  }, [isOpen, toastError]);

  const handleProductChange = (index, prodId) => {
    const selected = products.find((p) => p._id === prodId);
    if (!selected) return;

    setOrderItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        productId: selected._id,
        name: selected.name,
        price: selected.price,
        stock: selected.stock,
        quantity: Math.min(copy[index].quantity || 1, Math.max(1, selected.stock)),
      };
      return copy;
    });
  };

  const handleQuantityChange = (index, qty) => {
    const num = Math.max(1, parseInt(qty, 10) || 1);
    setOrderItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = num;
      return copy;
    });
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setOrderItems((prev) => [
      ...prev,
      {
        productId: defaultProd._id,
        name: defaultProd.name,
        price: defaultProd.price,
        stock: defaultProd.stock,
        quantity: 1,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Live calculations
  const subtotal = orderItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const taxable = subtotal - discountAmount;
  const taxAmount = Number(((taxable * (Number(taxRate) || 0)) / 100).toFixed(2));
  const grandTotal = Number((taxable + taxAmount).toFixed(2));

  // Check inventory violation
  const hasInventoryViolation = orderItems.some((it) => it.quantity > it.stock);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      toastError('Please select a customer for the order.');
      return;
    }

    if (hasInventoryViolation) {
      toastError('One or more line items exceed current available inventory.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerId,
        items: orderItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          price: it.price,
        })),
        discount: discountAmount,
        taxRate: Number(taxRate) || 0,
        status,
        paymentStatus,
        notes,
        generateInvoice,
      };

      const res = await orderService.createOrder(payload);
      if (res.success) {
        toastSuccess(`Order #${res.order.orderNumber} created successfully!`);
        onSuccess();
        onClose();
      }
    } catch (err) {
      toastError(err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer Order"
      subtitle="Select products, verify real-time stock, and auto-generate invoice"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer <span className="text-rose-500">*</span>
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            required
          >
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.company ? `(${c.company})` : ''} — {c.email || c.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Line Items Container */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Order Products & Inventory Check
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {orderItems.map((item, idx) => {
              const exceeds = item.quantity > item.stock;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-2.5 transition ${
                    exceeds ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (${p.price.toFixed(2)}) — Available: {p.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs sm:text-sm text-center ${
                          exceeds ? 'border-rose-400 font-bold text-rose-600' : 'border-slate-200 bg-white'
                        }`}
                      />
                    </div>

                    <div className="w-24 text-right font-bold text-slate-800 text-sm">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {exceeds && (
                    <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 sm:w-full">
                      <AlertTriangle className="w-3.5 h-3.5" /> Requested {item.quantity} exceeds available stock ({item.stock})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span>Discount ($):</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-24 px-2 py-1 rounded-md border border-slate-200 bg-white text-right text-xs"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span>Sales Tax (%):</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-24 px-2 py-1 rounded-md border border-slate-200 bg-white text-right text-xs"
            />
          </div>

          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Status & Payment Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fulfillment Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
            >
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
            >
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Invoice Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="invoiceCheck"
            checked={generateInvoice}
            onChange={(e) => setGenerateInvoice(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="invoiceCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Automatically generate and link a professional invoice for this order
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || hasInventoryViolation}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 rounded-xl transition shadow-sm"
          >
            {submitting ? 'Creating Order...' : `Confirm & Place Order ($${grandTotal.toFixed(2)})`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrderModal;
