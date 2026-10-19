import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';

// @desc Get all products
// @route GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, lowStockOnly, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const query = { businessId: req.businessId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (lowStockOnly === 'true') {
      query.$or = [{ status: 'low_stock' }, { status: 'out_of_stock' }];
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
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

// @desc Get product categories
// @route GET /api/products/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { businessId: req.businessId });
    res.json({
      success: true,
      categories: categories.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single product by ID
// @route GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Calculate product sales performance
    const salesAggregation = await Order.aggregate([
      { $match: { businessId: req.businessId, status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $match: { 'items.productId': product._id } },
      {
        $group: {
          _id: '$items.productId',
          totalUnitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          ordersCount: { $sum: 1 },
        },
      },
    ]);

    const performance = salesAggregation[0] || {
      totalUnitsSold: 0,
      totalRevenue: 0,
      ordersCount: 0,
    };

    res.json({
      success: true,
      product,
      performance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create product
// @route POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, description, price, cost, stock, lowStockThreshold, image } = req.body;

    if (!name || !sku || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, SKU, price, and initial stock.',
      });
    }

    // Check duplicate SKU
    const existing = await Product.findOne({
      businessId: req.businessId,
      sku: sku.toUpperCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
      });
    }

    const product = await Product.create({
      businessId: req.businessId,
      name,
      sku: sku.toUpperCase().trim(),
      category: category || 'General',
      description: description || '',
      price: Number(price),
      cost: cost ? Number(cost) : 0,
      stock: Number(stock),
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
      image: image || '',
    });

    // Check low stock trigger
    if (product.stock <= product.lowStockThreshold) {
      await Notification.create({
        businessId: req.businessId,
        title: 'Low Stock Alert',
        message: `Product "${product.name}" is low in stock (${product.stock} units remaining).`,
        type: 'low_stock',
        link: '/products',
      });
    }

    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update product
// @route PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const { name, sku, category, description, price, cost, stock, lowStockThreshold, image, status } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (sku && sku.toUpperCase().trim() !== product.sku) {
      const duplicate = await Product.findOne({
        businessId: req.businessId,
        sku: sku.toUpperCase().trim(),
        _id: { $ne: product._id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another product with this SKU already exists.',
        });
      }
      product.sku = sku.toUpperCase().trim();
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (cost !== undefined) product.cost = Number(cost);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (image !== undefined) product.image = image;
    if (status) product.status = status;

    if (stock !== undefined) {
      const prevStock = product.stock;
      product.stock = Number(stock);

      if (product.stock <= product.lowStockThreshold && prevStock > product.lowStockThreshold) {
        await Notification.create({
          businessId: req.businessId,
          title: 'Low Stock Alert',
          message: `Product "${product.name}" is now low in stock (${product.stock} remaining).`,
          type: 'low_stock',
          link: '/products',
        });
      }
    }

    await product.save();

    res.json({
      success: true,
      product,
      message: 'Product updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete product
// @route DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
