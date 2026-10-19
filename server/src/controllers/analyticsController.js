import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

// Helper to calculate date range
const getDateRange = (filter, startDate, endDate) => {
  const now = new Date();
  let start = new Date();

  switch (filter) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '3m':
      start.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      start.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 'custom':
      if (startDate && endDate) {
        return { start: new Date(startDate), end: new Date(endDate) };
      }
      start.setDate(now.getDate() - 30);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }

  return { start, end: now };
};

// @desc Get main dashboard KPIs & charts
// @route GET /api/analytics/dashboard
export const getDashboardKPIs = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.businessId);

    // 1. Total Revenue (sum of all completed / paid orders)
    const revenueAgg = await Order.aggregate([
      { $match: { businessId, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, paidRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$total', 0] } } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const paidRevenue = revenueAgg[0]?.paidRevenue || 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments({ businessId });

    // 3. Total Customers
    const totalCustomers = await Customer.countDocuments({ businessId });

    // 4. Products & Low stock
    const totalProducts = await Product.countDocuments({ businessId });
    const lowStockProducts = await Product.countDocuments({
      businessId,
      $or: [{ status: 'low_stock' }, { status: 'out_of_stock' }],
    });

    // 5. Pending Invoices
    const pendingInvoices = await Invoice.countDocuments({
      businessId,
      paymentStatus: { $in: ['Unpaid', 'Partial'] },
    });
    const pendingInvoicesVal = await Invoice.aggregate([
      { $match: { businessId, paymentStatus: { $in: ['Unpaid', 'Partial'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const pendingInvoicesTotal = pendingInvoicesVal[0]?.total || 0;

    // 6. Monthly Revenue (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          businessId,
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly revenue with full labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyRevenue = monthlyRevenue.map(m => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      revenue: Number(m.revenue.toFixed(2)),
      orders: m.orders,
    }));

    // 7. Sales by Category
    const categorySales = await Order.aggregate([
      { $match: { businessId, status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.total' },
          units: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);

    const formattedCategorySales = categorySales.map(c => ({
      category: c._id || 'General',
      revenue: Number(c.revenue.toFixed(2)),
      units: c.units,
    }));

    // 8. Order Status Distribution
    const orderStatusDistribution = await Order.aggregate([
      { $match: { businessId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const formattedOrderStatus = orderStatusDistribution.map(s => ({
      status: s._id,
      count: s.count,
    }));

    // 9. Recent Activity feed (Combines recent orders, recent customers, recent invoices)
    const recentOrders = await Order.find({ businessId })
      .populate('customerId', 'name')
      .sort('-createdAt')
      .limit(4);

    const recentCustomers = await Customer.find({ businessId })
      .sort('-createdAt')
      .limit(3);

    const recentInvoices = await Invoice.find({ businessId })
      .sort('-createdAt')
      .limit(3);

    const activities = [
      ...recentOrders.map(o => ({
        id: o._id,
        type: 'order',
        title: `Order #${o.orderNumber}`,
        description: `$${o.total.toFixed(2)} - ${o.customerId?.name || 'Customer'} (${o.status})`,
        time: o.createdAt,
      })),
      ...recentCustomers.map(c => ({
        id: c._id,
        type: 'customer',
        title: `New Customer: ${c.name}`,
        description: c.company ? `${c.company} • ${c.email || ''}` : c.email || 'Added to CRM',
        time: c.createdAt,
      })),
      ...recentInvoices.map(i => ({
        id: i._id,
        type: 'invoice',
        title: `Invoice #${i.invoiceNumber}`,
        description: `$${i.total.toFixed(2)} - ${i.customerInfo.name} (${i.paymentStatus})`,
        time: i.createdAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

    // 10. AI Business Insight (Generated from real numbers)
    let aiInsight = 'Not enough business data is available to generate this insight.';
    if (formattedMonthlyRevenue.length >= 2) {
      const current = formattedMonthlyRevenue[formattedMonthlyRevenue.length - 1];
      const prev = formattedMonthlyRevenue[formattedMonthlyRevenue.length - 2];
      const change = prev.revenue > 0 ? (((current.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : 0;
      const topCat = formattedCategorySales[0]?.category || 'primary product line';

      if (Number(change) >= 0) {
        aiInsight = `Your revenue increased ${change}% this month compared to last month, driven predominantly by strong sales in ${topCat}.`;
      } else {
        aiInsight = `Revenue contracted by ${Math.abs(change)}% compared to last period. Increasing promotional focus on ${topCat} could reverse this trend.`;
      }
    } else if (totalRevenue > 0) {
      aiInsight = `Your workspace has generated $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} across ${totalOrders} orders. Maintaining average order value will drive steady growth.`;
    }

    res.json({
      success: true,
      kpis: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        paidRevenue: Number(paidRevenue.toFixed(2)),
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        pendingInvoices,
        pendingInvoicesTotal: Number(pendingInvoicesTotal.toFixed(2)),
      },
      charts: {
        monthlyRevenue: formattedMonthlyRevenue,
        categorySales: formattedCategorySales,
        orderStatusDistribution: formattedOrderStatus,
      },
      recentActivity: activities,
      aiInsight,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get detailed analytics page metrics with date filtering
// @route GET /api/analytics/detailed
export const getDetailedAnalytics = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.businessId);
    const { timeRange = '30d', startDate, endDate } = req.query;

    const { start, end } = getDateRange(timeRange, startDate, endDate);

    // Prior period for growth comparisons
    const durationMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - durationMs);
    const prevEnd = new Date(start.getTime());

    // Period Orders
    const periodOrdersAgg = await Order.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    // Prior Period Orders
    const priorPeriodOrdersAgg = await Order.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: prevStart, $lte: prevEnd },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);

    const periodRevenue = periodOrdersAgg[0]?.totalRevenue || 0;
    const periodOrdersCount = periodOrdersAgg[0]?.totalOrders || 0;
    const avgOrderValue = periodOrdersAgg[0]?.avgOrderValue || 0;
    const priorPeriodRevenue = priorPeriodOrdersAgg[0]?.totalRevenue || 0;

    const revenueGrowth = priorPeriodRevenue > 0
      ? Number((((periodRevenue - priorPeriodRevenue) / priorPeriodRevenue) * 100).toFixed(1))
      : periodRevenue > 0 ? 100 : 0;

    // Completed vs Cancelled
    const orderStatuses = await Order.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const completedOrders = orderStatuses.find(s => s._id === 'Completed')?.count || 0;
    const cancelledOrders = orderStatuses.find(s => s._id === 'Cancelled')?.count || 0;
    const processingOrders = orderStatuses.find(s => s._id === 'Processing')?.count || 0;
    const pendingOrders = orderStatuses.find(s => s._id === 'Pending')?.count || 0;

    // Best-Selling Products in period
    const topProducts = await Order.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'Cancelled' },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);

    // Customer Metrics
    const totalCustomers = await Customer.countDocuments({ businessId });
    const newCustomersInPeriod = await Customer.countDocuments({
      businessId,
      createdAt: { $gte: start, $lte: end },
    });

    // Top 5 customers by spend in period
    const topCustomers = await Order.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$total' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          name: '$customer.name',
          email: '$customer.email',
          company: '$customer.company',
          totalSpent: 1,
          ordersCount: 1,
        },
      },
    ]);

    // Inventory metrics
    const totalProducts = await Product.countDocuments({ businessId });
    const lowStockCount = await Product.countDocuments({ businessId, status: 'low_stock' });
    const outOfStockCount = await Product.countDocuments({ businessId, status: 'out_of_stock' });

    const inventoryValuation = await Product.aggregate([
      { $match: { businessId } },
      {
        $group: {
          _id: null,
          totalRetailValue: { $sum: { $multiply: ['$price', '$stock'] } },
          totalCostValue: { $sum: { $multiply: ['$cost', '$stock'] } },
          totalUnits: { $sum: '$stock' },
        },
      },
    ]);

    // Trend timeline chart data for this period (grouped by day or week)
    const timelineData = await Order.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      period: { start, end, timeRange },
      revenue: {
        periodRevenue: Number(periodRevenue.toFixed(2)),
        priorPeriodRevenue: Number(priorPeriodRevenue.toFixed(2)),
        revenueGrowth,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
      },
      sales: {
        totalOrders: periodOrdersCount,
        completedOrders,
        cancelledOrders,
        processingOrders,
        pendingOrders,
        topProducts,
      },
      customers: {
        totalCustomers,
        newCustomers: newCustomersInPeriod,
        returningCustomers: Math.max(0, totalCustomers - newCustomersInPeriod),
        topCustomers,
      },
      inventory: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalRetailValue: Number((inventoryValuation[0]?.totalRetailValue || 0).toFixed(2)),
        totalCostValue: Number((inventoryValuation[0]?.totalCostValue || 0).toFixed(2)),
        totalUnits: inventoryValuation[0]?.totalUnits || 0,
      },
      timeline: timelineData.map(d => ({
        date: d._id,
        revenue: Number(d.revenue.toFixed(2)),
        orders: d.orders,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Staff-safe summary — NO revenue, profit, invoice amounts, or customer spend
// @route GET /api/analytics/staff-summary
export const getStaffSummary = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.businessId);

    // Order status counts (pending & processing only)
    const orderStatusCounts = await Order.aggregate([
      { $match: { businessId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const countByStatus = {};
    for (const s of orderStatusCounts) {
      countByStatus[s._id] = s.count;
    }
    const pendingOrders = countByStatus['Pending'] || 0;
    const processingOrders = countByStatus['Processing'] || 0;

    // Low-stock products — no price/cost/revenue fields
    const lowStockProducts = await Product.find({
      businessId,
      $or: [{ status: 'low_stock' }, { status: 'out_of_stock' }],
    }).select('name sku stock lowStockThreshold status');

    // Total product count
    const totalProducts = await Product.countDocuments({ businessId });

    // Recent orders — stripped of all financial summary fields
    const recentOrders = await Order.find({ businessId })
      .populate('customerId', 'name')
      .sort('-createdAt')
      .limit(10)
      .select('orderNumber status paymentStatus createdAt customerId');

    const safeRecentOrders = recentOrders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      customerName: o.customerId?.name || 'Unknown',
    }));

    res.json({
      success: true,
      pendingOrders,
      processingOrders,
      totalProducts,
      lowStockProducts: lowStockProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        status: p.status,
      })),
      recentOrders: safeRecentOrders,
    });
  } catch (error) {
    next(error);
  }
};

