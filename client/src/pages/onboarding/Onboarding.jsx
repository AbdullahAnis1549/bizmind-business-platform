import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Building2,
  Globe,
  Coins,
  Users2,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bot,
  BarChart3,
  Package,
} from 'lucide-react';
import { businessService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Onboarding = () => {
  const { updateBusinessState, refreshUser } = useAuth();
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [completedBusiness, setCompletedBusiness] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      type: 'E-commerce & Retail',
      industry: 'Smart Home & Lifestyle',
      country: 'United States',
      currency: 'USD',
      size: '1-10 employees',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await businessService.onboard(data);
      if (res.success) {
        updateBusinessState(res.business);
        await refreshUser();
        setCompletedBusiness(res.business);
      }
    } catch (err) {
      toastError(err.message || 'Failed to complete workspace onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = () => {
    navigate('/dashboard');
  };

  // Welcome Screen (Step 2)
  if (completedBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-soft-lg border border-slate-100 p-8 sm:p-12 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/25">
            <Sparkles className="w-8 h-8" />
          </div>

          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider mb-3">
            Setup Complete
          </span>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to BizMind AI
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-lg mx-auto">
            Your workspace <strong className="text-slate-900 font-semibold">"{completedBusiness.name}"</strong> has been successfully configured and secured with multi-tenant data isolation.
          </p>

          {/* Platform Capability Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Bot className="w-6 h-6 text-brand-600 mb-2" />
              <h4 className="font-bold text-sm text-slate-800">AI Business Assistant</h4>
              <p className="text-xs text-slate-500 mt-1">Ask questions about sales, revenue, and customer metrics.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <BarChart3 className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-bold text-sm text-slate-800">Real-Time Analytics</h4>
              <p className="text-xs text-slate-500 mt-1">Live MongoDB aggregates calculate true gross volume & profit.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Package className="w-6 h-6 text-emerald-600 mb-2" />
              <h4 className="font-bold text-sm text-slate-800">Smart Operations</h4>
              <p className="text-xs text-slate-500 mt-1">Orders auto-decrement inventory and trigger low-stock alerts.</p>
            </div>
          </div>

          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 transition shadow-md shadow-brand-500/25 inline-flex items-center justify-center gap-2"
          >
            <span>Launch My Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Onboarding Form (Step 1)
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-soft-lg border border-slate-100 p-8 sm:p-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Onboarding
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Set up your Business Workspace
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tell us about your company so BizMind AI can tailor metrics, currency, and AI recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                {...register('name', { required: 'Business name is required' })}
                placeholder="e.g. Aura Home & Living"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Type</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  {...register('type')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                >
                  <option value="E-commerce & Retail">E-commerce & Retail</option>
                  <option value="Direct-to-Consumer">Direct-to-Consumer</option>
                  <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Industry</label>
              <input
                type="text"
                {...register('industry')}
                placeholder="e.g. Home Decor & Lifestyle"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('country')}
                  placeholder="e.g. United States"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Operating Currency</label>
              <div className="relative">
                <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  {...register('currency')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Team Size</label>
            <div className="relative">
              <Users2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                {...register('size')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              >
                <option value="1-5 employees">1 - 5 employees</option>
                <option value="6-20 employees">6 - 20 employees</option>
                <option value="21-50 employees">21 - 50 employees</option>
                <option value="50+ employees">50+ employees</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-70 transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/25"
          >
            {loading ? 'Creating Workspace...' : 'Complete Setup & Enter Platform'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
