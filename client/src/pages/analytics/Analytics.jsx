import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '../../services/api';
import { CardSkeleton, TableSkeleton } from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Analytics = () => {
  const { business } = useAuth();
  const { toastError } = useToast();

  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDetailedAnalytics({ timeRange });
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const cur = business?.currency || 'USD';
  const rev = data?.revenue || {};
  const sales = data?.sales || {};
  const customers = data?.customers || {};
  const inventory = data?.inventory || {};
  const timeline = data?.timeline || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Business Intelligence & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historical cohort analysis, revenue velocity, and merchandise performance.
          </p>
        </div>

        {/* Time Range Filter Bar */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: '1 Year' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`px-3 py-1.5 rounded-xl transition ${
                timeRange === r.id
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={4} cols={4} />
        </div>
      ) : (
        <>
          {/* Revenue & Growth Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Period Revenue */}
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Period Revenue
                </span>
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {cur} {rev.periodRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                {rev.revenueGrowth >= 0 ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{rev.revenueGrowth}%
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {rev.revenueGrowth}%
                  </span>
                )}
                <span className="text-slate-400">vs prior period</span>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Avg Order Value (AOV)
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {cur} {rev.avgOrderValue?.toFixed(2) || '0.00'}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Gross basket average
              </div>
            </div>

            {/* Order Volume */}
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Orders in Period
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {sales.totalOrders || 0}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span className="font-semibold text-emerald-600">{sales.completedOrders || 0} completed</span> •{' '}
                <span className="text-rose-500">{sales.cancelledOrders || 0} cancelled</span>
              </div>
            </div>

            {/* Inventory Valuation */}
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Inventory Value
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {cur} {inventory.totalRetailValue?.toLocaleString() || '0'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Cost Basis: <span className="font-semibold">{cur} {inventory.totalCostValue?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Revenue Trend Chart */}
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                  Daily Revenue Performance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated transaction volume within selected filter window
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              {timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
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
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#analyticsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No orders recorded during this period.
                </div>
              )}
            </div>
          </div>

          {/* Best Selling Products & Top Customers Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <h3 className="font-heading font-bold text-base text-slate-900 mb-1">
                Best-Selling Products (In Period)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Ranked by revenue generation</p>

              {sales.topProducts?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No product sales in this timeframe.</div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {sales.topProducts?.map((p, idx) => (
                    <div key={p._id || idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-slate-400 font-mono text-[10px]">SKU: {p.sku || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">${p.revenue.toLocaleString()}</div>
                        <div className="text-slate-500 text-[11px]">{p.unitsSold} units</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Customers */}
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-soft">
              <h3 className="font-heading font-bold text-base text-slate-900 mb-1">
                Top Client Spend Accounts
              </h3>
              <p className="text-xs text-slate-500 mb-4">Key accounts contributing to revenue</p>

              {customers.topCustomers?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No customer purchases in this timeframe.</div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {customers.topCustomers?.map((c, idx) => (
                    <div key={c._id || idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-slate-400 text-[10px]">{c.company || c.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">${c.totalSpent.toLocaleString()}</div>
                        <div className="text-slate-500 text-[11px]">{c.ordersCount} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
