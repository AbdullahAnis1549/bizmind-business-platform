import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Globe,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminLogin = () => {
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Check if already authenticated as superadmin
  useEffect(() => {
    const token = localStorage.getItem('bizmind_admin_token');
    const user = localStorage.getItem('bizmind_admin_user');
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === 'superadmin') {
          navigate('/admin/dashboard', { replace: true });
        }
      } catch (e) {
        localStorage.removeItem('bizmind_admin_token');
      }
    }
  }, [navigate]);

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onCredentialsSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await adminService.login({
        email: data.email.trim(),
        password: data.password,
      });

      if (res.requiresOTP) {
        setAdminEmail(res.email);
        setMaskedEmail(res.maskedEmail || res.email);
        setStep('otp');
        setCountdown(60);
        toastSuccess('Security verification code sent to your email.');
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      }
    } catch (err) {
      toastError(err.message || 'Administrative authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        submitOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
      setTimeout(() => submitOtp(pasted), 100);
    }
  };

  const submitOtp = async (code) => {
    const fullCode = code || otp.join('');
    if (fullCode.length !== 6) {
      toastError('Please enter the complete 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminService.verifyOTP({
        email: adminEmail,
        otp: fullCode,
      });

      if (res.success && res.token) {
        localStorage.setItem('bizmind_admin_token', res.token);
        localStorage.setItem('bizmind_admin_user', JSON.stringify(res.user));
        toastSuccess('Super Admin access granted.');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      toastError(err.message || 'Invalid verification code.');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      setResending(true);
      const res = await adminService.resendOTP({ email: adminEmail });
      toastSuccess(res.message || 'New verification code sent.');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      toastError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left Panel (matches AuthLayout style) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-950 to-brand-950 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight">
            BizMind <span className="text-brand-400">AI</span>
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Super Admin — Restricted Access
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Platform Master Console
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Securely manage all registered workspaces, platform health, and tenant activity from one unified administrative control center.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-brand-400 mb-2" />
              <h4 className="font-bold text-sm text-white">Workspace Directory</h4>
              <p className="text-xs text-slate-400 mt-1">View all registered businesses, tenants and owner accounts.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Globe className="w-6 h-6 text-indigo-400 mb-2" />
              <h4 className="font-bold text-sm text-white">Platform Analytics</h4>
              <p className="text-xs text-slate-400 mt-1">Monitor GMV, orders and system status across all workspaces.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Knowledge Tenant Isolation</span>
          </div>
          <span>v1.0.0 Production</span>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Back link */}
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspace Login
          </button>

          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-soft-lg border border-slate-100">

            {/* Header */}
            <div className="mb-8">
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-4 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-xl text-slate-900">BizMind AI</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold uppercase tracking-wider">
                  Super Admin Portal
                </span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {step === 'credentials' ? 'Admin Sign In' : 'Verify Identity'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {step === 'credentials'
                  ? 'Restricted to authorized platform administrators only.'
                  : `Enter the 6-digit code sent to ${maskedEmail}`}
              </p>
            </div>

            {/* ── Step 1: Credentials ── */}
            {step === 'credentials' ? (
              <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      {...register('email', {
                        required: 'Admin email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' },
                      })}
                      placeholder="admin@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-xs"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password', { required: 'Password is required' })}
                      placeholder="••••••••••••"
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

                {/* 2FA Notice */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-700 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Every admin sign-in requires a one-time 6-digit verification code sent to your registered email.
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-70 transition-all flex items-center justify-center gap-2 shadow-sm shadow-brand-500/25"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

            ) : (
              /* ── Step 2: OTP Verification ── */
              <div>
                {/* Code destination banner */}
                <div className="mb-6 p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-center">
                  <span className="text-[11px] text-brand-600 block mb-1">
                    A 6-digit security code was sent to:
                  </span>
                  <span className="text-xs font-mono font-bold text-brand-700">
                    {maskedEmail}
                  </span>
                </div>

                <label className="block text-xs font-semibold text-slate-700 mb-3 text-center">
                  Enter Verification Code
                </label>

                {/* OTP Inputs */}
                <div className="flex items-center justify-center gap-2.5 mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={loading}
                      className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all outline-none bg-white
                        ${digit
                          ? 'border-brand-500 text-brand-700 shadow-sm shadow-brand-500/20'
                          : 'border-slate-200 text-slate-900 hover:border-slate-300'
                        }
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                        disabled:opacity-60
                      `}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  onClick={() => submitOtp()}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm shadow-brand-500/25"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verify & Enter Console</span>
                    </>
                  )}
                </button>

                {/* Resend */}
                <div className="mt-5 text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-slate-500">
                      Resend available in{' '}
                      <span className="text-brand-600 font-mono font-semibold">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition inline-flex items-center gap-1.5"
                    >
                      {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                      Resend Verification Code
                    </button>
                  )}
                </div>

                {/* Back to credentials */}
                <button
                  onClick={() => {
                    setStep('credentials');
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition"
                >
                  ← Back to credentials
                </button>
              </div>
            )}

            {/* Security badge */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit encrypted • Zero-knowledge tenant isolation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
