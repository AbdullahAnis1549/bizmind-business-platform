import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Business from '../models/Business.js';
import Order from '../models/Order.js';

// @desc Get all invoices
// @route GET /api/invoices
export const getInvoices = async (req, res, next) => {
  try {
    const { search, paymentStatus, sort = '-invoiceDate', page = 1, limit = 10 } = req.query;

    const query = { businessId: req.businessId };

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Invoice.countDocuments(query);

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email company')
      .populate('orderId', 'orderNumber status')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get invoice by ID (includes business info for printing)
// @route GET /api/invoices/:id
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    })
      .populate('customerId')
      .populate('orderId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found.',
      });
    }

    const business = await Business.findById(req.businessId);

    res.json({
      success: true,
      invoice,
      business,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create standalone invoice
// @route POST /api/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const { customerId, items, discount = 0, taxRate = 0, paymentStatus = 'Unpaid', dueDate, notes } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer is required for invoice creation.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice items are required.',
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      businessId: req.businessId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    let subtotal = 0;
    const processedItems = items.map(item => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const total = Number((price * quantity).toFixed(2));
      subtotal += total;

      return {
        name: item.name,
        sku: item.sku || '',
        price,
        quantity,
        total,
      };
    });

    const discountAmount = Number(discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Number(((taxableAmount * (Number(taxRate) || 0)) / 100).toFixed(2));
    const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

    const invCount = await Invoice.countDocuments({ businessId: req.businessId });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      businessId: req.businessId,
      invoiceNumber,
      customerId: customer._id,
      customerInfo: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address ? `${customer.address.street || ''}, ${customer.address.city || ''} ${customer.address.zip || ''}`.trim() : '',
      },
      items: processedItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
      paymentStatus,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: notes || 'Thank you for your business!',
    });

    res.status(201).json({
      success: true,
      invoice,
      message: `Invoice ${invoiceNumber} generated.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update invoice status
// @route PUT /api/invoices/:id/status
export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found.',
      });
    }

    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;

      // Sync with order if associated
      if (invoice.orderId) {
        await Order.findOneAndUpdate(
          { _id: invoice.orderId, businessId: req.businessId },
          { paymentStatus }
        );
      }
    }

    await invoice.save();

    res.json({
      success: true,
      invoice,
      message: 'Invoice payment status updated.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete invoice
// @route DELETE /api/invoices/:id
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found.',
      });
    }

    await invoice.deleteOne();

    res.json({
      success: true,
      message: 'Invoice deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
