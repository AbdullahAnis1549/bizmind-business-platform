import React from "react";

/**
 * Core Shimmer Skeleton Primitive with modern gradient wave
 */
export const Skeleton = ({ className = "" }) => {
  return <div className={`shimmer rounded-xl ${className}`} />;
};

/**
 * High-End Metric / KPI Card Skeleton
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-32 rounded-lg" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-3 w-12 rounded-md" />
      </div>
    </div>
  );
};

/**
 * Chart Box Skeleton with simulated axes and grid bars
 */
export const ChartSkeleton = ({ height = "h-72" }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <div className={`${height} w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-100`}>
        <Skeleton className="flex-1 h-[40%] rounded-t-lg" />
        <Skeleton className="flex-1 h-[65%] rounded-t-lg" />
        <Skeleton className="flex-1 h-[50%] rounded-t-lg" />
        <Skeleton className="flex-1 h-[85%] rounded-t-lg" />
        <Skeleton className="flex-1 h-[70%] rounded-t-lg" />
        <Skeleton className="flex-1 h-[95%] rounded-t-lg" />
      </div>
      <div className="flex justify-between px-2 pt-1">
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-2.5 w-8" />
      </div>
    </div>
  );
};

/**
 * Full Professional Table Skeleton (Search Bar + Filters + Header + Rows + Pagination)
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
      {/* Search & Actions Bar Placeholder */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/40">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1 rounded-md" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/30 transition">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-3/4 rounded-md" />
                <Skeleton className="h-2.5 w-1/2 rounded-md" />
              </div>
            </div>
            {Array.from({ length: cols - 1 }).map((_, c) => (
              <div key={c} className="flex-1">
                <Skeleton className={`h-3.5 ${c % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-md`} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Footer Placeholder */}
      <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
        <Skeleton className="h-3 w-32 rounded-md" />
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Complete Full-Screen Dashboard Skeleton
 * Mirrors the real Executive Dashboard 1:1 so there are no empty gaps or jarring layout jumps.
 */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-44 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* AI Strategic Insight Banner Skeleton */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-950 via-indigo-950 to-slate-900 border border-brand-900/50 shadow-soft relative overflow-hidden flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl shimmer-dark shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="shimmer-dark h-3 w-28 rounded-md" />
          <div className="shimmer-dark h-4 w-3/4 rounded-md" />
        </div>
        <div className="hidden md:block shimmer-dark h-8 w-28 rounded-xl" />
      </div>

      {/* 5 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Charts Grid Skeleton (2 Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton height="h-72" />
        </div>
        <div>
          <ChartSkeleton height="h-72" />
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Staff Dashboard Skeleton
 */
export const StaffDashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableSkeleton rows={4} cols={3} />
        <TableSkeleton rows={4} cols={3} />
      </div>
    </div>
  );
};

/**
 * Analytics Page Skeleton
 */
export const AnalyticsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-80" />
        <ChartSkeleton height="h-80" />
      </div>
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
};

export default Skeleton;
