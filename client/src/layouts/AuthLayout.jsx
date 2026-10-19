import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthLayout = () => {
  const { isAuthenticated, needsOnboarding } = useAuth();

  if (isAuthenticated) {
    if (needsOnboarding) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Marketing / Value Proposition Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-950 to-brand-950 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight">
            BizMind <span className="text-brand-400">AI</span>
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation SaaS Platform
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Intelligent Business Management, Powered by Real Data.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Eliminate guesswork. BizMind AI continuously connects your customers, catalog, orders, and finances to a smart AI Copilot grounded strictly in your verified business metrics.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <BarChart3 className="w-6 h-6 text-brand-400 mb-2" />
              <h4 className="font-bold text-sm text-white">Live Aggregated BI</h4>
              <p className="text-xs text-slate-400 mt-1">Accurate profit, revenue velocity and inventory tracking.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Zap className="w-6 h-6 text-indigo-400 mb-2" />
              <h4 className="font-bold text-sm text-white">AI Business Copilot</h4>
              <p className="text-xs text-slate-400 mt-1">Ask strategic questions about your real store performance.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Tenant Enterprise Isolation</span>
          </div>
          <span>v1.0.0 Production</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
