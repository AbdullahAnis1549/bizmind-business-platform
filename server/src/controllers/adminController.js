import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';
import { sendOTPEmail } from '../services/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
};

// @desc Super Admin Login (triggers mandatory 2FA email)
// @route POST /api/admin/login
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role !== 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is disabled.',
      });
    }

    // Always generate and require OTP for Super Admin
    const otp = generateOTP();
    user.loginOtp = hashOTP(otp);
    user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.loginOtpAttempts = 0;
    await user.save();

    // Send the code via configured SMTP. The OTP is NEVER written to logs.
    try {
      await sendOTPEmail(user.email, user.name || 'Platform Super Admin', otp);
    } catch (emailErr) {
      console.error('[Admin Security] Email sending error:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send security code. Please try again.',
      });
    }

    const parts = user.email.split('@');
    const maskedEmail = parts[0].substring(0, 2) + '***@' + parts[1];

    res.json({
      success: true,
      requiresOTP: true,
      email: user.email,
      maskedEmail,
      message: `Security code sent to ${maskedEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify Super Admin 2FA Code
// @route POST /api/admin/verify-otp
export const adminVerifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role !== 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative request.',
      });
    }

    if (!user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No active verification code. Please initiate admin sign-in again.',
      });
    }

    if (new Date() > user.loginOtpExpires) {
      user.loginOtp = null;
      user.loginOtpExpires = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please sign in again.',
      });
    }

    const candidateHash = hashOTP(otp);
    const storedBuf = Buffer.from(user.loginOtp, 'hex');
    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const isMatch = storedBuf.length === candidateBuf.length && crypto.timingSafeEqual(storedBuf, candidateBuf);

    if (!isMatch) {
      user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
      if (user.loginOtpAttempts >= 5) {
        // Lockout: invalidate the code so it cannot be brute-forced
        user.loginOtp = null;
        user.loginOtpExpires = null;
        user.loginOtpAttempts = 0;
        await user.save();
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. Code invalidated. Please sign in again.',
        });
      }
      await user.save();
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${5 - user.loginOtpAttempts} attempt(s) remaining.`,
      });
    }

    // Clear OTP on successful verification
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
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Resend Super Admin 2FA Code
// @route POST /api/admin/resend-otp
export const adminResendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role !== 'superadmin') {
      return res.status(401).json({ success: false, message: 'Invalid admin request.' });
    }

    // Resend is only allowed while a code from a PASSWORD-verified sign-in is still pending.
    // Without this, anyone who knows the admin email could trigger codes and brute-force them.
    if (!user.loginOtp || !user.loginOtpExpires || new Date() > user.loginOtpExpires) {
      return res.status(401).json({
        success: false,
        message: 'No active sign-in. Please sign in with your password again.',
      });
    }

    // NOTE: loginOtpAttempts is intentionally NOT reset here, so resending cannot
    // be used to get unlimited guesses.
    const otp = generateOTP();
    user.loginOtp = hashOTP(otp);
    user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(user.email, user.name || 'Platform Super Admin', otp);
    } catch (emailErr) {
      console.error('[Admin Security] Resend email failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend security code. Please try again.',
      });
    }

    res.json({
      success: true,
      message: 'New verification code sent to your inbox.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Platform KPI Summary
// @route GET /api/admin/stats
export const getPlatformStats = async (req, res, next) => {
  try {
    const [totalWorkspaces, activeWorkspaces, suspendedWorkspaces, totalUsers, totalOrders, totalInvoices, gmvAgg] = await Promise.all([
      Business.countDocuments(),
      Business.countDocuments({ status: { $ne: 'suspended' } }),
      Business.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: { $ne: 'superadmin' } }),
      Order.countDocuments(),
      Invoice.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalGMV: { $sum: '$total' } } },
      ]),
    ]);

    const totalGMV = gmvAgg[0]?.totalGMV || 0;

    res.json({
      success: true,
      stats: {
        totalWorkspaces,
        activeWorkspaces,
        suspendedWorkspaces,
        totalUsers,
        totalOrders,
        totalInvoices,
        totalGMV,
        systemStatus: 'Operational',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all registered workspaces with privacy-preserving aggregates
// @route GET /api/admin/workspaces
export const getWorkspaces = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    const businesses = await Business.find(query)
      .populate('ownerId', 'name email status createdAt')
      .sort({ createdAt: -1 });

    // Aggregate counts for each business without exposing individual private customer PII
    const results = await Promise.all(
      businesses.map(async (b) => {
        const [usersCount, productsCount, ordersCount, gmvData] = await Promise.all([
          User.countDocuments({ businessId: b._id }),
          Product.countDocuments({ businessId: b._id }),
          Order.countDocuments({ businessId: b._id }),
          Order.aggregate([
            { $match: { businessId: b._id, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, sum: { $sum: '$total' } } },
          ]),
        ]);

        return {
          id: b._id,
          name: b.name,
          type: b.type,
          industry: b.industry,
          country: b.country,
          currency: b.currency,
          size: b.size,
          email: b.email,
          phone: b.phone,
          status: b.status || 'active',
          owner: b.ownerId
            ? {
                id: b.ownerId._id,
                name: b.ownerId.name,
                email: b.ownerId.email,
              }
            : null,
          stats: {
            usersCount,
            productsCount,
            ordersCount,
            totalGMV: gmvData[0]?.sum || 0,
          },
          createdAt: b.createdAt,
        };
      })
    );

    res.json({
      success: true,
      count: results.length,
      workspaces: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Toggle workspace status (Active / Suspended)
// @route PUT /api/admin/workspaces/:id/status
export const toggleWorkspaceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active or suspended.',
      });
    }

    const business = await Business.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    res.json({
      success: true,
      message: `Workspace "${business.name}" is now ${status}.`,
      business,
    });
  } catch (error) {
    next(error);
  }
};
