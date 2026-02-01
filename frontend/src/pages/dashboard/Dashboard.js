/**
 * Dashboard. Role-based widgets and quick stats.
 */
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, role } = useAuth();

  return (
    <>
      <h2 className="page-title">Welcome back, {user?.name}</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Manage work orders, customers, inventory, and billing from one place.
      </p>
      <div className="grid-3">
        <div className="stat-card card">
          <div className="stat-label">Work orders</div>
          <div className="stat-value">—</div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Coming soon
          </p>
        </div>
        <div className="stat-card card">
          <div className="stat-label">Customers</div>
          <div className="stat-value">—</div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Coming soon
          </p>
        </div>
        <div className="stat-card card">
          <div className="stat-label">Open invoices</div>
          <div className="stat-value">—</div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Coming soon
          </p>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-body">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
            Quick actions
          </h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            Use the sidebar to open Work Orders, Customers, Inventory, Billing, and Reports. 
            {role === 'Admin' && ' Settings is available for tenant and user management.'}
          </p>
        </div>
      </div>
    </>
  );
}
