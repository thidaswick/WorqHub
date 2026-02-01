/**
 * Main layout: sidebar + header. Use for tenant-scoped pages.
 */
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/work-orders', label: 'Work Orders', end: false },
  { to: '/customers', label: 'Customers', end: false },
  { to: '/inventory', label: 'Inventory', end: false },
  { to: '/billing', label: 'Billing', end: false },
  { to: '/reports', label: 'Reports', end: false },
];

const pathToTitle = {
  '/': 'Dashboard',
  '/work-orders': 'Work Orders',
  '/work-orders/new': 'New work order',
  '/customers': 'Customers',
  '/customers/new': 'New customer',
  '/inventory': 'Inventory',
  '/inventory/new': 'New inventory item',
  '/billing': 'Billing',
  '/billing/new': 'New invoice',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

function getPageTitle(pathname) {
  if (pathToTitle[pathname]) return pathToTitle[pathname];
  if (/^\/work-orders\/[^/]+\/edit/.test(pathname)) return 'Edit work order';
  if (/^\/customers\/[^/]+\/edit/.test(pathname)) return 'Edit customer';
  if (/^\/inventory\/[^/]+\/edit/.test(pathname)) return 'Edit inventory item';
  const base = pathname.split('/')[1];
  return pathToTitle[`/${base}`] || 'Dashboard';
}

export default function MainLayout() {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Worqhub</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          {role === 'Admin' && (
            <NavLink
              to="/settings"
              end={false}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              Settings
            </NavLink>
          )}
        </nav>
      </aside>
      <div className="main-content">
        <header className="header">
          <h1 className="header-title">{pageTitle}</h1>
          <div className="header-user">
            <span>{user?.name}</span>
            <span style={{ color: 'var(--color-border)', fontWeight: 400 }}>·</span>
            <span>{role}</span>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Log out
            </button>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
