import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Bot,
  FileSpreadsheet,
  PenTool,
  UserCheck,
  Settings,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Business',
      items: [
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Orders', path: '/orders', icon: ShoppingCart },
        { name: 'Invoices', path: '/invoices', icon: FileText, roles: ['owner', 'manager'] },
      ],
    },
    {
      title: 'Insights',
      items: [
        { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['owner', 'manager'] },
        { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI', roles: ['owner', 'manager'] },
        { name: 'AI Reports', path: '/ai-reports', icon: FileSpreadsheet, roles: ['owner', 'manager'] },
      ],
    },
    {
      title: 'Tools',
      items: [
        { name: 'Content Generator', path: '/ai-content', icon: PenTool, badge: 'AI' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { name: 'Team Members', path: '/team', icon: UserCheck, roles: ['owner', 'manager'] },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg text-slate-900 tracking-tight leading-tight">
                  BizMind <span className="text-brand-600">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">
                  Business Intelligence
                </span>
              </div>
            )}
          </NavLink>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationSections.map((section, idx) => {
            // Filter section items by user role
            const visibleItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(user?.role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {section.title}
                  </h4>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive
                            ? 'text-brand-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between">
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xs">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-200/80 bg-slate-50/50">
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Multi-Tenant Secured</span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
