export const requireBusiness = (req, res, next) => {
  if (!req.user || !req.user.businessId) {
    return res.status(403).json({
      success: false,
      requiresOnboarding: true,
      message: 'Workspace onboarding is required before accessing business resources.',
    });
  }
  req.businessId = req.user.businessId;
  next();
};
