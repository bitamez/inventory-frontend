import React from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, ArrowRightLeft,
  CheckSquare, FileText, Users, Shield, Settings, LogOut, Warehouse, X
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import companyLogo from '../assets/company-logo.jpg';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role_name || '';
  const isAdmin = role === 'Admin';
  const isManager = role === 'Admin' || role === 'Manager';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',          path: '/',           show: true },
    { icon: Package,         label: 'Products',           path: '/products',   show: true },
    { icon: ShoppingCart,    label: 'Sales',              path: '/sales',      show: true },
    { icon: ArrowRightLeft,  label: 'Stock Transactions', path: '/stock',      show: true },
    { icon: Warehouse,       label: 'Inventory',          path: '/inventory',  show: true },
    { icon: CheckSquare,     label: 'Approvals',          path: '/approvals',  show: isManager },
    { icon: FileText,        label: 'Reports',            path: '/reports',    show: isManager },
    { icon: Users,           label: 'Users',              path: '/users',      show: isAdmin },
    { icon: Shield,          label: 'Roles',              path: '/roles',      show: isAdmin },
    { icon: Settings,        label: 'Settings',           path: '/settings',   show: isAdmin },
  ].filter(item => item.show);

  return (
    <aside
      className={clsx(
        // Base: fixed full-height sidebar
        'fixed left-0 top-0 h-screen z-50 w-64 bg-surface border-r border-border flex flex-col text-textMuted',
        // Mobile: slide in/out as a drawer
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: always visible
        'lg:translate-x-0 print:hidden'
      )}
    >
      {/* Logo + close button (mobile) */}
      <div className="p-5 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-3">
          <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <h1 className="font-bold text-sm tracking-wide leading-tight text-textMain">Inventory &amp; Sales</h1>
            <p className="text-[10px] text-textMuted">Management System</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-surfaceHighlight transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col space-y-0.5 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium',
              isActive
                ? 'bg-surfaceHighlight text-textMain'
                : 'hover:bg-surfaceHighlight hover:text-textMain'
            )}
          >
            <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-border space-y-1">
        {user && (
          <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-surfaceHighlight/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-textMain truncate">{user.full_name}</p>
              <p className="text-xs text-textMuted truncate">{user.role_name}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2.5 w-full text-sm font-medium rounded-xl hover:bg-danger/10 hover:text-danger transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
