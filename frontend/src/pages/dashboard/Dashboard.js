/**
 * Dashboard with insights: charts, metrics, activity feed, orders.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import * as workOrdersApi from '../../api/workOrders';
import * as customersApi from '../../api/customers';
import * as billingApi from '../../api/billing';
import * as inventoryApi from '../../api/inventory';

const LOW_STOCK_THRESHOLD = 10;

const revenueExpenseData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 19 },
  { month: 'Mar', value: 28 },
  { month: 'Apr', value: 22 },
  { month: 'May', value: 30 },
  { month: 'Jun', value: 26 },
  { month: 'Jul', value: 30 },
];

const ordersData = [
  { name: '1', value: 15 },
  { name: '2', value: 28 },
  { name: '3', value: 22 },
  { name: '4', value: 35 },
  { name: '5', value: 18 },
  { name: '6', value: 32 },
  { name: '7', value: 25 },
];

const COLORS = ['#F06021', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#d94e0f'];

const activityData = [
  { emp: 'Emp 1', desc: 'Lorem ipsum dolor', status: 'Pending', time: '1:54 PM' },
  { emp: 'Emp 2', desc: 'Lorem ipsum dolor', status: 'Completed', time: '12:11 PM' },
  { emp: 'Emp 3', desc: 'Lorem ipsum dolor', status: 'Pending', time: 'Yesterday at 6:21 PM' },
  { emp: 'Emp 4', desc: 'Lorem ipsum dolor', status: 'Completed', time: '20 Feb at 1:54 PM' },
];

export default function Dashboard() {
  // eslint-disable-next-line no-unused-vars
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ workOrders: 0, customers: 0, invoices: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState({ count: 0, items: [], threshold: LOW_STOCK_THRESHOLD });
  const [lowStockError, setLowStockError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      workOrdersApi.list().catch(() => ({ data: [] })),
      customersApi.list().catch(() => ({ data: [] })),
      billingApi.listInvoices().catch(() => ({ data: [] })),
      inventoryApi.lowStock({ threshold: LOW_STOCK_THRESHOLD, limit: 15 }).catch(() => ({ _failed: true })),
    ]).then(([woRes, custRes, invRes, lowRes]) => {
      const orders = woRes.data?.data ?? woRes.data ?? [];
      const customers = custRes.data?.data ?? custRes.data ?? [];
      const invoices = invRes.data?.data ?? invRes.data ?? [];
      const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
      setStats({
        workOrders: orders.length,
        customers: customers.length,
        invoices: invoices.length,
        totalRevenue,
      });
      const orderRows = invoices.slice(0, 5).map((inv, i) => ({
        name: `C${i + 1}`,
        amount: inv.total != null ? `Rs. ${Number(inv.total).toFixed(0)}/=` : '—',
        time: inv.createdAt ? new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        status: inv.status === 'paid' ? 'Completed' : 'Pending',
      }));
      setRecentOrders(orderRows.length > 0 ? orderRows : [
        { name: 'C1', amount: 'Rs. 1507/=', time: '1:57 PM', status: 'Completed' },
        { name: 'C5', amount: 'Rs. 2504/=', time: '1:57 PM', status: 'Pending' },
        { name: 'C6', amount: 'Rs. 1802/=', time: '1:57 PM', status: 'Completed' },
      ]);

      if (lowRes?._failed) {
        setLowStockError(true);
      } else {
        setLowStockError(false);
        const lowPayload = lowRes?.data ?? lowRes;
        if (lowPayload && typeof lowPayload.count === 'number') {
          setLowStock({
            count: lowPayload.count,
            items: Array.isArray(lowPayload.items) ? lowPayload.items : [],
            threshold: lowPayload.threshold ?? LOW_STOCK_THRESHOLD,
          });
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const csv = [
      ['Month', 'Revenue/Expense'].join(','),
      ...revenueExpenseData.map((d) => [d.month, d.value].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card dashboard-chart-card">
          <h3 className="dashboard-card-title">Monthly Revenue vs Expenses</h3>
          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueExpenseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[10, 30]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#F06021" strokeWidth={3} dot={{ fill: '#F06021', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Total Orders</h3>
            <button type="button" className="btn btn-primary btn-export" onClick={handleExport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export data
            </button>
          </div>
          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[10, 40]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ordersData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card dashboard-stack-card">
          <div className="dashboard-stack-card-section">
            <h3 className="dashboard-stack-card-heading">Inventory</h3>
            {loading && (
              <p className="dashboard-stock-placeholder">Checking stock levels…</p>
            )}
            {!loading && lowStockError && (
              <p className="dashboard-stock-placeholder dashboard-stock-placeholder--warn" role="status">
                Could not load inventory. Try again or open Inventory.
              </p>
            )}
            {!loading && !lowStockError && lowStock.count > 0 && (
              <div className="dashboard-low-stock-inline" role="alert">
                <div className="dashboard-low-stock-inline-header">
                  <span className="dashboard-low-stock-inline-icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <strong className="dashboard-low-stock-inline-title">Low stock</strong>
                </div>
                <p className="dashboard-low-stock-inline-text">
                  {lowStock.count === 1
                    ? `1 item under ${lowStock.threshold} units.`
                    : `${lowStock.count} items under ${lowStock.threshold} units.`}
                </p>
                <ul className="dashboard-low-stock-inline-list">
                  {lowStock.items.map((row) => (
                    <li key={row._id}>
                      <span className="dashboard-low-stock-name">{row.name}</span>
                      <span className="dashboard-low-stock-meta">
                        {row.sku ? `${row.sku} · ` : ''}
                        {row.quantity == null ? 0 : Number(row.quantity)} {row.unit || 'unit'}
                      </span>
                    </li>
                  ))}
                </ul>
                {lowStock.count > lowStock.items.length && (
                  <p className="dashboard-low-stock-more">
                    +{lowStock.count - lowStock.items.length} more
                  </p>
                )}
                <Link to="/inventory" className="dashboard-low-stock-link">
                  Manage inventory
                </Link>
              </div>
            )}
            {!loading && !lowStockError && lowStock.count === 0 && (
              <div className="dashboard-stock-ok" role="status">
                <span className="dashboard-stock-ok-title">Stock levels OK</span>
                <p className="dashboard-stock-ok-text">
                  No items below {LOW_STOCK_THRESHOLD} units.
                </p>
                <Link to="/inventory" className="dashboard-low-stock-link dashboard-stock-ok-link">
                  View inventory
                </Link>
              </div>
            )}
          </div>
          <div className="dashboard-stack-card-divider" />
          <Link to="/work-orders/new" className="dashboard-new-task dashboard-new-task--stacked">
            <span className="dashboard-new-task-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <div className="dashboard-new-task-content">
              <span className="dashboard-new-task-label">New task</span>
              <span className="dashboard-new-task-hint">Create a work order</span>
            </div>
          </Link>
        </div>

        <div className="dashboard-card dashboard-revenue-card">
          <div className="dashboard-revenue-header">
            <span className="dashboard-revenue-label">Total Revenue</span>
            <span className="dashboard-revenue-badge">+18.7%</span>
          </div>
          <div className="dashboard-revenue-value">
            {loading ? '—' : stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString() : '135,200'}
            <span className="dashboard-revenue-currency"> LKR</span>
          </div>
        </div>

        <div className="dashboard-card dashboard-table-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Recent Activity Feed</h3>
            <Link to="/work-orders" className="dashboard-view-all">View all</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Desc</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activityData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.emp}</td>
                    <td>{row.desc}</td>
                    <td>
                      <span className={`badge ${row.status === 'Completed' ? 'badge-completed' : 'badge-in_progress'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card dashboard-table-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Orders</h3>
            <Link to="/billing" className="dashboard-view-all">View all</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>{row.amount}</td>
                    <td>{row.time}</td>
                    <td>
                      <span className={`badge ${row.status === 'Completed' ? 'badge-completed' : 'badge-in_progress'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
