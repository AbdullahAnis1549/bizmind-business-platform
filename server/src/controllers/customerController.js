import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';

// @desc Get all customers for workspace
// @route GET /api/customers
export const getCustomers = async (req, res, next) => {
  try {
    const { search, status, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const query = { businessId: req.businessId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Customer.countDocuments(query);

    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      customers,
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

// @desc Get customer details by ID
// @route GET /api/customers/:id
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    const orders = await Order.find({
      customerId: customer._id,
      businessId: req.businessId,
    })
      .sort('-createdAt')
      .limit(10);

    const isStaff = req.user?.role === 'staff';

    if (isStaff) {
      // Staff: return safe operational data only — no financials
      const safeCustomer = {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        notes: customer.notes,
        status: customer.status,
        ordersCount: customer.ordersCount,
        createdAt: customer.createdAt,
        // totalSpent deliberately omitted
      };
      const safeOrders = orders.map((o) => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        itemCount: o.items?.length || 0,
        // total/subtotal/discount/tax deliberately omitted
      }));
      return res.json({
        success: true,
        customer: safeCustomer,
        recentOrders: safeOrders,
        // recentInvoices omitted for staff
      });
    }

    const invoices = await Invoice.find({
      customerId: customer._id,
      businessId: req.businessId,
    })
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      customer,
      recentOrders: orders,
      recentInvoices: invoices,
    });
  } catch (error) {
    next(error);
  }
};


// @desc Create new customer
// @route POST /api/customers
export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, notes, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required.',
      });
    }

    // Check if duplicate email in this business
    if (email) {
      const existing = await Customer.findOne({
        businessId: req.businessId,
        email: email.toLowerCase(),
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists in your workspace.',
        });
      }
    }

    const customer = await Customer.create({
      businessId: req.businessId,
      name,
      email: email ? email.toLowerCase() : '',
      phone: phone || '',
      company: company || '',
      address: address || {},
      notes: notes || '',
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      customer,
      message: 'Customer created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update customer
// @route PUT /api/customers/:id
export const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, notes, status } = req.body;

    const customer = await Customer.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    if (email && email.toLowerCase() !== customer.email) {
      const duplicate = await Customer.findOne({
        businessId: req.businessId,
        email: email.toLowerCase(),
        _id: { $ne: customer._id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another customer with this email already exists.',
        });
      }
      customer.email = email.toLowerCase();
    }

    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (company !== undefined) customer.company = company;
    if (address !== undefined) customer.address = address;
    if (notes !== undefined) customer.notes = notes;
    if (status) customer.status = status;

    await customer.save();

    res.json({
      success: true,
      customer,
      message: 'Customer updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete customer
// @route DELETE /api/customers/:id
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    // Check if customer has orders
    const orderCount = await Order.countDocuments({
      customerId: customer._id,
      businessId: req.businessId,
    });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with ${orderCount} existing order(s). Change customer status to 'inactive' instead.`,
      });
    }

    await customer.deleteOne();

    res.json({
      success: true,
      message: 'Customer deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
