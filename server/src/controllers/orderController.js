import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

// @desc Get all orders
// @route GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const { search, status, paymentStatus, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const query = { businessId: req.businessId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      // Find matching customers first
      const matchingCustomers = await Customer.find({
        businessId: req.businessId,
        name: { $regex: search, $options: 'i' },
      }).select('_id');

      const customerIds = matchingCustomers.map(c => c._id);

      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerId: { $in: customerIds } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('customerId', 'name email company phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Staff: omit financial summary fields from each order
    const isStaff = req.user?.role === 'staff';
    const safeOrders = isStaff
      ? orders.map((o) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          customerId: o.customerId,
          items: o.items?.map((i) => ({
            productId: i.productId,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            // price/total per item omitted for staff
          })),
          notes: o.notes,
        }))
      : orders;

    res.json({
      success: true,
      orders: safeOrders,
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

// @desc Get single order by ID
// @route GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    })
      .populate('customerId', 'name email phone company address')
      .populate('items.productId', 'name sku price stock image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const isStaff = req.user?.role === 'staff';

    if (isStaff) {
      // Strip invoice and financial totals from order detail for staff
      const safeOrder = {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customerId: order.customerId,
        notes: order.notes,
        items: order.items?.map((i) => ({
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          quantity: i.quantity,
          // price/total per item omitted for staff
        })),
      };
      return res.json({
        success: true,
        order: safeOrder,
        // invoice omitted for staff
      });
    }

    const invoice = await Invoice.findOne({ orderId: order._id, businessId: req.businessId });

    res.json({
      success: true,
      order,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create new order
// @route POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const {
      customerId,
      items,
      discount = 0,
      taxRate = 0,
      status = 'Pending',
      paymentStatus = 'Unpaid',
      notes = '',
      generateInvoice = true,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer is required for an order.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product item is required.',
      });
    }

    // Verify customer belongs to business
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

    // Verify products and inventory
    const processedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        businessId: req.businessId,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} was not found.`,
        });
      }

      const qty = Number(item.quantity) || 1;

      // Check stock availability
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}". Requested: ${qty}, Available: ${product.stock}.`,
        });
      }

      const itemPrice = Number(item.price !== undefined ? item.price : product.price);
      const itemTotal = Number((itemPrice * qty).toFixed(2));
      calculatedSubtotal += itemTotal;

      processedItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: itemPrice,
        cost: product.cost || 0,
        quantity: qty,
        total: itemTotal,
      });
    }

    const discountAmount = Number(discount) || 0;
    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Number(((taxableAmount * (Number(taxRate) || 0)) / 100).toFixed(2));
    const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

    // Generate Order Number
    const count = await Order.countDocuments({ businessId: req.businessId });
    const orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;

    const order = await Order.create({
      businessId: req.businessId,
      orderNumber,
      customerId: customer._id,
      items: processedItems,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
      status,
      paymentStatus,
      notes,
    });

    // Deduct stock for each product & create notification if low stock
    for (const item of processedItems) {
      const product = await Product.findOne({ _id: item.productId, businessId: req.businessId });
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();

        if (product.stock <= product.lowStockThreshold) {
          await Notification.create({
            businessId: req.businessId,
            title: 'Low Stock Warning',
            message: `Product "${product.name}" stock reduced to ${product.stock} units after order ${orderNumber}.`,
            type: 'low_stock',
            link: '/products',
          });
        }
      }
    }

    // Update customer stats
    customer.ordersCount += 1;
    if (paymentStatus === 'Paid') {
      customer.totalSpent += grandTotal;
    }
    await customer.save();

    // Create notification for new order
    await Notification.create({
      businessId: req.businessId,
      title: 'New Order Created',
      message: `Order #${orderNumber} for $${grandTotal.toFixed(2)} created for ${customer.name}.`,
      type: 'new_order',
      link: '/orders',
    });

    // Optional generate invoice
    let invoice = null;
    if (generateInvoice) {
      const invCount = await Invoice.countDocuments({ businessId: req.businessId });
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;

      invoice = await Invoice.create({
        businessId: req.businessId,
        invoiceNumber,
        orderId: order._id,
        customerId: customer._id,
        customerInfo: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          address: customer.address ? `${customer.address.street || ''}, ${customer.address.city || ''} ${customer.address.zip || ''}`.trim() : '',
        },
        items: processedItems.map(i => ({
          name: i.name,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
          total: i.total,
        })),
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: grandTotal,
        paymentStatus,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }

    res.status(201).json({
      success: true,
      order,
      invoice,
      message: `Order ${orderNumber} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update order status
// @route PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const prevStatus = order.status;
    const prevPayment = order.paymentStatus;

    // Handle cancellation: restore inventory if previously non-cancelled
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findOne({ _id: item.productId, businessId: req.businessId });
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      // If it was marked paid, subtract customer totalSpent
      if (prevPayment === 'Paid') {
        const customer = await Customer.findOne({ _id: order.customerId, businessId: req.businessId });
        if (customer) {
          customer.totalSpent = Math.max(0, customer.totalSpent - order.total);
          await customer.save();
        }
      }
    }

    // Handle re-activation from Cancelled back to Active
    if (prevStatus === 'Cancelled' && status && status !== 'Cancelled') {
      // Re-check inventory
      for (const item of order.items) {
        const product = await Product.findOne({ _id: item.productId, businessId: req.businessId });
        if (product) {
          if (product.stock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Cannot re-activate order: Insufficient stock for "${product.name}".`,
            });
          }
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }

    // Handle payment transition to Paid
    if (paymentStatus === 'Paid' && prevPayment !== 'Paid' && status !== 'Cancelled') {
      const customer = await Customer.findOne({ _id: order.customerId, businessId: req.businessId });
      if (customer) {
        customer.totalSpent += order.total;
        await customer.save();
      }

      // Update associated invoice if present
      await Invoice.findOneAndUpdate(
        { orderId: order._id, businessId: req.businessId },
        { paymentStatus: 'Paid' }
      );
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({
      success: true,
      order,
      message: 'Order updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
