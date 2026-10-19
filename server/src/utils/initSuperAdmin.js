import User from '../models/User.js';

/**
 * Creates the platform super admin on first boot.
 *
 * Security notes:
 *  - Email and initial password come ONLY from env (ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD).
 *    There is no hardcoded fallback password.
 *  - The password is never printed to the logs.
 *  - An existing regular account is NEVER auto-promoted to superadmin
 *    (registration has no email verification, so promotion would be an escalation path).
 */
export const initSuperAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || '';

    if (!adminEmail) {
      console.warn('[SuperAdmin] ADMIN_EMAIL is not set. Super admin bootstrap skipped.');
      return;
    }

    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      if (existing.role !== 'superadmin') {
        console.warn(
          `[SuperAdmin] ${adminEmail} already exists as a regular '${existing.role}' account and will NOT be promoted. ` +
            'Use a different ADMIN_EMAIL or fix the role manually in the database.'
        );
      }
      return;
    }

    if (adminPassword.length < 12) {
      console.warn(
        '[SuperAdmin] ADMIN_INITIAL_PASSWORD is missing or shorter than 12 characters. Super admin NOT created.'
      );
      return;
    }

    await User.create({
      name: 'Master Platform Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin',
      status: 'active',
    });
    console.log(`[SuperAdmin] Master account created for ${adminEmail}`);
  } catch (error) {
    console.error('[SuperAdmin] Failed to initialize master admin:', error.message);
  }
};

export default initSuperAdmin;
