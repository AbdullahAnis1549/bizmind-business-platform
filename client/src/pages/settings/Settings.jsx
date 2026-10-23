import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Building2,
  Lock,
  Sparkles,
  ShieldCheck,
  Globe,
  Coins,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, businessService, aiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../../components/common/ImageUpload';

export const Settings = () => {
  const { user, business, refreshUser, updateBusinessState } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [aiStatus, setAiStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);

  // Profile Form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    watch: watchProfile,
    setValue: setProfileValue,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  // Password Form
  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm();

  // Business Form
  const {
    register: regBiz,
    handleSubmit: handleBizSubmit,
    reset: resetBiz,
  } = useForm({
    defaultValues: {
      name: business?.name || '',
      type: business?.type || '',
      industry: business?.industry || '',
      country: business?.country || '',
      currency: business?.currency || 'USD',
      size: business?.size || '',
      phone: business?.phone || '',
      address: business?.address || '',
      taxNumber: business?.taxNumber || '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        avatar: user.avatar || '',
      });
    }
    if (business) {
      resetBiz({
        name: business.name || '',
        type: business.type || '',
        industry: business.industry || '',
        country: business.country || '',
        currency: business.currency || 'USD',
        size: business.size || '',
        phone: business.phone || '',
        address: business.address || '',
        taxNumber: business.taxNumber || '',
      });
    }

    const loadAI = async () => {
      try {
        const res = await aiService.getStatus();
        if (res.success) setAiStatus(res);
      } catch (err) {
        console.error(err);
      }
    };
    loadAI();
  }, [user, business, resetProfile, resetBiz]);

  const onUpdateProfile = async (data) => {
    try {
      setProfileLoading(true);
      const res = await authService.updateProfile(data);
      if (res.success) {
        toastSuccess('Profile updated successfully.');
        refreshUser();
      }
    } catch (err) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      setPasswordLoading(true);
      const res = await authService.changePassword(data);
      if (res.success) {
        toastSuccess('Password updated successfully.');
        resetPass();
      }
    } catch (err) {
      toastError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const onUpdateBusiness = async (data) => {
    try {
      setBusinessLoading(true);
      const res = await businessService.updateBusiness(data);
      if (res.success) {
        toastSuccess('Business settings updated.');
        updateBusinessState(res.business);
      }
    } catch (err) {
      toastError(err.message || 'Failed to update business settings.');
    } finally {
      setBusinessLoading(false);
    }
  };

  const isOwner = user?.role === 'owner' || user?.role === 'superadmin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal account, company profile, and AI copilot settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'business', label: 'Workspace & Company', icon: Building2 },
          { id: 'security', label: 'Password & Security', icon: Lock },
          { id: 'ai', label: 'AI Configuration', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
                isActive
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-6">
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...regProfile('name', { required: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <ImageUpload
              label="Avatar Image"
              value={watchProfile('avatar') || ''}
              onChange={(val) => setProfileValue('avatar', val, { shouldDirty: true })}
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 transition shadow-sm"
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Workspace & Business */}
      {activeTab === 'business' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-6">
          {!isOwner && (
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Workspace settings can only be altered by the workspace Owner.</span>
            </div>
          )}

          <form onSubmit={handleBizSubmit(onUpdateBusiness)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Workspace Name</label>
              <input
                type="text"
                disabled={!isOwner}
                {...regBiz('name', { required: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  {...regBiz('industry')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Currency</label>
                <select
                  disabled={!isOwner}
                  {...regBiz('currency')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  {...regBiz('country')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled={!isOwner}
                  {...regBiz('phone')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Address</label>
              <input
                type="text"
                disabled={!isOwner}
                {...regBiz('address')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Registration / VAT Number</label>
              <input
                type="text"
                disabled={!isOwner}
                {...regBiz('taxNumber')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {isOwner && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={businessLoading}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 transition shadow-sm"
                >
                  {businessLoading ? 'Saving...' : 'Update Workspace Details'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-6">
          <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                {...regPass('currentPassword', { required: 'Current password is required' })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {passErrors.currentPassword && (
                <p className="text-xs text-rose-500 mt-1">{passErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Min 6 chars)</label>
              <input
                type="password"
                {...regPass('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters required' },
                })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {passErrors.newPassword && (
                <p className="text-xs text-rose-500 mt-1">{passErrors.newPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 transition shadow-sm"
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: AI Settings */}
      {activeTab === 'ai' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">AI Intelligence Core</h3>
              <p className="text-xs text-slate-400">Model specifications and data privacy architecture</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Operation Mode</span>
              {aiStatus?.hasApiKey ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> AI connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Rule-based mode
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Provider</span>
              <span className="text-xs font-bold text-slate-900">{aiStatus?.provider || 'Rule-based engine'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Model</span>
              <span className="text-xs font-mono font-semibold text-slate-700">{aiStatus?.model || 'Rule-based calculations (no model)'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs text-brand-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-brand-800">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Strict Data Isolation Policy
            </h4>
            <p className="leading-relaxed">
              Financial numbers always come from MongoDB calculations; external LLMs only format and explain them.
              {aiStatus?.hasApiKey
                ? ` Currently connected to ${aiStatus.provider} (${aiStatus.model}).`
                : ' Currently running in rule-based mode. Add an AI key in server/.env to enable the AI assistant.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
