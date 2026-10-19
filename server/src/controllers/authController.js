import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { sendOTPEmail } from '../services/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Generate a 6-digit numeric OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash OTP using SHA-256
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
};

// @desc Register user
// @route POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'owner', // Initial registrant is the owner of their future workspace
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: null,
        avatar: user.avatar,
      },
      message: 'Account created successfully. Please complete workspace onboarding.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user (with optional OTP for owner accounts)
// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('businessId');
    // Super admins must sign in through /api/admin/login (mandatory 2FA); never here.
    if (!user || user.role === 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact your workspace administrator.',
      });
    }

    if (user.businessId && user.businessId.status === 'suspended') {
      return res.status(403).json({
        success: false,
        workspaceSuspended: true,
        message: 'This workspace has been suspended. Please contact platform support.',
      });
    }

    const enableOtp = process.env.ENABLE_OTP === 'true';

    // If user is owner and OTP is enabled, require OTP verification
    if (user.role === 'owner' && enableOtp) {
      const otp = generateOTP();
      user.loginOtp = hashOTP(otp);
      user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      user.loginOtpAttempts = 0;
      await user.save();

      // Send OTP via email
      try {
        await sendOTPEmail(user.email, user.name, otp);
      } catch (emailErr) {
        console.error('[Auth] OTP email failed:', emailErr.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code. Please try again.',
        });
      }

      // Mask email for security display
      const parts = user.email.split('@');
      const maskedLocal = parts[0].substring(0, 2) + '***';
      const maskedEmail = maskedLocal + '@' + parts[1];

      return res.json({
        success: true,
        requiresOTP: true,
        email: user.email,
        maskedEmail,
        message: `Verification code sent to ${maskedEmail}`,
      });
    }

    // Direct login when OTP is disabled or for other roles (manager, staff)
    const token = generateToken(user._id);

    res.json({
      success: true,
      requiresOTP: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        business: user.businessId,
        businessId: user.businessId ? (user.businessId._id || user.businessId) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify OTP for owner login
// @route POST /api/auth/verify-otp
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('businessId');
    if (!user || user.role === 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid request.',
      });
    }

    if (user.businessId && user.businessId.status === 'suspended') {
      return res.status(403).json({
        success: false,
        workspaceSuspended: true,
        message: 'This workspace has been suspended. Please contact platform support.',
      });
    }

    // Check if OTP exists and is not expired
    if (!user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please login again.',
      });
    }

    if (new Date() > user.loginOtpExpires) {
      user.loginOtp = null;
      user.loginOtpExpires = null;
      user.loginOtpAttempts = 0;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please login again.',
      });
    }

    const candidateHash = hashOTP(otp);
    const storedBuf = Buffer.from(user.loginOtp, 'hex');
    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const isMatch = storedBuf.length === candidateBuf.length && crypto.timingSafeEqual(storedBuf, candidateBuf);

    if (!isMatch) {
      user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
      if (user.loginOtpAttempts >= 5) {
        user.loginOtp = null;
        user.loginOtpExpires = null;
        user.loginOtpAttempts = 0;
        await user.save();
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. Verification code invalidated. Please login again.',
        });
      }
      await user.save();
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${5 - user.loginOtpAttempts} attempt(s) remaining.`,
      });
    }

    // OTP verified — clear it and issue token
    user.loginOtp = null;
    user.loginOtpExpires = null;
    user.loginOtpAttempts = 0;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        business: user.businessId,
        businessId: user.businessId ? (user.businessId._id || user.businessId) : null,
      },
      message: 'Identity verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Resend OTP for owner login
// @route POST /api/auth/resend-otp
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request.',
      });
    }

    const otp = generateOTP();
    user.loginOtp = hashOTP(otp);
    user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.loginOtpAttempts = 0;
    await user.save();

    try {
      await sendOTPEmail(user.email, user.name, otp);
    } catch (emailErr) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend verification code.',
      });
    }

    const parts = user.email.split('@');
    const maskedLocal = parts[0].substring(0, 2) + '***';
    const maskedEmail = maskedLocal + '@' + parts[1];

    res.json({
      success: true,
      maskedEmail,
      message: `New verification code sent to ${maskedEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user
// @route GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('businessId');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        business: user.businessId,
        businessId: user.businessId ? user.businessId._id : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update profile
// @route PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        businessId: user.businessId,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Change password
// @route PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
