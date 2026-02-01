/**
 * Reports page. Summaries and analytics.
 */
import React, { useState, useEffect } from 'react';
import * as reportsApi from '../../api/reports';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    reportsApi
      .dashboard()
      .then((res) => setSummary(res.data?.data ?? res.data ?? null))
      .catch((err) => {
        if (err.response?.status === 404) {
          setSummary(null);
        } else {
          setError(err.response?.data?.message || 'Failed to load report');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: 200 }}>
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">Reports</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
        Overview of work orders, revenue, and activity.
      </p>

      {error && (
        <div className="login-error" style={{ marginBottom: '1rem' }} role="alert">
          {error}
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card card">
          <div className="stat-label">Work orders (this month)</div>
          <div className="stat-value">{summary?.workOrdersThisMonth ?? '—'}</div>
        </div>
        <div className="stat-card card">
          <div className="stat-label">Revenue (this month)</div>
          <div className="stat-value">
            {summary?.revenueThisMonth != null ? `$${Number(summary.revenueThisMonth).toFixed(0)}` : '—'}
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-label">Open invoices</div>
          <div className="stat-value">{summary?.openInvoices ?? '—'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
            Work order stats
          </h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            Detailed breakdown by status and date range will appear here once the reports API is connected.
          </p>
        </div>
      </div>
    </>
  );
}
