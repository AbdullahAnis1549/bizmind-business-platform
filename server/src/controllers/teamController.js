import crypto from 'crypto';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Helper to generate secure random temporary password (min 10 chars, with letter, number, special)
const generateTempPassword = () => {
  return 'Tmp-' + crypto.randomBytes(4).toString('hex') + '!' + crypto.randomInt(10, 99);
};

// @desc Get all workspace team members
// @route GET /api/team
export const getTeamMembers = async (req, res, next) => {
  try {
    const members = await User.find({ businessId: req.businessId })
      .select('-password')
      .sort('-createdAt');

    res.json({
      success: true,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add team member (formerly inviteMember)
// @route POST /api/team/invite or POST /api/team/add
export const inviteMember = async (req, res, next) => {
  try {
    const { name, email, role = 'staff', password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    if (!['manager', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "manager" or "staff".',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists in the system.',
      });
    }

    // Generate random temporary password if not provided or shorter than 8 chars
    const tempPassword = password && password.length >= 8 ? password : generateTempPassword();

    const member = await User.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      role,
      businessId: req.businessId,
      status: 'active',
      mustChangePassword: true,
    });

    await Notification.create({
      businessId: req.businessId,
      title: 'New Team Member Added',
      message: `${member.name} was added to the team as ${member.role.toUpperCase()}.`,
      type: 'team_invite',
      link: '/team',
    });

    res.status(201).json({
      success: true,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        mustChangePassword: member.mustChangePassword,
      },
      temporaryPassword: tempPassword,
      message: `Team member ${member.name} added successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update team member role
// @route PUT /api/team/:id/role
export const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['manager', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "manager" or "staff".',
      });
    }

    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found.',
      });
    }

    if (member._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Owners cannot change their own workspace role.',
      });
    }

    member.role = role;
    await member.save();

    res.json({
      success: true,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
      message: `Role updated to ${role}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Remove team member
// @route DELETE /api/team/:id
export const removeMember = async (req, res, next) => {
  try {
    const member = await User.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found.',
      });
    }

    if (member._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Workspace owner cannot be removed from their own business.',
      });
    }

    await member.deleteOne();

    res.json({
      success: true,
      message: 'Team member removed from workspace.',
    });
  } catch (error) {
    next(error);
  }
};
