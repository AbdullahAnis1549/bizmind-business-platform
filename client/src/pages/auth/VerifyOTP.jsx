import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/api';

export const VerifyOTP = () => {
  const { verifyOwnerOTP } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, maskedEmail } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Redirect if no email state (user came here directly)
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      // Auto-submit
      setTimeout(() => handleVerify(pasted), 100);
    }
  };

  const handleVerify = async (code) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) {
      toastError('Please enter the complete 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOwnerOTP(email, otpCode);
      toastSuccess(`Welcome back, ${res.user.name}! Identity verified.`);

      if (res.user.businessId) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      toastError(err.message || 'Invalid verification code.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      setResending(true);
      const res = await authService.resendOTP({ email });
      toastSuccess(res.message || 'New verification code sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toastError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-soft-lg border border-slate-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Security Verification
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          A 6-digit code has been sent to
        </p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <Mail className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-xs font-semibold text-slate-700">{maskedEmail}</span>
        </div>
      </div>

      {/* OTP Input Grid */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-700 mb-3 text-center">
          Enter verification code
        </label>
        <div className="flex items-center justify-center gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                ${digit
                  ? 'border-brand-500 bg-brand-50/50 text-brand-700 shadow-sm shadow-brand-500/10'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                }
                focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
              `}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      {/* Verify Button */}
      <button
        onClick={() => handleVerify()}
        disabled={loading || otp.join('').length !== 6}
        className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm shadow-brand-500/25"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Verify & Sign In</span>
          </>
        )}
      </button>

      {/* Resend Section */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 mb-2">
          Didn't receive the code?
        </p>
        {countdown > 0 ? (
          <p className="text-xs font-semibold text-slate-400">
            Resend available in <span className="text-brand-600 tabular-nums">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition disabled:opacity-50 flex items-center gap-1.5 mx-auto"
          >
            {resending ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" />
                <span>Resend verification code</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Back to Login */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <button
          onClick={() => navigate('/login')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to login</span>
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
