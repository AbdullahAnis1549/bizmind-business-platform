import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';

// @desc Global workspace search
// @route GET /api/search?q=...
export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        results: {
          customers: [],
          products: [],
          orders: [],
          invoices: [],
        },
      });
    }

    const regex = { $regex: q.trim(), $options: 'i' };
    const businessId = req.businessId;

    const [customers, products, orders, invoices] = await Promise.all([
      Customer.find({
        businessId,
        $or: [{ name: regex }, { email: regex }, { company: regex }, { phone: regex }],
      })
        .limit(5)
        .select('name email company phone status totalSpent'),

      Product.find({
        businessId,
        $or: [{ name: regex }, { sku: regex }, { category: regex }],
      })
        .limit(5)
        .select('name sku price stock category status'),

      Order.find({
        businessId,
        orderNumber: regex,
      })
        .populate('customerId', 'name')
        .limit(5)
        .select('orderNumber total status paymentStatus customerId createdAt'),

      Invoice.find({
        businessId,
        $or: [{ invoiceNumber: regex }, { 'customerInfo.name': regex }],
      })
        .limit(5)
        .select('invoiceNumber total paymentStatus customerInfo invoiceDate'),
    ]);

    res.json({
      success: true,
      query: q.trim(),
      results: {
        customers: customers.map(c => ({
          id: c._id,
          title: c.name,
          subtitle: c.company ? `${c.company} • ${c.email || ''}` : c.email || 'Customer',
          type: 'customer',
          status: c.status,
          link: `/customers/${c._id}`,
        })),
        products: products.map(p => ({
          id: p._id,
          title: p.name,
          subtitle: `SKU: ${p.sku} • Stock: ${p.stock} • $${p.price.toFixed(2)}`,
          type: 'product',
          status: p.status,
          link: '/products',
        })),
        orders: orders.map(o => ({
          id: o._id,
          title: `Order #${o.orderNumber}`,
          subtitle: `$${o.total.toFixed(2)} • ${o.customerId?.name || 'Customer'} • ${o.status}`,
          type: 'order',
          status: o.status,
          link: '/orders',
        })),
        invoices: invoices.map(i => ({
          id: i._id,
          title: `Invoice #${i.invoiceNumber}`,
          subtitle: `$${i.total.toFixed(2)} • ${i.customerInfo.name} • ${i.paymentStatus}`,
          type: 'invoice',
          status: i.paymentStatus,
          link: '/invoices',
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
