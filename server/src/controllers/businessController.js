import Business from '../models/Business.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc Onboard and create workspace
// @route POST /api/business/onboard
export const onboard = async (req, res, next) => {
  try {
    const { name, type, industry, country, currency, size } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Business name is required.',
      });
    }

    // Check if user already has a business
    const user = await User.findById(req.user._id);
    if (user.businessId) {
      const existing = await Business.findById(user.businessId);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'User already has an active workspace.',
        });
      }
    }

    const business = await Business.create({
      name,
      type: type || 'Retail',
      industry: industry || 'General',
      country: country || 'United States',
      currency: (currency || 'USD').toUpperCase(),
      size: size || '1-10 employees',
      ownerId: user._id,
      email: user.email,
    });

    user.businessId = business._id;
    user.role = 'owner';
    await user.save();

    // Create initial welcome notification
    await Notification.create({
      businessId: business._id,
      title: 'Welcome to BizMind AI!',
      message: `Your workspace "${business.name}" has been successfully set up. Start by adding customers, products, or exploring the AI Assistant.`,
      type: 'system',
      link: '/dashboard',
    });

    res.status(201).json({
      success: true,
      business,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        businessId: business._id,
      },
      message: 'Workspace created successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current business
// @route GET /api/business
export const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business workspace not found.',
      });
    }

    res.json({
      success: true,
      business,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update business settings
// @route PUT /api/business
export const updateBusiness = async (req, res, next) => {
  try {
    const { name, type, industry, country, currency, size, phone, address, taxNumber, email } = req.body;

    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business workspace not found.',
      });
    }

    if (name) business.name = name;
    if (type) business.type = type;
    if (industry) business.industry = industry;
    if (country) business.country = country;
    if (currency) business.currency = currency.toUpperCase();
    if (size) business.size = size;
    if (phone !== undefined) business.phone = phone;
    if (address !== undefined) business.address = address;
    if (taxNumber !== undefined) business.taxNumber = taxNumber;
    if (email !== undefined) business.email = email;

    await business.save();

    res.json({
      success: true,
      business,
      message: 'Business settings updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
