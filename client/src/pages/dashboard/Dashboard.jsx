import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { analyticsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton, StaffDashboardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ---------------------------------------------------------------------------
// Staff Dashboard — safe operational view, no revenue data
// ---------------------------------------------------------------------------
const StaffDashboard = () => {
  const { business } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getStaffSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  if (loading) {
    return <StaffDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          icon={AlertTriangle}
          title="Could not load dashboard"
          description={error}
          actionLabel="Retry"
          onAction={fetchStaffData}
        />
      </div>
    );
  }

  const pendingOrders = data?.pendingOrders ?? 0;
  const processingOrders = data?.processingOrders ?? 0;
  const totalProducts = data?.totalProducts ?? 0;
  const lowStockProducts = data?.lowStockProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Staff Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Operational view for <span className="font-semibold text-slate-700">{business?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="staff-refresh-btn"
            onClick={fetchStaffData}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white transition shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/orders?action=new"
            id="staff-create-order-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold transition shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </Link>
        </div>
      </div>

      {/* KPI cards — operational only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{pendingOrders}</div>
          <div className="mt-2 text-xs text-slate-500">Awaiting fulfilment</div>
        </div>

        {/* Processing Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Processing</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{processingOrders}</div>
          <div className="mt-2 text-xs text-slate-500">In progress</div>
        </div>

        {/* Products */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalProducts}</div>
          <div className="mt-2 text-xs">
            {lowStockProducts.length > 0 ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {lowStockProducts.length} low in stock
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Stock healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Low Stock Items</span>
          </div>
          <div className="space-y-1">
            {lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{p.name} {p.sku && <span className="text-slate-400">({p.sku})</span>}</span>
                <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.stock} left / threshold {p.lowStockThreshold}
                </span>
              </div>
            ))}
          </div>
          <Link to="/products" className="inline-block mt-3 text-xs font-semibold text-amber-700 hover:underline">
            View Inventory →
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">Recent Orders</h3>
          <Link to="/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
            View All →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No orders yet.</div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">{o.orderNumber}</p>
                    <p className="text-xs text-slate-500">{o.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    o.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    o.status === 'Processing' ? 'bg-indigo-100 text-indigo-700' :
                    o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {o.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Manager/Owner full Dashboard
// ---------------------------------------------------------------------------
export const Dashboard = () => {
  const { business, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Staff sees a different, restricted dashboard
  if (user?.role === 'staff') {
    return <StaffDashboard />;
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getDashboardKPIs();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cur = business?.currency || 'USD';

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          icon={AlertTriangle}
          title="Could not load dashboard metrics"
          description={error}
          actionLabel="Retry Loading"
          onAction={fetchDashboardData}
        />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];
  const aiInsight = data?.aiInsight || '';

  return (
    <div className="space-y-6 content-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time business intelligence for <span className="font-semibold text-slate-700">{business?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="dashboard-refresh-btn"
            onClick={fetchDashboardData}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white transition shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/orders?action=new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold transition shadow-sm shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </Link>
        </div>
      </div>

      {/* AI Business Insight Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-900 to-navy-900 text-white shadow-soft-lg relative overflow-hidden flex items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-brand-300">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
              AI Strategic Insight
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
              Verified MongoDB Metrics
            </span>
          </div>
          <p className="text-sm sm:text-base font-medium text-slate-100 leading-snug">
            {aiInsight}
          </p>
        </div>
        <Link
          to="/ai-assistant"
          className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition whitespace-nowrap"
        >
          <span>Ask Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {cur} {kpis.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">{cur} {kpis.paidRevenue?.toLocaleString()}</span>
            <span>paid</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpis.totalOrders || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across active channels
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpis.totalCustomers || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Registered accounts
          </div>
        </div>

        {/* Products in Catalog */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpis.totalProducts || 0}
          </div>
          <div className="mt-2 text-xs">
            {kpis.lowStockProducts > 0 ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {kpis.lowStockProducts} low in stock
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Stock healthy</span>
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpis.pendingInvoices || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Valued at <span className="font-semibold text-slate-700">{cur} {kpis.pendingInvoicesTotal?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time (Area Chart) - Spans 2 cols */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                Revenue Trajectory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly revenue trend over the past 6 billing cycles
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700">
              Monthly
            </span>
          </div>

          <div className="h-72 w-full">
            {charts.monthlyRevenue && charts.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No revenue timeline recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution (Donut Chart) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
              Order Fulfillment Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution across lifetime orders</p>
          </div>

          <div className="h-56 my-2">
            {charts.orderStatusDistribution && charts.orderStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                  >
                    {charts.orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No orders recorded yet.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {charts.orderStatusDistribution?.map((item, idx) => (
              <div key={item.status} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-600 font-medium truncate">{item.status}:</span>
                <span className="font-bold text-slate-800 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Sales by Category & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Category (Bar Chart) - 2 cols */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                Category Sales Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top grossing merchandise categories
              </p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
              View Catalog →
            </Link>
          </div>

          <div className="h-64 w-full">
            {charts.categorySales && charts.categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.categorySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No category sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
              Live Workspace Activity
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent events logged.
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                    {act.type === 'order' && <ShoppingCart className="w-4 h-4 text-brand-600" />}
                    {act.type === 'customer' && <Users className="w-4 h-4 text-emerald-600" />}
                    {act.type === 'invoice' && <FileText className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {act.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <Link
              to="/orders"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
            >
              View Full Transaction History →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
