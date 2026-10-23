import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Lock,
  CheckCircle2,
  User,
  Plus,
  Copy,
  Check,
} from 'lucide-react';
import { teamService } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const TeamManagement = () => {
  const { user: currentUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add member modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviting, setInviting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teamService.getTeamMembers();
      if (res.success) {
        setMembers(res.members);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      setInviting(true);
      const res = await teamService.inviteMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        password: invitePassword || undefined,
      });

      if (res.success) {
        toastSuccess(`Team member ${inviteName} added!`);
        if (res.temporaryPassword) {
          setCreatedCredentials({
            name: inviteName,
            email: inviteEmail,
            role: inviteRole,
            password: res.temporaryPassword,
          });
        }
        setInviteOpen(false);
        setInviteName('');
        setInviteEmail('');
        setInvitePassword('');
        setInviteRole('staff');
        fetchMembers();
      }
    } catch (err) {
      toastError(err.message || 'Failed to add team member.');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await teamService.updateRole(memberId, newRole);
      if (res.success) {
        toastSuccess(`Member role updated to ${newRole}.`);
        setMembers((prev) =>
          prev.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
        );
      }
    } catch (err) {
      toastError(err.message || 'Could not update role.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      setDeleting(true);
      await teamService.removeMember(memberToDelete._id);
      toastSuccess('Team member removed from workspace.');
      setDeleteOpen(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (err) {
      toastError(err.message || 'Failed to remove team member.');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'superadmin';
  // Manager can also add/remove team members (staff only)
  const canManageTeam = isOwner || currentUser?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team & Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage workspace collaborators, access tiers, and role-based permissions.
          </p>
        </div>

        {canManageTeam && (
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold transition shadow-sm shadow-brand-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Role Explanations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 uppercase tracking-wider">
            Owner
          </span>
          <h4 className="font-bold text-sm text-slate-900 mt-2">Full Workspace Control</h4>
          <p className="text-xs text-slate-500 mt-1">
            Complete business settings, financials, team management, and workspace deletion.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase tracking-wider">
            Manager
          </span>
          <h4 className="font-bold text-sm text-slate-900 mt-2">Operational Management</h4>
          <p className="text-xs text-slate-500 mt-1">
            Manage customers, products, inventory, orders, invoices, and analytics insights.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
            Staff
          </span>
          <h4 className="font-bold text-sm text-slate-900 mt-2">Operational Access</h4>
          <p className="text-xs text-slate-500 mt-1">
            Create customer orders, process transactions, and access the AI Copilot.
          </p>
        </div>
      </div>

      {/* Member List */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Member</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined On</th>
                  {canManageTeam && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {members.map((m) => {
                  const isSelf = m._id === currentUser?.id;
                  const isOwnerMember = m.role === 'owner';

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-slate-200 shrink-0 bg-slate-100">
                          <img
                            src={
                              m.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=4f46e5&color=fff&bold=true`
                            }
                            alt={m.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{m.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {m.email}
                      </td>

                      <td className="py-3.5 px-4">
                        {isOwner && !isOwnerMember ? (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m._id, e.target.value)}
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="manager">Manager</option>
                            <option value="staff">Staff</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              m.role === 'owner'
                                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                : m.role === 'manager'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {m.role}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>

                      {canManageTeam && (
                        <td className="py-3.5 px-4 text-right">
                          {!isOwnerMember && !isSelf && (
                            <button
                              onClick={() => {
                                setMemberToDelete(m);
                                setDeleteOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Add Workspace Member"
        subtitle="Add a collaborator with secure role-based access"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Rachel Adams"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="rachel@company.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Access Level
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {isOwner && <option value="manager">Manager (CRM, Orders, Analytics, AI)</option>}
              <option value="staff">Staff (Orders, Catalog)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password (Optional)
            </label>
            <input
              type="text"
              value={invitePassword}
              onChange={(e) => setInvitePassword(e.target.value)}
              placeholder="Auto-generated if left blank (min 8 chars)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to automatically generate a secure random password.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-70 rounded-xl transition shadow-sm"
            >
              {inviting ? 'Adding...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Temporary Password Modal */}
      {createdCredentials && (
        <Modal
          isOpen={!!createdCredentials}
          onClose={() => setCreatedCredentials(null)}
          title="Team Member Credentials"
          subtitle="Temporary credentials generated for this account"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              Provide these login credentials to <strong>{createdCredentials.name}</strong>. They must change their password after signing in.
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold capitalize text-slate-800">{createdCredentials.role}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-md border border-brand-200">
                    {createdCredentials.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.password);
                      setCopiedPassword(true);
                      setTimeout(() => setCopiedPassword(false), 2000);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Copy password"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Remove Team Member?"
        message={`Are you sure you want to remove ${memberToDelete?.name} from this workspace? They will immediately lose access.`}
        confirmText="Remove Member"
      />
    </div>
  );
};

export default TeamManagement;
