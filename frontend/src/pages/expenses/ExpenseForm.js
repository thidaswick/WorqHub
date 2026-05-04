/**
 * Create or edit an expense (amount in LKR).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as expensesApi from '../../api/expenses';
import { useRecordFormMode } from '../../hooks/useRecordFormMode';

const CATEGORIES = [
  { value: 'supplies', label: 'Supplies' },
  { value: 'travel', label: 'Travel' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'rent', label: 'Rent' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

function todayInputDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ExpenseForm() {
  const { id, readOnly, isEditRoute, isCreate } = useRecordFormMode();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    amount: '',
    expenseDate: todayInputDate(),
    category: 'other',
    description: '',
    vendor: '',
    paymentMethod: 'bank_transfer',
    notes: '',
  });

  useEffect(() => {
    if (!isCreate && id) {
      expensesApi
        .get(id)
        .then((res) => {
          const data = res.data?.data ?? res.data ?? res;
          const raw = data.expenseDate ? new Date(data.expenseDate) : new Date();
          const y = raw.getFullYear();
          const m = String(raw.getMonth() + 1).padStart(2, '0');
          const day = String(raw.getDate()).padStart(2, '0');
          setForm({
            amount: data.amount != null ? String(data.amount) : '',
            expenseDate: `${y}-${m}-${day}`,
            category: data.category || 'other',
            description: data.description ?? '',
            vendor: data.vendor ?? '',
            paymentMethod: data.paymentMethod || 'other',
            notes: data.notes ?? '',
          });
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load expense'))
        .finally(() => setLoading(false));
    }
  }, [id, isCreate]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    setError('');
    const amt = Number(String(form.amount).replace(/,/g, ''));
    if (!Number.isFinite(amt) || amt < 0) {
      setError('Enter a valid amount (LKR).');
      return;
    }
    if (!form.expenseDate) {
      setError('Expense date is required.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(form.expenseDate).trim())) {
      setError('Invalid date.');
      return;
    }

    setSaving(true);
    const payload = {
      amount: Math.round(amt * 100) / 100,
      expenseDate: String(form.expenseDate).trim(),
      category: form.category || 'other',
      description: form.description.trim() || undefined,
      vendor: form.vendor.trim() || undefined,
      paymentMethod: form.paymentMethod || 'other',
      notes: form.notes.trim() || undefined,
    };

    const promise = isEditRoute ? expensesApi.update(id, payload) : expensesApi.create(payload);
    promise
      .then(() => navigate('/expenses'))
      .catch((err) => {
        const data = err.response?.data;
        const msg =
          (data && typeof data === 'object' && data.message) ||
          (typeof data === 'string' ? data : null) ||
          err.message ||
          'Failed to save expense';
        setError(msg);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: 200 }}>
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      <div className="page-toolbar">
        <h2 className="page-title">
          {readOnly ? 'Expense' : isEditRoute ? 'Edit expense' : 'Record expense'}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {readOnly && id ? (
            <Link to={`/expenses/${id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          ) : null}
          <Link to="/expenses" className="btn btn-secondary">
            Back to list
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card card-body" style={{ maxWidth: 560 }}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-section">
          <h3 className="form-section-title">Expense</h3>
          <div className="form-group">
            <label className="label" htmlFor="expenseDate">
              Date *
            </label>
            <input
              id="expenseDate"
              type="date"
              className="input"
              value={form.expenseDate}
              onChange={(e) => update('expenseDate', e.target.value)}
              readOnly={readOnly}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="amount">
              Amount (LKR) *
            </label>
            <input
              id="amount"
              type="number"
              className="input"
              min={0}
              step="any"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              placeholder="0.00"
              readOnly={readOnly}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="input"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              disabled={readOnly}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              type="text"
              className="input"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What was paid for"
              readOnly={readOnly}
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="vendor">
              Vendor / payee
            </label>
            <input
              id="vendor"
              type="text"
              className="input"
              value={form.vendor}
              onChange={(e) => update('vendor', e.target.value)}
              placeholder="Supplier or person"
              readOnly={readOnly}
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="paymentMethod">
              Payment method
            </label>
            <select
              id="paymentMethod"
              className="input"
              value={form.paymentMethod}
              onChange={(e) => update('paymentMethod', e.target.value)}
              disabled={readOnly}
            >
              {PAYMENT_METHODS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              className="input"
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Optional internal notes"
              readOnly={readOnly}
            />
          </div>
        </div>

        <div className="form-actions">
          {!readOnly ? (
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEditRoute ? 'Save changes' : 'Record expense'}
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}
