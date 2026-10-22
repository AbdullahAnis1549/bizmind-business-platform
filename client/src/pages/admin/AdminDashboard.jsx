import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  TrendingUp,
  Package,
  ShoppingCart,
  Search,
  Filter,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  Globe,
  Sparkles,
  Info,
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();

  const [stats, setStats] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const adminUser = JSON.parse(localStorage.getItem('bizmind_admin_user') || '{}');

  // Verify auth on mount
  useEffect(() => {
    const token = localStorage.getItem('bizmind_admin_token');
    if (!token || adminUser.role !== 'superadmin') {
      navigate('/admin', { replace: true });
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, workspacesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getWorkspaces({ search, status: statusFilter }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (workspacesRes.success) setWorkspaces(workspacesRes.workspaces);
    } catch (err) {
      toastError(err.message || 'Failed to load platform data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadWorkspacesOnly();
  };

  const loadWorkspacesOnly = async () => {
    try {
      const res = await adminService.getWorkspaces({ search, status: statusFilter });
      if (res.success) setWorkspaces(res.workspaces);
    } catch (err) {
      toastError(err.message || 'Search failed.');
    }
  };

  const toggleStatus = async (workspace) => {
    const newStatus = workspace.status === 'suspended' ? 'active' : 'suspended';
    try {
      setActionLoadingId(workspace.id);
      const res = await adminService.updateWorkspaceStatus(workspace.id, newStatus);
      if (res.success) {
        toastSuccess(res.message);
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === workspace.id ? { ...w, status: newStatus } : w))
        );
        if (selectedWorkspace?.id === workspace.id) {
          setSelectedWorkspace((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toastError(err.message || 'Failed to update workspace status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('bizmind_admin_token');
    localStorage.removeItem('bizmind_admin_user');
    toastSuccess('Super Admin signed out safely.');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Super Admin Executive Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                BizMind <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 uppercase tracking-wider">
                Master Console
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-Tenant Global Platform Infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform Online</span>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">
                {adminUser.name || 'Platform Admin'}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {adminUser.email || 'abdullahanis592@gmail.com'}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Terminate Admin Session"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* KPI Platform Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Platform Health & Global Metrics</span>
              <span className="text-xs text-slate-500 font-normal">Real-time aggregate data</span>
            </h2>
            <button
              onClick={loadData}
              disabled={loading}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Workspaces */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Workspaces
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mt-3 tabular-nums">
                {stats?.totalWorkspaces ?? '—'}
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{stats?.activeWorkspaces ?? 0} active</span>
                <span>•</span>
                <span className="text-rose-400 font-semibold">{stats?.suspendedWorkspaces ?? 0} suspended</span>
              </div>
            </div>

            {/* Card 2: Platform Users */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Platform Users
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mt-3 tabular-nums">
                {stats?.totalUsers ?? '—'}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Owners, Managers & POS Staff
              </div>
            </div>

            {/* Card 3: Platform Gross Volume */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Platform GMV
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mt-3 tabular-nums">
                ${stats?.totalGMV ? Number(stats.totalGMV).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Cumulative revenue processed across stores
              </div>
            </div>

            {/* Card 4: Platform Orders */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mt-3 tabular-nums">
                {stats?.totalOrders ?? '—'}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Across all registered businesses
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces Directory Section */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Registered Workspaces Directory</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-mono font-semibold">
                  {workspaces.length} Found
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Manage business tenants, review aggregate activity, and enforce platform policies.
              </p>
            </div>

            {/* Filter and Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search business, country, industry..."
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-60 transition"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setTimeout(() => loadData(), 50);
                }}
                className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-sm shadow-indigo-600/30"
              >
                Search
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                  <th className="py-3.5 px-4">Workspace / Business</th>
                  <th className="py-3.5 px-4">Owner Contact</th>
                  <th className="py-3.5 px-4">Country & Industry</th>
                  <th className="py-3.5 px-4 text-center">Team / Products</th>
                  <th className="py-3.5 px-4 text-center">Orders & GMV</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {workspaces.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      No workspaces match your search criteria.
                    </td>
                  </tr>
                ) : (
                  workspaces.map((w) => (
                    <tr
                      key={w.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition">
                          {w.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ID: <span className="font-mono text-[10px]">{w.id.substring(0, 10)}...</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{w.owner?.name || 'Owner N/A'}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{w.owner?.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{w.industry || 'General Business'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>{w.country || 'Global'} ({w.currency || 'USD'})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="text-slate-200 font-semibold">{w.stats?.usersCount || 0} members</div>
                        <div className="text-[11px] text-slate-400">{w.stats?.productsCount || 0} catalog items</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-emerald-400">
                          ${Number(w.stats?.totalGMV || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400">{w.stats?.ordersCount || 0} orders processed</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {w.status === 'suspended' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedWorkspace(w)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          >
                            Inspect
                          </button>

                          <button
                            onClick={() => toggleStatus(w)}
                            disabled={actionLoadingId === w.id}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                              w.status === 'suspended'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                            }`}
                          >
                            {actionLoadingId === w.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                            ) : w.status === 'suspended' ? (
                              'Activate'
                            ) : (
                              'Suspend'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Privacy & SOC Compliance Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-200/80 leading-relaxed">
              <strong className="text-indigo-200">Zero-Knowledge Tenant Data Privacy:</strong> In compliance with enterprise multi-tenant software standards, the Super Admin console displays high-level operational statistics and business metadata without exposing private customer personal identifiers, credit cards, or internal workspace AI conversations.
            </div>
          </div>
        </div>
      </main>

      {/* Inspect Workspace Modal */}
      {selectedWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                  Tenant Workspace Metadata
                </span>
                <h3 className="text-xl font-bold text-white">{selectedWorkspace.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Created {new Date(selectedWorkspace.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Owner Name</span>
                  <span className="text-white font-semibold text-sm">{selectedWorkspace.owner?.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Owner Email</span>
                  <span className="text-white font-mono text-xs">{selectedWorkspace.owner?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Industry & Type</span>
                  <span className="text-white font-semibold">{selectedWorkspace.industry} • {selectedWorkspace.type}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Country & Currency</span>
                  <span className="text-white font-semibold">{selectedWorkspace.country} ({selectedWorkspace.currency})</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold block mb-2">
                  Aggregated Workspace Performance
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-base font-bold text-white">{selectedWorkspace.stats?.usersCount}</div>
                    <div className="text-[10px] text-slate-400">Team Members</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{selectedWorkspace.stats?.ordersCount}</div>
                    <div className="text-[10px] text-slate-400">Orders Processed</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-emerald-400">
                      ${Number(selectedWorkspace.stats?.totalGMV || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Total Volume</div>
                  </div>
                </div>
              </div>

              {selectedWorkspace.phone || selectedWorkspace.address ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  {selectedWorkspace.phone && <div><strong>Phone:</strong> {selectedWorkspace.phone}</div>}
                  {selectedWorkspace.address && <div><strong>Address:</strong> {selectedWorkspace.address}</div>}
                </div>
              ) : null}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => toggleStatus(selectedWorkspace)}
                disabled={actionLoadingId === selectedWorkspace.id}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedWorkspace.status === 'suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                }`}
              >
                {selectedWorkspace.status === 'suspended' ? 'Reactivate Workspace' : 'Suspend Workspace'}
              </button>

              <button
                onClick={() => setSelectedWorkspace(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
