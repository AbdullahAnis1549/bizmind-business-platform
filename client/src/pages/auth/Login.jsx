import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('bizmind_remember') === 'true';
  });
  const navigate = useNavigate();

  const rememberedEmail = localStorage.getItem('bizmind_remember') === 'true'
    ? (localStorage.getItem('bizmind_remembered_email') || '')
    : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: rememberedEmail,
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await login(data.email.trim(), data.password);

      // Persist or remove remembered email
      if (rememberMe) {
        localStorage.setItem('bizmind_remembered_email', data.email.trim());
        localStorage.setItem('bizmind_remember', 'true');
      } else {
        localStorage.removeItem('bizmind_remembered_email');
        localStorage.setItem('bizmind_remember', 'false');
      }

      // Owner requires OTP verification if enabled
      if (res.requiresOTP) {
        toastInfo(res.message || 'Verification code sent to your email.');
        navigate('/verify-otp', {
          state: { email: res.email, maskedEmail: res.maskedEmail },
        });
        return;
      }

      toastSuccess(`Welcome back, ${res.user.name}!`);

      if (res.user.businessId) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      toastError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toastInfo('To reset your password, contact your workspace owner or system administrator.');
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-soft-lg border border-slate-100">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900">BizMind AI</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Sign in to access your business intelligence dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Work email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' },
              })}
              placeholder="you@company.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-xs"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 transition"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20 cursor-pointer"
            />
            <span className="text-xs text-slate-600 font-medium">Remember my email</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-70 transition-all flex items-center justify-center gap-2 shadow-sm shadow-brand-500/25"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authenticating...
            </span>
          ) : (
            <>
              <span>Sign in to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Security badge */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>256-bit encrypted • Enterprise multi-tenant isolation</span>
      </div>

      <div className="mt-5 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition">
          Create workspace
        </Link>
      </div>
    </div>
  );
};

export default Login;
