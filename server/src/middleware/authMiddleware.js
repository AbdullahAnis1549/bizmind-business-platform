import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Business from '../models/Business.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact your administrator.',
      });
    }

    // Enforce workspace suspension (super admins are never blocked by workspace suspension)
    if (user.role !== 'superadmin' && user.businessId) {
      const business = await Business.findById(user.businessId).select('status').lean();
      if (business && business.status === 'suspended') {
        return res.status(403).json({
          success: false,
          workspaceSuspended: true,
          message: 'This workspace has been suspended. Please contact platform support.',
        });
      }
    }

    req.user = user;
    req.businessId = user.businessId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'superadmin')) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};
